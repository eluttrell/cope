var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    bcrypt = require('bcrypt'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
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

// Signup
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

// Login
app.post('/login', function(req, res) {
  var userInfo = req.body;
  db.query('SELECT * FROM copee where copee.email = $1', [userInfo.email]).then(function(userInfo) {
    console.log(userInfo);
    console.log(userInfo[0].password);
    bcrypt.compare(userInfo.password, userInfo[0].password, function(err, newHash) {
      console.log('THIS THIS THIS: ' + res);
      if (err) {
        res.json({status: "Failed"});
        return;
      } else if (!newHash) {
        res.status(401).json({status: "Failed", message: "Password Incorrect"})
        return;
      } else {
        var token = uuid();
        var id = userInfo[0].id;
        console.log(token);
        db.query('INSERT INTO auth_token VALUES($1, default, $2)', [token, id]);
      }
      res.status(200).json({token: token, status: "Logged In", username: userInfo.username, email: userInfo.email, first_name: userInfo.first_name, last_name: userInfo.last_name});
    });

  });
});

// Profile
app.get('/profile', function() {

})
