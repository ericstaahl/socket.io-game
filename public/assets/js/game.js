const socket = io();
const startForm = document.querySelector('#start-form');
// const usernameFormBtn = document.querySelector('#usernameFormBtn')

let username = null;
startForm.addEventListener('submit', e => {
    e.preventDefault();
    username = startForm.username.value;
    socket.emit('user:joined', username, (status) => {
        console.log('Server has responded', status)
    });
});

socket.emit('message', 'Hi from the client');