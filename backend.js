var express = require('express'),
   app = express(),
   server = require('http').createServer(app),
   io = require('socket.io').listen(server),
   bcrypt = require('bcrypt');
   bodyParser = require('body-parser');
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

app.post('/login', function(req, res){
  var userInfo = req.body;
  var oldPass = db.query('SELECT password from copee WHERE copee.email = $1', [userInfo.email]);
  console.log(oldPass);
  bcrypt.hash(userInfo.password, 10, function(err, hash) {
    if(err) {
      res.json({status: "Failed"});
      return;
    } else if(hash != oldPass) {
      res.json({status: "Incorrect Password"});
      return;
    } else if(hash === oldPass){

    }
  });
});
