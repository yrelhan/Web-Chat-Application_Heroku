const socket = io() // io() initializes connection

const joinformTemplate = document.querySelector('#joinform-template').innerHTML;

socket.on('roomsList', ( {rooms} ) => {
	const html = Mustache.render(joinformTemplate, {rooms});
	document.querySelector("#joinform").innerHTML = html
});

