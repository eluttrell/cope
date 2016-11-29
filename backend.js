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
  var userInfo = req.body;
  console.log("LOOK AT THIS:" + userInfo);
  bcrypt.hash(userInfo.password, 10, function(err, hash){
    if (err) {
      res.json({status: "Failed"});
      return;
    } else {
      db.query('INSERT INTO copee VALUES (default, $1, $2, $3, $4, $5, default, default)', [userInfo.username, userInfo.email, hash, userInfo.first_name, userInfo.last_name]);
    }
    res.json({status: 'OK'});
  });
});
