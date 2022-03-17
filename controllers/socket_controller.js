const { handle } = require('express/lib/application');

/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');
// Object containing all users
const users = {};

let io = null; // socket.io server instance

const handleUserJoined = async function (username, callback) {
    //add the user to the users object
    debug('Listening for "user-join"')

    const usersArray = Object.values(users);
    const found = usersArray.includes(username)
    debug("This is found: " + found);
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

// Send a message to another socket.id
const privateConnection = async function (secondUser) {
    debug("Listening for 'findGame")
    // Find the SocketID corresponding to the username ('secondUser')
    const secondUserSocket = Object.keys(users).find(key => users[key] === secondUser);
    debug("secondUsers socket ID: " + secondUserSocket)
    this.to(secondUserSocket).emit("gameFound", this.id);
};

module.exports = function (socket, _io) {
    io = _io;

    socket.on('disconnect', handleDisconnect);

    socket.on('user:joined', handleUserJoined);

    socket.on('findGame', privateConnection);

    socket.on('message', (msg) => {
        debug('Listening for "message"')
        console.log('Message: ', msg);
    });
};