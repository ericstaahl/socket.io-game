/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');
// Object containing all users
const users = {};

const handleUserJoined = async function(username) {
    //add the user to the users object
    debug('Listening for "user-join"')
    users[this.id] = username;
    debug(users);
};

module.exports = function (socket) {
    socket.on('user:joined', handleUserJoined);

    socket.on('message', (msg) => {
        debug('Listening for "message"')
        console.log('Message: ', msg);
    });
};