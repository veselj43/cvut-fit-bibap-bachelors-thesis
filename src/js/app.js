
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
	'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {

	var partPath = "partials/";

	$routeProvider
		// Home
		.when("/", {templateUrl: partPath + "home.html", controller: "PageCtrl"})
		// Actions
		.when("/newTournament", {templateUrl: partPath + "newTournament.html", controller: "PageCtrl"})
		.when("/scoring", {templateUrl: partPath + "scoring.html", controller: "PageCtrl"})
		.when("/scores", {templateUrl: partPath + "scores.html", controller: "PageCtrl"})
		// Pages
		.when("/faq", {templateUrl: partPath + "faq.html", controller: "PageCtrl"})
		// else 404
		// .when("/404", {templateUrl: partPath + "404.html", controller: "PageCtrl"})
		.otherwise({templateUrl: partPath + "404.html", controller: "PageCtrl"});
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

app.controller('newTournament', function($scope) {

	$scope.emptyRow = function(last) {
		return { id : last + 1, name: "", group: "" };
	}

	$scope.nt = {};

	$scope.nt.table = [$scope.emptyRow(0)];

	$scope.addRow = function() {
		$scope.nt.table.push($scope.emptyRow($scope.nt.table.length));
	};

	$scope.update = function(nt) {
		$scope.master = angular.copy(nt);
	};

	$scope.reset = function() {
		$scope.nt = angular.copy($scope.master);
	};

	$scope.update($scope.nt);

});

app.controller("Scoring", function($scope) {

	$scope.scoreSelect = {};

	$scope.scoreSelect.options = [
		{ id : "Q12", name: "Nissan" },
		{ id : "TR7", name: "Toyota" },
		{ id : "D4R", name: "Fiat" },
	];

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