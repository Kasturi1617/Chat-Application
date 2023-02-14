const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require('Socket.io');
const io = new Server(server);
const ejs = require("ejs");
const fs = require('fs');
const  { all_users , newUserJoined, userLeft } = require(__dirname + '/users.js');

app.set('view engine', 'ejs');
console.log(__dirname);
app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function(req,res){
    res.sendFile(path.resolve(__dirname + '/public/start.html'));
});

const users = {};

io.on('connection', async (socket) => {

  socket.on('join-room', ({ username, room }) => {
    //Each user gets a unique socket.id
    users[socket.id] = username;
    newUserJoined(username, room, socket.id);

    socket.broadcast.emit('user-joined', {name: username, room: room, all_users: all_users});   //sends event to every client except the emitting client
  });

  // socket.broadcast.emit('room-users', {room: room_, all_users: all_users});

  socket.on('new-chat-message', (message) => {

      let currentDate = new Date();
      let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
      socket.broadcast.emit('receive', {message: message, name: users[socket.id], time: time});
  });

  socket.on('save-chat', ({sender, message}) => {
    fs.appendFile('messages.txt', `${sender}: ${message}\n`, (err) => {
      if(err) throw err;
    });
  });

  socket.on('is-typing', username => {
    socket.broadcast.emit('is-typing', username);
  });

  socket.on('not-typing', () => {
    console.log('not typing');
    socket.broadcast.emit('not-typing');
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-left', users[socket.id]);
    delete users[socket.id];
    userLeft(socket.id);
  });
});


let port = process.env.PORT;
if(port == null || port == "") port = 3000;

server.listen(port, () => {
  console.log('listening on port: 3000');
});
