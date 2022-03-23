const { handle } = require('express/lib/application');

/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');
// Object containing all users
const users = {};
const rooms = [
]
let nextRoomId = 0;

let io = null; // socket.io server instance

const getRoomByUserId = id => {
    return rooms.find(chatroom => chatroom.users.hasOwnProperty(id))
};

const handleUserJoined = async function (username, callback) {
    // add the user to the users object
    debug('Listening for "user-join"')

    // Trims whitespace from user input
    username = username.trim();

    const usersArray = Object.values(users);
    const found = usersArray.includes(username)
    if (!found) {
        users[this.id] = username;
    };
    debug(users);

    // Confirm to client that they have joined
    if (!found && username !== "") {
        callback({
            success: true,
        })
        io.emit("users", users);
    } else {
        callback({
            success: false,
        })
    };
};

const handleDisconnect = async function () {
    //remove the user from the users object
    // debug('Listening for "user-disconnected"')
    debug(`${users[this.id]} has disconnected`);
    delete users[this.id];
    debug(users);

    //remove the user from the room
    const room = getRoomByUserId(this.id);
    // Don't run rest of the code if the user wasn't part of a room
    if (!room) {
        io.emit("users", users);
        return;
    }
    delete room.users[this.id];
    io.emit("users", users);
    rooms.forEach(room => {
        debug(room);
    });
};

const handleJoinGameVer2 = async function (username) {
    // Access game-room outside of below functions
    let _game_room;

    // Check if rooms (if any) are NOT full
    let roomFull = true;
    if (rooms.length !== 0) {
        let checkRooms = rooms.forEach(game_room => {
            if (Object.keys(game_room.users).length < 2) {
                roomFull = false;
            }
        });
    };

    // Create a room if the rooms-array doesn't contain any OR the rooms are all full
    if (rooms.length === 0 || roomFull === true) {
        this.join(`game${nextRoomId}`);
        rooms[nextRoomId] = {
            id: `game${nextRoomId}`,
            name: `Game ${nextRoomId}`,
            reaction: null,
            userWithBestTime: null,
            users: {
            },
            rounds: 0,
            usersScore: {
            },
        };
        // Save user in room
        rooms[nextRoomId].users[this.id] = username;
        _game_room = rooms[nextRoomId];
        // Initialise user score
        rooms[nextRoomId].usersScore[this.id] = 0;
        // Add 1 to nextRoomId so that the next created room's id is unique
        nextRoomId++;
    } else {
        // otherwise check how many users the rooms in the array have
        for (let i = 0; i < rooms.length; i++) {
            const game_room = rooms[i];
            _game_room = game_room;
            debug("Current game-room: " + _game_room.id)
            // Add a user to a room if it's not full, and then break out of the loop
            if (Object.keys(game_room.users).length < 2) {
                this.join(game_room.id)
                // add the users socket id to the rooms 'users' object
                game_room.users[this.id] = username;
                rooms.forEach(room => {
                    debug(room);
                });
                break;
            } else {
                debug("This room/game already has two players.")
                rooms.forEach(room => {
                    debug(room);
                });
            };
        };
        debug("All rooms: " + rooms)
    };

    if (Object.keys(_game_room.users).length === 2) {
        // Randomise virus position
        const blockId = virusPosition();
        // Client listens to this emit, some function runs and the game starts
        debug("The id of the room created: " + nextRoomId)
        const roomId = _game_room.id;
        io.in(_game_room.id).emit('gameFound', { blockId, roomId });
    };
};

const virusPosition = function () {
    const blockId = Math.floor(Math.random() * 64);
    return blockId;
};

const handleScore = function (response) {
    // Get values from client-side response
    const timeClicked = response.timeDifference;
    const roomId = response.room;
    // Find the room the users are in
    const room = rooms.find(room => {
        const hasValue = Object.values(room).includes(roomId);
        return hasValue;
    });
    let gameIsFinished = false;
    // If the variable is null, assign it the socket id of a player
    // Will be the first player to respond.
    if (!room.userWithBestTime) {
        room.userWithBestTime = this.id;
    };
    debug(`Current user with best time is: ${room.userWithBestTime}`);
    // If the reaction time from the first player has been saved, check how it compares to the last user's time and
    // give score to the user with the best time.
    if (room.reaction) {
        if (room.reaction > timeClicked) {
            room.reaction = timeClicked;
            room.userWithBestTime = this.id;
            room.usersScore[room.userWithBestTime]++;
            // // Reset the room object's properties
            // room.userWithBestTime = null;
            // room.reaction = null;
            //else add the score 
        } else {
            room.usersScore[room.userWithBestTime]++;
            // // Reset the room object's properties
            // room.userWithBestTime = null;
            // room.reaction = null
        };
        room.rounds++;
        gameIsFinished = true;
        debug(`Number of rounds: ${room.rounds}`)
        
    };
    // If no reaction-time has been saved, save the user's time here (this will be the case of the first client to respond to the server)
    if (!room.reaction) {
        room.reaction = timeClicked;
    };
    // debug(`Reaction variable after response from one the clients: ${room.reaction}`);
    // debug(`Current user with best time is: ${room.userWithBestTime}`);
    debug(`The respective user's : score: ${JSON.stringify(room.usersScore)}`);
    if (gameIsFinished === true) {
        if (room.rounds < 10) {
            gameIsFinished = false;
            room.userWithBestTime = null;
            room.reaction = null
            const blockId = virusPosition();
            io.in(room.id).emit('newVirus', blockId);
        };
    }
};

// Startade koden för scoreboarden, men behöver få fram reaktionstiden för att komma vidare så att spelarna kan få poäng
/*
const getScoreboard = (user, opponent) => {
    if (user.reactionTime < opponent.reactionTime) {
        user.score++;
        return { winnerId: user.id, score: user.score };
    } else {
        opponent.score++;
        return { winnerId: opponent.id, score: opponent.score };
    }
}
*/

module.exports = function (socket, _io) {
    io = _io;

    socket.on('disconnect', handleDisconnect);

    socket.on('user:joined', handleUserJoined);

    socket.on('joinGame', handleJoinGameVer2);

    // socket.on('virusPosition', virusPosition);

    socket.on('timeWhenClicked', handleScore);
};