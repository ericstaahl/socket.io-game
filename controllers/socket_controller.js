const { handle } = require('express/lib/application');

/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');
// Object containing all users
const users = {};
const rooms = [
    {
        id: 'game1',
        name: "Game 1",
        users: {}
    },
    {
        id: 'game2',
        name: "Game 2",
        users: {}
    },
    {
        id: 'game3',
        name: "Game 3",
        users: {}
    }
]

let io = null; // socket.io server instance

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
    debug('Listening for "user-disconnected"')
    console.log(`${users[this.id]} has disconnected`);
    delete users[this.id];
    debug(users);
};

// // Send a message to another socket.id
// const privateConnection = async function (secondUser) {
//     debug("Listening for 'findGame")
//     // Find the SocketID corresponding to the username ('secondUser')
//     const secondUserSocket = Object.keys(users).find(key => users[key] === secondUser);
//     debug("secondUsers socket ID: " + secondUserSocket)
//     this.to(secondUserSocket).emit("gameFound", this.id);
// };

const handleJoinGame = async function (room_id, username) {
    this.join(room_id);

    // find the game (room) that the client supplied
    const game_room = rooms.find(room => room.id === room_id);

    // add the users socket id to the rooms 'users' object
    game_room.users[this.id] = username;

    rooms.forEach(room => {
        debug(room);
    });
};

module.exports = function (socket, _io) {
    io = _io;

    socket.on('disconnect', handleDisconnect);

    socket.on('user:joined', handleUserJoined);

    // socket.on('findGame', privateConnection);

    socket.on('joinGame', handleJoinGame);

    socket.on('message', (msg) => {
        debug('Listening for "message"')
        console.log('Message: ', msg);
    });
};