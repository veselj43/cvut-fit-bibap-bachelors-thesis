
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

	$scope.parseDate = function(formDate) {
		if (typeof(formDate) === "undefined") return;
		var parts = formDate.split('. ');
		return parts[2] + '-' + parts[1] + '-' + parts[0];
	}

	$scope.update = function(nt) {
		$scope.master = angular.copy(nt);
		$scope.master.dbDate = $scope.parseDate($scope.master.date);
	};

	$scope.reset = function() {
		$scope.nt = angular.copy($scope.master);
	};

	$scope.update($scope.nt);

});

app.controller("Scoring", function($scope, $location) {

	$scope.db = {};

	$scope.selected = {};

	$scope.data = [
		{
			"id": 0,
			"name": "Netbook",
			"date_start": "2016-02-05T03:09:53 -01:00",
			"matches": [
				{
					"id": 0,
					"start_time": "2016-01-23T09:27:20 -01:00",
					"team_home": {
						"id": 24,
						"name": "Bugsall"
					},
					"team_away": {
						"id": 15,
						"name": "Cablam"
					}
				},
				{
					"id": 1,
					"start_time": "2016-02-12T05:34:00 -01:00",
					"team_home": {
						"id": 37,
						"name": "Decratex"
					},
					"team_away": {
						"id": 54,
						"name": "Myopium"
					}
				},
				{
					"id": 2,
					"start_time": "2016-02-09T08:11:56 -01:00",
					"team_home": {
						"id": 47,
						"name": "Krag"
					},
					"team_away": {
						"id": 27,
						"name": "Gynk"
					}
				},
				{
					"id": 3,
					"start_time": "2016-02-19T12:27:20 -01:00",
					"team_home": {
						"id": 25,
						"name": "Dognost"
					},
					"team_away": {
						"id": 53,
						"name": "Zilla"
					}
				},
				{
					"id": 4,
					"start_time": "2016-01-19T12:02:23 -01:00",
					"team_home": {
						"id": 37,
						"name": "Rocklogic"
					},
					"team_away": {
						"id": 44,
						"name": "Mitroc"
					}
				},
				{
					"id": 5,
					"start_time": "2016-01-03T02:51:54 -01:00",
					"team_home": {
						"id": 32,
						"name": "Sultraxin"
					},
					"team_away": {
						"id": 12,
						"name": "Empirica"
					}
				}
			]
		},
		{
			"id": 1,
			"name": "Enjola",
			"date_start": "2016-02-25T02:14:44 -01:00",
			"matches": [
				{
					"id": 0,
					"start_time": "2016-03-09T12:49:27 -01:00",
					"team_home": {
						"id": 68,
						"name": "Zuvy"
					},
					"team_away": {
						"id": 46,
						"name": "Phuel"
					}
				},
				{
					"id": 1,
					"start_time": "2016-02-22T12:01:17 -01:00",
					"team_home": {
						"id": 62,
						"name": "Zillacom"
					},
					"team_away": {
						"id": 53,
						"name": "Kengen"
					}
				},
				{
					"id": 2,
					"start_time": "2016-02-19T11:42:00 -01:00",
					"team_home": {
						"id": 4,
						"name": "Stralum"
					},
					"team_away": {
						"id": 65,
						"name": "Farmage"
					}
				},
				{
					"id": 3,
					"start_time": "2016-02-27T11:01:48 -01:00",
					"team_home": {
						"id": 80,
						"name": "Turnling"
					},
					"team_away": {
						"id": 22,
						"name": "Digiprint"
					}
				},
				{
					"id": 4,
					"start_time": "2016-01-13T03:25:12 -01:00",
					"team_home": {
						"id": 66,
						"name": "Zyple"
					},
					"team_away": {
						"id": 92,
						"name": "Bedder"
					}
				}
			]
		},
		{
			"id": 2,
			"name": "Fortean",
			"date_start": "2016-02-19T05:05:23 -01:00",
			"matches": [
				{
					"id": 0,
					"start_time": "2016-02-24T11:11:28 -01:00",
					"team_home": {
						"id": 22,
						"name": "Euron"
					},
					"team_away": {
						"id": 19,
						"name": "Eweville"
					}
				},
				{
					"id": 1,
					"start_time": "2016-03-18T04:53:04 -01:00",
					"team_home": {
						"id": 61,
						"name": "Isologica"
					},
					"team_away": {
						"id": 32,
						"name": "Comdom"
					}
				},
				{
					"id": 2,
					"start_time": "2016-01-23T05:20:21 -01:00",
					"team_home": {
						"id": 14,
						"name": "Combogene"
					},
					"team_away": {
						"id": 3,
						"name": "Buzzness"
					}
				},
				{
					"id": 3,
					"start_time": "2016-03-16T01:09:04 -01:00",
					"team_home": {
						"id": 18,
						"name": "Bristo"
					},
					"team_away": {
						"id": 44,
						"name": "Obones"
					}
				},
				{
					"id": 4,
					"start_time": "2016-01-09T04:55:38 -01:00",
					"team_home": {
						"id": 42,
						"name": "Applidec"
					},
					"team_away": {
						"id": 13,
						"name": "Cosmetex"
					}
				},
				{
					"id": 5,
					"start_time": "2016-03-20T03:14:40 -01:00",
					"team_home": {
						"id": 36,
						"name": "Elita"
					},
					"team_away": {
						"id": 14,
						"name": "Zentility"
					}
				}
			]
		}
	];


	$scope.db.match = {};
	$scope.db.match.start = new Date();

	$scope.timeUpdate = function(date) {
		$scope.db.match.start = new Date();
	}

	$scope.score = function() {
		$scope.timeUpdate();
		$scope.selected.start = $scope.db.match.start.getHours() + ":" + $scope.db.match.start.getMinutes() + ":" + $scope.db.match.start.getSeconds();

		$location.path('/');
	}

});

app.controller("Scores", function($scope) {

	$scope.scoreSelect = {};

	$scope.scoreSelect.options = [
		{ id : "Q12", name: "Nissan" },
		{ id : "TR7", name: "Toyota" },
		{ id : "D4R", name: "Fiat" },
	];

});