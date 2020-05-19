const users = [];

const addUser = ({ id, username, room })  => {
// Add a new user based on username and room
	// clean the data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();
	

	// Validate the data
	if (!username || !room) {
		return {
			error: 'Username and room are required'
		}
	}

	// Check for existing user
	const existingUser = users.find((user) => {
		// return user.room === room && user.username === username
		// Now users can change rooms so have to make sure username is not duplicated regardless of the room
		return user.username === username
	});

	// Validate username
	if (existingUser) {
		return {
			error: 'Username is in use'
		}
	}

	const user = {id, username, room};
	users.push(user);
	return {user};
}


const removeUser = (id) => {
// remove a user based on the id
	const index = users.findIndex((user) => user.id === id);

	
	if (index !== -1) {
		return users.splice(index,1)[0]; // splice returns an array b/c we can remove multiple items. We just want to remove the first one as we are only expecting one user
	}
}

const getUser = (id) => {
	return user = users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
	return usersInRoom = users.filter((user) => user.room === room);
}	

const getRoomsListOLD = () => {
const rooms = users.map((user) => user.room);
                 return [...new Set(rooms)];
}
const getRoomsList = () => {
// This function will get a list of all distinct rooms with at least one user
	const rooms = users.map((user) => user.room);
	// This array could have duplicate entries
	const uniqueRooms =  [...new Set(rooms)];
	
	const roomAndUsers = [];
	uniqueRooms.forEach((room) => {
		count = users.reduce(( n, user) => {
			return (n + ( user.room === room || 0 ))},0);
	roomdata = {room,count};
	roomAndUsers.push(roomdata)	
	});


	// Sort the room list by the number of users in the room
	roomAndUsers.sort((a,b) =>  (a.count < b.count) ? 1 : -1);

	return roomAndUsers
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	getRoomsList
}
