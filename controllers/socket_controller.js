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
}

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
    console.log(`${users[this.id]} has disconnected`);
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
            users: {
            },
            rounds: 0,
        };
        // Save user in room
        rooms[nextRoomId].users[this.id] = username;
        _game_room = rooms[nextRoomId];
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
        const blockId = Math.floor(Math.random() * 64);
        // Client listens to this emit, some function runs and the game starts
        console.log("The id of the room created: " + nextRoomId)
        const roomId = _game_room.id;
        io.in(_game_room.id).emit('gameFound', {blockId, roomId});
    };
}

const virusPosition = function (callback) {
    const blockId = Math.floor(Math.random() * 64);
    callback(blockId);
};

const handleScore = function (callback) {
// 1. Check the socket ID of the incoming timestamps?
// 2. when two have been recieved from the same room calculate the score?
// 3. Tell the client to render the next virus?    


}

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

    socket.on('virusPosition', virusPosition);
};