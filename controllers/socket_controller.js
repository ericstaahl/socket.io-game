/**
 * Socket Controller
 */
const debug = require('debug')('game:socket_controller');
// Object containing all users
const users = {};
let rooms = [
]
let nextRoomId = 0;

let io = null; // socket.io server instance

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
    debug(`${users[this.id]} has disconnected`);
    delete users[this.id];
    debug(users);

    //remove the user from the room
    debug('this.id has this value:', this.id)
    debug(rooms)
    // Ignore emtpy items by checking if room is truthy or not
    const room = rooms.find(room => {
        if (room) {
            return room.users.hasOwnProperty(this.id)
        }
    });
    // Don't run rest of the code if the user wasn't part of a room
    if (!room) {
        io.emit("users", users);
        return;
    }
    delete room.users[this.id];
    io.emit("users", users);
    rooms.forEach(room => {
        debug("Debugging room after user removal", room);
    });

    //Remove room after disconnect

    debug(`Length of rooms array before removal of room: ${rooms.length}`)
    io.in(room.id).emit('opponentLeft');
    const newRooms = rooms.filter(_room => _room.id !== room.id);
    rooms = newRooms;
    console.log("The new rooms array: " + newRooms);
    debug(`Length of rooms array: ${rooms.length}`)
    debug(rooms);
    // Leave the room
    this.leave(room.id);
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
            bothReactions: {
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
        rooms.some(room => {
            const game_room = room;
            _game_room = game_room;
            debug("Current game-room: " + _game_room.id)
            // Add a user to a room if it's not full, and then break out of the loop
            if (Object.keys(game_room.users).length < 2) {
                this.join(game_room.id);
                // Initialise user score
                game_room.usersScore[this.id] = 0;
                // add the users socket id to the rooms 'users' object
                game_room.users[this.id] = username;
                rooms.forEach(room => {
                    debug(room);
                });
                
            } else {
                debug("This room/game already has two players.")
                rooms.forEach(room => {
                    debug(room);
                });
            };
        });
        debug("All rooms: ")
        debug(rooms)
    };

    if (Object.keys(_game_room.users).length === 2) {
        // Randomise virus position
        const blockId = virusPosition();
        // Client listens to this emit, some function runs and the game starts
        debug("The id of the room created: " + nextRoomId)
        const roomId = _game_room.id;
        const namesOfPlayers = Object.values(_game_room.users)
        io.in(_game_room.id).emit('gameFound', { blockId, roomId, namesOfPlayers });
    };
};

const virusPosition = function () {
    const blockId = Math.floor(Math.random() * 64);
    return blockId;
};

const handleScore = function (response) {
    // Get values from client-side response
    console.log(response);
    const timeClicked = response.timeDifference;
    const roomId = response.room;
    debug("Response from the client during handle-score: " + roomId);
    // Find the room the users are in
    const room = rooms.find(room => {
        if (room) {
            console.dir(rooms)
            debug(room);
            const hasValue = Object.values(room).includes(roomId);
            return hasValue;
        };
    });

    // Save reaction to reactions object (gets sent to client later to display both players' times)
    room.bothReactions[this.id] = timeClicked

    let roundIsFinished = false;
    // If the variable is null, assign it the socket id of a player
    // Will be the first player to respond.
    debug("rooms before crash: ")
    debug(rooms);
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

            //else add the score 
        } else {
            room.usersScore[room.userWithBestTime]++;
        };
        room.rounds++;
        io.in(room.id).emit('usersScore', {usersScore: room.usersScore, bothReactions: room.bothReactions});
        roundIsFinished = true;
        debug(`Number of rounds: ${room.rounds}`)

    };
    // If no reaction-time has been saved, save the user's time here (this will be the case of the first client to respond to the server)
    if (!room.reaction) {
        room.reaction = timeClicked;
    };
    debug(`The respective user's : score: ${JSON.stringify(room.usersScore)}`);
    if (roundIsFinished === true) {
        if (room.rounds < 10) {
            roundIsFinished = false;
            // Reset the room object's properties
            room.userWithBestTime = null;
            room.reaction = null
            const blockId = virusPosition();
            // Send new delay to client
            let randomDelay = Math.random();
            randomDelay = randomDelay * 3000;
            io.in(room.id).emit('delay', randomDelay);
            // Tell client to render a new virus
            io.in(room.id).emit('newVirus', blockId);
        } else {
            let highestScore = 0;
            let tie = false;
            Object.values(room.usersScore).forEach(score => {
                if (score === highestScore) {
                    tie = true;
                };
                if (score > highestScore) {
                    highestScore = score;
                };
                debug("The highest score: " + highestScore);
                const winner = Object.keys(room.usersScore).find(key => room.usersScore[key] === highestScore);
                debug("The winner is: " + winner);

                let winnerName = users[winner];
                if (tie) {
                    winnerName = "Both players!"
                };

                debug("The name of the winner is: " + winnerName);
                io.in(room.id).emit('winnerName', winnerName);
            });
            io.in(room.id).emit('gameOver');
            const newRooms = rooms.filter(room => room.id !== roomId);
            rooms = newRooms;
            console.log("The new rooms array: " + JSON.stringify(newRooms));
            // debug(`Length of rooms array: ${rooms.length}`)
            debug(rooms);
            // Leave the room
            this.leave(roomId);
        }
    }
};

module.exports = function (socket, _io) {
    io = _io;

    socket.on('disconnect', handleDisconnect);

    socket.on('user:joined', handleUserJoined);

    socket.on('joinGame', handleJoinGameVer2);

    socket.on('timeWhenClicked', handleScore);
};