const socket = io();

const startForm = document.querySelector('#start-form');
const startEl = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const gridArea = document.querySelector('#gameArea');
const onlineUsersEl = document.querySelector('#online-users');
const nameTakenEl = document.querySelector('#name-taken')

let imageEl;
const findGameBtn1 = document.querySelector('#game1');
const gameStartInfoEl = document.querySelector('#game-start-info');
const timerEl = document.querySelector('#timer');
const resultEl = document.querySelector('#result-wrapper');
const gameScoreEl = document.querySelector('#gameScore');
const winnerIsEl = document.querySelector('#winnerIs')
const player2El = document.querySelector(".player2")
// Score board
const getPlayerScoreEl = document.querySelectorAll('.player-score')
const getOpponentScoreEl = document.querySelectorAll('.opponent-score')
const timerPlayer1El = document.querySelector('#timerPlayer1')
const timerPlayer2El = document.querySelector('#timerPlayer2')

const timerFunction = () => {
    let elapsedTime = Date.now() - createTime;
    document.getElementById("timer").innerText = (elapsedTime / 1000).toFixed(3);
}

let intervalTimer;

// Reset score, names etc.
const postGameReset = () => {
    getPlayerScoreEl.forEach(item => item.innerText = '0')
    getOpponentScoreEl.forEach(item => item.innerText = '0')
    timerPlayer1El.innerText = ``
    timerPlayer2El.innerText = ``
    winnerIsEl.innerText = `The winner is...`;
    player2El.innerText = 'Opponents time'
    timerEl.innerHTML = ``;
}

let room = null;
let username = null;
let blockId;
let numberOfRounds = 0;

// let timeWhenAppeared; // Använder inte 'timeWhenAppeared'

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
    setTimeout(function () { // -----

        imageEl = document.createElement('img');
        imageEl.setAttribute('src', '/assets/icons/virus.png');
        imageEl.classList.add('img-fluid')
        console.log(imageEl);

        let randomBlock = document.querySelector(`[data-id='${blockId}']`);
        console.log("The randomised block: " + randomBlock)

        if (randomBlock !== null) {
            randomBlock.appendChild(imageEl);
        };

        createTime = Date.now();
        
        intervalTimer = setInterval(timerFunction, 100)
    }, delay); // -----
};

gridArea.addEventListener('click', e => {
    if (e.target.tagName === 'IMG') {
        clearInterval(intervalTimer)
        numberOfRounds++; // count games up to 10
        console.log('Round: ', numberOfRounds); // check how many rounds
        console.log("You clicked on the virus!")
        imageEl.remove();
        const timeClicked = Date.now();
        const timeDifference = timeClicked - createTime;
        console.log(timeDifference);
        reactionTime = (timeClicked - createTime) / 1000;

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

// reset previous game and go back to the lobby
document.querySelector('#continue').addEventListener('click', e => {
    postGameReset()
    resultEl.classList.add('hide');
    gameEl.classList.remove('hide');
    gameStartInfoEl.innerText = "Press the button to start looking for a game!";
});

// // TODO reset previous game
// document.querySelector('#quit').addEventListener('click',e => { 
//     resultEl.classList.add('hide');
//     startEl.classList.remove('hide');
// });

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
    gridArea.classList.remove('hide')
    console.log("Object sent from server-side :" + ids);
    blockId = ids.blockId;
    room = ids.roomId;
    console.log("Names of players: ", ids.namesOfPlayers)
    const opponentsName = ids.namesOfPlayers.find(name => name !== username)
    console.log("Name of opponent", opponentsName)
    player2El.innerText = opponentsName
    console.log("Room from the sent array: " + room);
    gameStartInfoEl.innerText = "A game has been found!";
    createGrids(gridArea);
});

// socket.on('update-scoreboard', scoreboard)


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

socket.on('opponentLeft', () => {
    clearInterval(intervalTimer)
    console.log('You automatically won because your opponent disconnected during your game.')
    numberOfRounds = 0;
    // Remove virus from the board otherwise it will show up in the next game aswell 
    gridArea.innerHTML = ""
    findGameBtn1.classList.remove('hide');
    gameEl.classList.add('hide');
    resultEl.classList.remove('hide');
    winnerIsEl.innerText = `Your opponent left... But you win!`;
});

// socket.on('update-scoreboard', scoreboard);

// socket.on('timeWhenClicked', timeClicked);

socket.on('winnerName', winner => {
    winnerIsEl.innerText = `The winner is: ${winner}`;
})

socket.on('usersScore', ({ usersScore, bothReactions }) => {
    console.log("The users score: ", usersScore)
    getPlayerScoreEl.forEach(item => item.innerText = usersScore[socket.id])
    const opponentsID = Object.keys(usersScore).find(id => id !== socket.id)
    getOpponentScoreEl.forEach(item => item.innerText = usersScore[opponentsID])
    timerPlayer1El.innerText = `${bothReactions[socket.id]} ms`
    timerPlayer2El.innerText = `${bothReactions[opponentsID]} ms`

})


