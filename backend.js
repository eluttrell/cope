var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    bcrypt = require('bcrypt'),
    bodyParser = require('body-parser'),
    pgp = require('pg-promise')();
    // nicknames = [];

// Run this on terminal to get node modules:
/*npm install --save express@4.10.2*/
/*npm install --save socket.io*/


// Makes front end files pull from /public
app.use(express.static('public'));
app.use(bodyParser.json());

server.listen(3000);

var db = pgp(database='cope_db');

db.connect();

app.post('/signup', function(req, res) {
  // Contains key-value pairs of data submitted in the request body
  var userInfo = req.body;
  // Encrypts the new users password and stores it in hash variable
  bcrypt.hash(userInfo.password, 10, function(err, hash) {
    // If there is an error, default to this
    if (err) {
      res.json({status: "Failed"});
      return;
    }
    // If req.body info is correct, run postgresql insert statement
    else {
      db.query('INSERT INTO copee VALUES(default, $1, $2, $3, $4, $5, default, default)', [userInfo.username, userInfo.email, hash, userInfo.first_name, userInfo.last_name]);
    }
    // Return the response
    res.json({status: "OK"});
  });
});
