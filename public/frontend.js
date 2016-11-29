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

  // Return the result of the service call
 return service;
});

app.controller('MainController', function($scope, copeService, $stateParams, $state) {

});

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
    copeService.signupPageCall(data).success(function(signedUp) {
      $scope.success = signedUp;
      console.log(signedUp);
    })
  }
});
