/**
 * Socket Controller
 */


module.exports = function (socket) {
    io.on('connection', socket => {
        socket.emit("Hello world")
    });
};