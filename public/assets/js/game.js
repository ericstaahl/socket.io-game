const socket = io();
const startForm = document.querySelector('#start-form');
const startEl = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const gridArea = document.querySelector('#gameArea');
const onlineUsersEl = document.querySelector('#online-users');
const findGameBtn1 = document.querySelector('#game1')
const findGameBtn2 = document.querySelector('#game2')
const findGameBtn3 = document.querySelector('#game3')

let room = null;
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
            gameEl.classList.remove('hide');
            // createGrids(gridArea);
        }
    });
});

gridArea.addEventListener('click', e => {
    rounds++;

    if (e.target.tagName === 'I') {
        e.target.parentNode.innerHTML = "";
    }
});

function createGrids(grid) {

    //for loop, sksapa en ny div i spelet
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div');
        block.classList.add('block');

        // Ge varje ny div ett id
        block.dataset.id = i;

        // Fäst divarna i spelområdet
        grid.appendChild(block);
    }
};

findGameBtn1.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('joinGame', findGameBtn1.id, username)
});

socket.on('user:disconnected', (username) => {
    console.log(`${username} has disconnected.`)
});

socket.on('users', users => {
    console.log(users);
    // Create an array of all the values in the user object
    const usersArray = Object.values(users);
    onlineUsersEl.innerHTML = usersArray.map(username => `<li>${username}</li>`).join("");
});


// socket.on('gameFound', opponentSocket => {
//     console.log(`A game has been found with this user as the opponent: ${opponentSocket}`);
// })

socket.emit('message', 'Hi from the client');