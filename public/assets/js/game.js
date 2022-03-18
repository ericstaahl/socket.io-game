const socket = io();
const startForm = document.querySelector('#start-form');
const startEl = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const gridArea = document.querySelector('#gameArea');
const onlineUsersEl = document.querySelector('#online-users');
//temporary query selectors for joining these rooms/gamerooms
const findGameBtn1 = document.querySelector('#game1');
const findGameBtn2 = document.querySelector('#game2');
const findGameBtn3 = document.querySelector('#game3');

let room = null;
let username = null;

startForm.addEventListener('submit', e => {
    e.preventDefault();
    username = startForm.username.value;
    socket.emit('user:joined', username, (status) => {
        // Server responds with an object. Includes success which is true if the sent username doesn't already exist
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


// Temporary event listener for joining room 1/game-room 1
findGameBtn1.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('joinGame', findGameBtn1.id, username, (status) => {
        const gameStartInfoEl = document.querySelector('#game-start-info');
        gameStartInfoEl.innerText = "Waiting for another player...";
        if (status) {
            console.log(status);
        };
    });
});

// Temporary event listener for joining room 2/game-room 2
findGameBtn2.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('joinGame', findGameBtn2.id, username)
    const gameStartInfoEl = document.querySelector('#game-start-info');
    gameStartInfoEl.innerText = "Waiting for another player...";
});

// Temporary event listener for joining room 3/game-room 3
findGameBtn3.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('joinGame', findGameBtn3.id, username);
    const gameStartInfoEl = document.querySelector('#game-start-info');
    gameStartInfoEl.innerText = "Waiting for another player...";
});


//------------ get random position ---------------------
function getRandomPosition(element) {
	let x = document.body.offsetHeight-element.clientHeight; // horizontal
	let y = document.body.offsetWidth-element.clientWidth; // vertical
	let randomX = Math.floor(Math.random()*x); // horizontal random
	let randomY = Math.floor(Math.random()*y); // vertical random
	return [randomX,randomY];
}

    const imageEl= document.querySelector('#virus').src= '/assets/icons/virus.png';
// --------------------------------------------------

socket.on('user:disconnected', (username) => {
    console.log(`${username} has disconnected.`)
});

socket.on('users', users => {
    console.log(users);
    // Create an array of all the values in the user object
    const usersArray = Object.values(users);
    // Display all users on the page
    // TODO Make sure names are removed from the array (on server side) when disconnected so that they do not rerender on the page
    onlineUsersEl.innerHTML = usersArray.map(username => `<li>${username}</li>`).join("");
});



// socket.on('gameFound', opponentSocket => {
//     console.log(`A game has been found with this user as the opponent: ${opponentSocket}`);
// })

socket.emit('message', 'Hi from the client');

