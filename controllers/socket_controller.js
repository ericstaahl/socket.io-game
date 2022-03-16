/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');

module.exports = function (socket) {
    socket.on('message', (msg) => {
        debug('Listening for "message"')
        console.log('Message: ', msg);
    });
};