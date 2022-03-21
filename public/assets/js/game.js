const socket = io();
const startForm = document.querySelector('#start-form');
const startEl = document.querySelector('#start');
const gameEl = document.querySelector('#game');
const gridArea = document.querySelector('#gameArea');
const onlineUsersEl = document.querySelector('#online-users');
const nameTakenEl = document.querySelector('#name-taken')
//temporary query selectors for joining these rooms/gamerooms
const findGameBtn1 = document.querySelector('#game1');
const gameStartInfoEl = document.querySelector('#game-start-info');

let room = null;
let username = null;
let blockId;

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
            // createGrids(gridArea);
            //spawnVirus();
        }
    });
});


function createGrids(grid) {
    console.log(gridArea);
    //for loop, sksapa en ny div i spelet
    for (let i = 0; i < 65; i++) {
        //console.log(width);
        const block = document.createElement('div');


        block.classList.add('block');

        // Ge varje ny div ett id
        block.dataset.id = i;

        // Fäst divarna i spelområdet
        grid.appendChild(block);
    }
    const imageEl = document.createElement('img');
    imageEl.setAttribute('src', '/assets/icons/virus.png');
    imageEl.classList.add('img-fluid')
    console.log(imageEl);

    let randomBlock = document.querySelector(`[data-id='${blockId}']`);
    console.log("The randomised block: " + randomBlock)


    if (randomBlock !== null) {
        randomBlock.appendChild(imageEl);
    }


    gridArea.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            console.log("You clicked on the virus!")
            const timeClicked = Date.now();
            console.log(timeClicked);
            socket.emit('timeWhenClicked', timeClicked);
        };
    });
};

let gameScore = 0;
socket.on('gameScores', (data) => {
    let myGameTime = time;
    if (myGameTime === data) {
        gameScore++;
    } else if (myGameTime === data) {
        return;
    }
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

socket.on('gameFound', randomId => {
    console.log(randomId);
    blockId = randomId;
    gameStartInfoEl.innerText = "A game has been found!";
    createGrids(gridArea);
});

socket.emit('virusPosition', (randomId) => {
    console.log('Server has responded', randomId);
    blockId = randomId;
})
