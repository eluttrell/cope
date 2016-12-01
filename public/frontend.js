var app = angular.module('cope', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state({
    name: 'home',
    url: '/',
    templateUrl: 'cope.html',
    controller: 'MainController'
  })
  .state({
    name: 'signup',
    url: '/signup',
    templateUrl: 'signup.html',
    controller: 'SignUpController'
  })
  .state({
    name: 'login',
    url: '/login',
    templateUrl: 'login.html',
    controller: 'LoginController'
  })
  .state({
    name: 'chat',
    url: '/chat',
    templateUrl: 'chat.html',
    controller: 'ChatController'
  });

  $urlRouterProvider.otherwise('/');
});

app.factory('copeService', function($http, $cookies, $rootScope, $state) {
  var service = {};

  // Signup Service
  service.signupPageCall = function(data) {
    // Define route url as it is in the backend.js file
    var url = 'http://localhost:3000/signup';
    return $http({
      method: 'POST',
      url: url,
      data: data
    });
  };

  // Login Service
  service.loginPageCall = function(data) {
    var url = 'http://localhost:3000/login';
    return $http({
      method: 'POST',
      url: url,
      data: data
    }).success(function(loggedIn) {
      $cookies.putObject('username', loggedIn.username);
    });
  };

  // Return the result of the service call
 return service;
});

app.controller('MainController', function($scope, copeService, $stateParams, $state) {

});

app.controller('ChatController', function() {

  socketChat(username, listener, paired);
})

app.controller('SignUpController', function($scope, copeService, $stateParams, $state, $cookies, $rootScope) {
  $scope.submitSignup = function() {
    // assign $scope values to key: value pairs for data insertion (on the backend)
    var data = {
      username: $scope.username,
      email: $scope.email,
      password: $scope.password,
      first_name: $scope.first_name,
      last_name: $scope.last_name
    };
    var loginData = {
      email: $scope.email,
      password: $scope.password
    };
    copeService.signupPageCall(data).success(function(signedUp) {
      $scope.success = signedUp;
      console.log(signedUp);
      copeService.loginPageCall(loginData).success(function(loggedIn) {
        $scope.success = loggedIn;
        console.log(loggedIn);
      });
    });
  };
});

app.controller('LoginController', function($scope, copeService, $stateParams, $state, $cookies, $rootScope) {
  $scope.submitLogin = function() {
    var data = {
      email: $scope.email,
      password: $scope.password
    };
    copeService.loginPageCall(data).error(function() {
      $scope.failed = true;
    });
    copeService.loginPageCall(data).success(function(loggedIn) {
      $scope.success = loggedIn;
      console.log(loggedIn);

    });
  };
});

//*********************************************
//THIS IS THE SOCKET.IO STUFF
//*********************************************

//this function here is for testing purposes only. once we get angular supplying the info, we can delete it and the weird values in the object in var user below.
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function socketChat(username, listener, paired) {
var socket = io();
var $messageForm = $('#sendMessage');
var $message = $('#m');
var $chat = $('#messages');
var $nickForm = $('#setNick');
var $nickError = $('#nickError');
var $nick = $('#nickname');
var nickname = '';
var user = {username: getParameterByName('username'), listener: getParameterByName('listener') === 'true'};

function connectUser() {
  socket.on('connect', function() {
    socket.emit('user', user);
    console.log('this is the user', user);
  });
}

//these are extracted functions used in the logic

function updateListenerList() {
  socket.on('sent listeners', function(users) {
    console.log('these are the listeners in the room', users);
    var chatusers = '';
    for (var i = 0; i < users.length; i++) {
      chatusers += users[i] + '<br>';
    }
    $('#userlist').html(chatusers);
  });
}

function updateSpeakerRoomList() {
  socket.on('sent users', function(users) {
    console.log('these are the speakers online', users);
    var chatusers = '';
    for (var i = 0; i < users.length; i++) {
      chatusers += users[i] + '<br>';
    }
    $('#userlist').html(chatusers);
  });
}

function moveAnnouncement() {
  socket.on('move message', function(data) {
    if (user.username === data.listener) {
      $chat.append("<li>You have just joined <b>" + data.userRoom + "</b>'s room.");
    }
  });
}

function roomUpdateAnnouncement() {
  socket.on('user room update', function(data) {
    console.log('hi');
    if (data === user.username) {
      $chat.append("<li>Welcome to <b>" + data + "</b>'s room");
    }
    else {
      $chat.append("<li><b>" + data + "</b> has just joined your room.");
    }
  });
}

function emitMessage() {
  socket.emit('sent chat message', $message.val());
  $chat.append("<li><b>" + user.username + "</b>" +  ": " + $message.val() + "</li>");
  $message.val('');
}

//this is the main logic for socket.io

if (user.listener) {
  console.log('this user is a listener');
  // socket.emit('create', 'listeners');
  connectUser();
  moveAnnouncement();
  updateListenerList();
}
else {
  console.log('this user is a speaker');
  // socket.emit('create', user.username);
  connectUser();
  roomUpdateAnnouncement();
  updateSpeakerRoomList();
}

$messageForm.submit(function(e){
  e.preventDefault();
  emitMessage();
});

socket.on('recieved chat message', function(data){
  if (user.username != data.user) {
    $chat.append("<li><b>" + data.user + ":</b> " + data.message + "</li>");
  }
});

});
