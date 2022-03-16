const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

// serve static files from the folder "public"
app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        console.log('Message: ', msg);
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000')
})

module.exports = app;
