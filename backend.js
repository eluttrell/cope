var express = require('express'),
   app = express(),
   server = require('http').createServer(app),
   io = require('socket.io').listen(server),
   bcrypt = require('bcrypt');
   bodyParser = require('body-parser');
   uuid = require('uuid');
   pgp = require('pg-promise')();

  //  nicknames = [];



// Makes front end files pull from /public
app.use(express.static('public'));
app.use(bodyParser.json());

server.listen(3000);


var db = pgp(database='cope_db');

db.connect();

//Signup
app.post('/signup', function(req, res) {
  //Contains key-value pairs of data submitted in the request body
  var userInfo = req.body;

  // Encrypts the new user's password and stores it in a hash variable
  bcrypt.hash(userInfo.password, 10, function(err, hash){
    //Handles errors
    if (err) {
      res.json({status: "Failed"});
      return;
    }
    //If info is valid, it inserts info into database
    else {
      db.query('INSERT INTO copee VALUES (default, $1, $2, $3, $4, $5, default, default)', [userInfo.username, userInfo.email, hash, userInfo.first_name, userInfo.last_name]);
    }
    //Returns success response
    res.json({status: 'OK'});
  });
});

app.post('/login', function(req, res) {
 var userInfo = req.body;
 db.query('SELECT password, id FROM copee where copee.email = $1', [userInfo.email]).then(function(oldPass) {
   console.log(oldPass[0].password);
   bcrypt.compare(userInfo.password, oldPass[0].password, function(err, newHash) {
     if (err) {
       res.json({status: "Failed"});
       return;
     } else if (!newHash) {
       res.status(401).json({status: "Failed", message: "Incorrect Password"});
       return;
     } else {
       var token = uuid();
       var id = oldPass[0].id;
       db.query('INSERT INTO auth_token VALUES($1, default, $2)', [token, id]);
     }
     res.status(200).json({token: token, status: "loggedIn"});
   });
 });
});
