const socket = io();
const startForm = document.querySelector('#start-form');
const startEl = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const gridArea = document.querySelector('#gameArea');
const onlineUsersEl = document.querySelector('#online-users');
const nameTakenEl = document.querySelector('#name-taken')
let imageEl;
//temporary query selectors for joining these rooms/gamerooms
const findGameBtn1 = document.querySelector('#game1');
// const findGameBtn2 = document.querySelector('#game2');
// const findGameBtn3 = document.querySelector('#game3');
const gameStartInfoEl = document.querySelector('#game-start-info');
const timerEl = document.querySelector('#timer');
const resultEl = document.querySelector('#result-wrapper');
const gameScoreEl = document.querySelector('#gameScore'); 

let room = null;
let username = null;
let blockId;
let numberOfRounds = 0;

let timeWhenAppeared; // Använder inte 'timeWhenAppeared'

let createTime;
let reactionTime;
let timeClicked;

let delay;

startForm.addEventListener('submit', e => {
    e.preventDefault();
    username = startForm.username.value;
    socket.emit('user:joined', username, (status) => {
        // Server responds with an object. Includes success which is true if the sent username doesn't already exist
        console.log('Server has responded', status)
        if (status.success === false) {
            console.log("Username already taken/is unvalid. Please try a different one.")
            nameTakenEl.classList.remove('hide');
        }
        if (status.success === true) {
            startEl.classList.add('hide');
            gameEl.classList.remove('hide');
        }
    });
});

function createGrids(grid) {
    console.log(gridArea);
    //for loop, skapa en ny div i spelet
    for (let i = 0; i < 65; i++) {
        //console.log(width);
        const block = document.createElement('div');

        block.classList.add('block');

        // Ge varje ny div ett id
        block.dataset.id = i;

        // Fäst divarna i spelområdet
        grid.appendChild(block);
    }
    generateVirus(blockId);
};

function generateVirus(id) {
    blockId = id;
    setTimeout(function() { // -----

        imageEl = document.createElement('img');
        imageEl.setAttribute('src', '/assets/icons/virus.png');
        imageEl.classList.add('img-fluid')
        console.log(imageEl);

        let randomBlock = document.querySelector(`[data-id='${blockId}']`);
        console.log("The randomised block: " + randomBlock)

        if (randomBlock !== null) {
            randomBlock.appendChild(imageEl);
        };

    createTime = Date.now(); // -----
    
    }, delay); // -----
};

gridArea.addEventListener('click', e => {
    if (e.target.tagName === 'IMG') {
        numberOfRounds++; // count games up to 10
        console.log('Round: ',numberOfRounds); // check how many rounds
        console.log("You clicked on the virus!")
        imageEl.remove();
        const timeClicked = Date.now();
        const timeDifference = timeClicked - createTime;
        console.log(timeDifference);
        reactionTime=(timeClicked-createTime)/1000; 
        //console.log('timeClicked, reactionTime ',timeClicked, reactionTime);

        socket.emit('timeWhenClicked', { timeDifference, room });

        timerEl.innerHTML = `Your Reaction Time is: ${reactionTime} seconds`;
        socket.emit('timeWhenClicked; ', timeClicked);
        imageEl.remove();
        if (numberOfRounds === 10) { // After 10 games: Continue/Exit, Results Screen
            gameEl.classList.add('hide');
            resultEl.classList.remove('hide');           
        }

    };
});

// TODO reset previous game and find a room
document.querySelector('#continue').addEventListener('click',e => {  
    resultEl.classList.add('hide');
    gameEl.classList.remove('hide');
    gameStartInfoEl.innerText = "Press the button to start looking for a game!";
});

// TODO reset previous game
document.querySelector('#quit').addEventListener('click',e => { 
    resultEl.classList.add('hide');
    startEl.classList.remove('hide');
});

//------- rooms ----------
findGameBtn1.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('joinGame', /*findGameBtn1.id,*/ username);
    const gameStartInfoEl = document.querySelector('#game-start-info');
    gameStartInfoEl.innerText = "Waiting for another player...";
});



// ----- socket --------
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

socket.on('gameFound', (ids) => {
    findGameBtn1.classList.add('hide');
    console.log("Object sent from server-side :" + ids);
    blockId = ids.blockId;
    room = ids.roomId;
    console.log("Room from the sent array: " + room);
    gameStartInfoEl.innerText = "A game has been found!";
    createGrids(gridArea);
});

socket.on('update-scoreboard', scoreboard)
    

socket.on('newVirus', blockId => {
    generateVirus(blockId);
});

socket.on('gameOver', () => {
    console.log('The game is over.')
    numberOfRounds = 0;
    findGameBtn1.classList.remove('hide');
    // Reset game area
    gridArea.innerHTML = ""
})

socket.on('delay', randomDelay => {
    delay = randomDelay;
});

// socket.on('opponentLeft', () => {
//     console.log('You automatically won because your opponent disconnected during your game.')
//     numberOfRounds = 0;
//     findGameBtn1.classList.remove('hide');
// });

socket.on('update-scoreboard', scoreboard);

// socket.on('timeWhenClicked', timeClicked);

socket.on('winnerName', winner => {
    gameScoreEl.innerHTML = `The winner is: ${winner}`;
})

// Score boad
const getPlayerScore = document.querySelector('#player-score')
const getOpponentScore = document.querySelector('#opponent-score')

socket.on('users', users => {
    getPlayerScore.innerHTML = `${username}:`
    //getOpponentScore.innerHTML=`${}:${}`
})