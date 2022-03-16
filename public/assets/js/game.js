const socket = io();

socket.emit('message', 'Hi from the client')