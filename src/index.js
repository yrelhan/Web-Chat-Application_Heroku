const http = require('http');
const express = require('express');
const path = require('path'); // This is a core node module,s o no need to install it
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom, getRoomsList } = require('./utils/users');

const app = express();
const server = http.createServer(app); // Express actually the server behind the scenes, but then we dont have access to it. Here we are explicitly creating the server
const io = socketio(server); // scoetio expects to be called with the raw HTTP server.


const port = process.env.PORT  || 3000;
const publicDirectoryPath = path.join(__dirname,'../public');


app.use(express.static(publicDirectoryPath));


io.on('connection', (socket) => {
// socket is an object and contains information about the new connection
	console.log('New Websocket connection'); // Print a message when a new client connects
	
	socket.emit('roomsList', {
		rooms: getRoomsList()
	});

	
	socket.on('join', ({ username, room }, callback) => {
		const {error, user}  = addUser({ id: socket.id, username, room});
		 // Try to add the user which either returns an error or the added user
		
		if (error) {
			return callback(error);
		}

	
		socket.join(user.room) 
	
		socket.emit('message',generateMessage('Admin',`Welcome ${user.username}`));
		socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the room`)); // This will send a message to everone except the socket sending the message in that particular room			
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});

		io.emit('roomsList', {
			rooms: getRoomsList()
		});

		callback();

	});

	socket.on('sendMessage', (message, callback) => {
	// callback is the function from the client which confirms the receipt of the data
		const filter = new Filter();
		const user = getUser(socket.id);
		
		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		io.to(user.room).emit('message',generateMessage(user.username,message));
		callback();
	});

	socket.on('sendLocation', (coordinates, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`)); // This is to call the google maps API
		callback();
	});

	socket.on('switchRoom', (username, room) => {
		socket.leave(socket.room);
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`));
                        io.to(user.room).emit('roomData', {
                        	room: user.room,
                        	users: getUsersInRoom(user.room)
                        });

                        io.emit('roomsList', {
                        	rooms: getRoomsList()
                	});

		}
	});


	socket.on('disconnect', (id) => {
	// This is the built in method when a user disconects
		// Earlier we were sedning a message to all the users in the application
		// io.emit('message',generateMessage('A user has left!'));
	
		const user = removeUser(socket.id);

		if (user) {
		// Now we only want to send to the users in that chat root
			io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`));
			io.to(user.room).emit('roomData', {
                        room: user.room,
                        users: getUsersInRoom(user.room)
                	});

			io.emit('roomsList', {
                        rooms: getRoomsList()
                });


		}
	});

});



server.listen(port, () => {
	console.log(`server listenining on ${port}`);
});
