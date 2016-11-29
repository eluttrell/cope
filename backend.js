var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    nicknames = [];

server.listen(3000);

// Makes front end files pull from /public
app.use(express.static('public'));

// This is no longer necessary ßbecause of line above
// app.get('/', function(req, res) {
//   res.sendfile(__dirname + '/index.html');
// });

// This logs user connection status to the console and assigns nicknames (usernames)
io.on('connection', function(socket) {
  socket.on('new user', function(data, callback) {
    if (nicknames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      io.sockets.emit('usernames', nicknames);
    }
  });

// This logs a user disconnect to the console
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnect');
  });

  function updateNicknames() {
    io.sockets.emit('usernames', nicknames);
  }

  socket.on('disconnect', function(data) {
    if(!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    updateNicknames();
  })
});

// This logs user's sent messages to the console along with the current username of the user
io.on('connection', function(socket) {
  socket.on('send message', function(data) {
    console.log(socket.nickname + "'s message: " + data)
  })
})

// This sends the message from the server to the rest of the users. If you wanted to send it to everyone except the sender (or a specific socket), you would use socket.broadcast.emit('new message', data). Then on the client side (inside index.html) we will capture the 'new message' event and include it on the page.
io.sockets.on('connection', function(socket) {
    socket.on('send message', function(data) {

        io.sockets.emit('new message', {data: data, username: socket.nickname});
    });
});
