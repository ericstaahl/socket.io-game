const socket = io();
const startForm = document.querySelector('#start-form');
const startEl = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const gridArea = document.querySelector('#gameArea');


let username = null;

startForm.addEventListener('submit', e => {
    e.preventDefault();
    username = startForm.username.value;
    socket.emit('user:joined', username, (status) => {
        console.log('Server has responded', status)
        if (status.success === false) {
            console.log("Username already taken. Please try with a different one.")
        }
        if (status.success === true) {
            startEl.classList.add('hide');
            createGrids(gridArea);
            gameEl.classList.remove('hide');
        }
    });
});

gridArea.addEventListener('click', e => {
    rounds ++;

    if(e.target.tagName === 'I'){
        e.target.parentNode.innerHTML = "";
        virus()
    }
});

function gridArea(grid) {

    //for loop, sksapa en ny div i spelet
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div');
        block.classList.add('block');

        // Ge varje ny div ett id
        block.dataset.id = i;

        // Fäst divarna i spelområdet
        grid.appendChild(block);
    }
}


socket.on('user:disconnected', (username) => {
    console.log(`${username} has disconnected.`)
});

socket.emit('message', 'Hi from the client');