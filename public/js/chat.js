const socket = io() // io() initializes connection

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarUsersTemplate = document.querySelector('#sidebarusers-template').innerHTML
const sidebarRoomTemplate = document.querySelector('#sidebarroom-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); // location.search contains the query string and parse will create an object with all the fields
// By default it includes the ? in the first field, so have to use ignoreQueryPrefix to ignore the ?


const autoscroll = () => {


	// New message element
	const $newMessage = $messages.lastElementChild;
	// const element=$messages.lastElementChild
	// element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
	
	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
	// offsetHeight returns the layout height of an element as an integer.
	// It is measured in pixels. It includes height, border, padding and horizontal scrollbars, but not
	// the margin

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight; 

	// How far have I scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight; // ScrollTop gives the distance I have scrolled from the top to the top of the scroll bar

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}

}

socket.on('message', (msg) => { // When receiving a message. The first argument is the event name
	const html = Mustache.render(messageTemplate, {
		username: msg.username,
		createdAt: moment(msg.createdAt).format('h:mm a'),
		message: msg.text
	}); // The second argument is an object with key value pairs of the arguments bening passed
	$messages.insertAdjacentHTML('beforeEnd',html);
	autoscroll();
})

socket.on('locationMessage', (url) => {
	const html = Mustache.render(locationTemplate, {
		username: url.username,
		createdAt: moment(url.createdAt).format('h:mm a'),
		url: url.url
	});
	$messages.insertAdjacentHTML('beforeEnd',html);
	autoscroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarUsersTemplate, {
                room,
		users
        }); // The second argument is an object with key value pairs of the arguments bening passed
	document.querySelector('#sidebar-users').innerHTML = html;
})


socket.on('roomsList', ( {rooms} ) => {
        const html = Mustache.render(sidebarRoomTemplate, {rooms});
	document.querySelector('#sidebar-room').innerHTML = html;

});


$messageForm.addEventListener('submit', (e) => {
	e.preventDefault(); // This prevenets the default behavior for this event and in case of forms it doesnt empty out the field once the send button is pressed

	// Now we want to disable the form so the same more data cannot be sent till the previous one is done
	$messageFormButton.setAttribute('disabled','disabled');

	const message  = e.target.elements.message.value // Another way of getting the input field

	socket.emit('sendMessage',message, (error) => {
		// Now that the message has been sent, we want to enable the form, clear the input and
		// bring it back in focus
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log('Message Delivered');
	});
		
});

$sendLocationButton.addEventListener('click', () => {
	if (!navigator.geolocation) { // navigator is the object that has location. It might not be present on old browsers
		return alert('Geolocation is not supported by your browser');
	}
		
	$sendLocationButton.setAttribute('disabled','disabled');

	navigator.geolocation.getCurrentPosition((position) => {
	// This is an async function, but doesnt support promises or async/await
		const coordinates =  {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
			};

		socket.emit('sendLocation',coordinates, () => {
			console.log('Location shared!');
		});
		$sendLocationButton.removeAttribute('disabled');
	});
});
		
socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/'; // redirect to home page in case of an error
	}
});

$(document).on('dblclick','.rooms li', function() {
// Have to double click when selecting on room to switch
//
//
	const newroom = $(this).text();
	if ( room !== newroom ) {
		socket.emit('switchRoom', username, newroom );
		const href = `http://${location.host}${location.pathname}?username=${username}&room=${newroom}`
		// have to use https for hosting on heroku, but testing it locally have to use http
		location.href = href;
		// Go to the new room
	}

});

