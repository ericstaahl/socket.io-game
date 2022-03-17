const { handle } = require('express/lib/application');

/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');
// Object containing all users
const users = {};

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
    } else {
        callback({
            success: false,
        })
    };
};

const handleDisconnect = async function () {
    //add the user to the users object
    debug('Listening for "user-disconnected"')
    console.log(`${users[this.id]} has disconnected`);
    delete users[this.id];
    debug(users);
};

module.exports = function (socket) {
    socket.on('disconnect', handleDisconnect);

    socket.on('user:joined', handleUserJoined);

    socket.on('message', (msg) => {
        debug('Listening for "message"')
        console.log('Message: ', msg);
    });
};