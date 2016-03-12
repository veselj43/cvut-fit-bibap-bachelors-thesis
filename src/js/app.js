

$(document).ready(function(){
	//Handles menu drop down
    $('.dropdown-menu').find('form').click(function (e) {
        e.stopPropagation();
    });
});

/**
 * Main AngularJS Web Application
 */
var app = angular.module('ufss', [
	'ngRoute',
	// 'ui.bootstrap.modal'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		// Home
		.when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
		// Actions
		.when("/scores", {templateUrl: "partials/scores.html", controller: "PageCtrl"})
		// Pages
		.when("/faq", {templateUrl: "partials/faq.html", controller: "PageCtrl"})
		// else 404
		// .when("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"})
		.otherwise({templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope, $location/*, $http */) {
	console.log("Page Controller reporting for duty.");

	$scope.getActiveClass = function (path) {
		var current = $location.path().substr(0, path.length);
		if (path !== '/') 
			return (current === path) ? 'active' : '';
		else 
			return ($location.path() === '/') ? 'active' : '';
	}

	$scope.dump = function () {
		alert($location.path());
	}

});

app.controller('Login', function($scope) {

	$scope.user = {};

	$scope.send = function(user) {
		$scope.user = angular.copy(user);
		alert(JSON.stringify($scope.user));
	};

});

app.controller("Scores", function($scope) {

	$scope.scoreSelect = {};

	$scope.scoreSelect.options = [
		{ id : "Q12", name: "Nissan" },
		{ id : "TR7", name: "Toyota" },
		{ id : "D4R", name: "Fiat" },
	];

});
  
app.controller('TestForm', function($scope) {

	$scope.master = {};

	$scope.update = function(user) {
		$scope.master = angular.copy(user);
	};

	$scope.reset = function() {
		$scope.user = angular.copy($scope.master);
	};

	$scope.reset();

});