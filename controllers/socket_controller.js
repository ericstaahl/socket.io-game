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

    const usersArray = Object.values(users);
    const found = usersArray.includes(username)
    if (!found) {
        users[this.id] = username;
    };
    debug(users);

    // Confirm to client that they have joined
    if (!found) {
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

// const handleJoinGame = async function (room_id, username) {

//     // find the game (room) that the client supplied
//     const game_room = rooms.find(room => room.id === room_id);

//     debug("Number of keys in game_room.users: " + Object.keys(game_room.users).length);
//     if (Object.keys(game_room.users).length < 2) {
//         this.join(room_id);

//         // add the users socket id to the rooms 'users' object
//         game_room.users[this.id] = username;

//         rooms.forEach(room => {
//             debug(room);
//         });
//     } else {
//         debug("This room/game already has two players.")
//         rooms.forEach(room => {
//             debug(room);
//         });
//     };

//     if (Object.keys(game_room.users).length === 2) {
//         const msg = "A game has been found."
//         // Client responds to this emit, some function runs and the game starts?
//         io.in(game_room.id).emit('gameFound', msg);
//         // callback({status: "Game is ready to start"})
//     };
// };

const handleJoinGameVer2 = async function (username) {
    // Create a room if the rooms-array doesn't contain any
    let _game_room;
    // Somehow check if the other rooms already are full. Create separate array for full rooms? Maybe give them some value that shows that they are full?
    let roomFull = true;

    if (rooms.length !== 0) {
        let checkRooms = rooms.forEach(game_room => {
            if (Object.keys(game_room.users).length < 2) {
                roomFull = false;
            }
        });
    };

    if (rooms.length === 0 || roomFull === true) {
        this.join(`game${nextRoomId}`);
        rooms[nextRoomId] = {
            id: `game${nextRoomId}`,
            name: `Game ${nextRoomId}`,
            users: {
            }
        };
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
        const msg = "A game has been found."
        // Client responds to this emit, some function runs and the game starts?
        io.in(_game_room.id).emit('gameFound', msg);
        // callback({status: "Game is ready to start"})
    };
}

module.exports = function (socket, _io) {
    io = _io;

    socket.on('disconnect', handleDisconnect);

    socket.on('user:joined', handleUserJoined);

    socket.on('joinGame', handleJoinGameVer2);
};