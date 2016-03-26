
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
		.when("/login", {templateUrl: partPath + "login.html", controller: "PageCtrl"})
		.when("/newTournament", {templateUrl: partPath + "newTournament.html", controller: "PageCtrl"})
		.when("/selectTournament", {templateUrl: partPath + "selectTournament.html", controller: "PageCtrl"})
		.when("/selectMatch/:TourID", {templateUrl: partPath + "selectMatch.html", controller: "PageCtrl"})
		.when("/scoring/:MatchID", {templateUrl: partPath + "scoring.html", controller: "PageCtrl"})
		.when("/scores", {templateUrl: partPath + "scores.html", controller: "PageCtrl"})
		// Pages
		.when("/faq", {templateUrl: partPath + "faq.html", controller: "PageCtrl"})
		// else 404
		.otherwise({templateUrl: partPath + "404.html", controller: "PageCtrl"});
}]);

/**
 * Services and Factories
 */

app.factory('Globals', function() {
    return {
        default : 'null'
    };
});

app.service('Storage', function() {
	var data = [];

	this.set = function(index, value) {
		data[index] = value;
	}

	this.get = function(index = null) {
		return (index === null) ? data : data[index];
	}
});

app.service('API', function() {
	this.getMatches = [
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

	this.getPlayers = {
		"home": {
			"name": "Domácí",
			"players": [
			{
				"id": 0,
				"name": "Gretchen Murphy",
				"number": 52
			},
			{
				"id": 1,
				"name": "Valentine Yates",
				"number": 67
			},
			{
				"id": 2,
				"name": "Mcconnell Munoz",
				"number": 16
			},
			{
				"id": 3,
				"name": "Hunt Calderon",
				"number": 63
			},
			{
				"id": 4,
				"name": "Ava Colon",
				"number": 77
			},
			{
				"id": 5,
				"name": "Esmeralda Baker",
				"number": 4
			},
			{
				"id": 6,
				"name": "Laverne Potts",
				"number": 27
			},
			{
				"id": 7,
				"name": "Cole Sampson",
				"number": 94
			}
			]
		},
		"away": {
			"name": "Hosté",
			"players": [
			{
				"id": 0,
				"name": "Webb Hebert",
				"number": 32
			},
			{
				"id": 1,
				"name": "Elsa Duran",
				"number": 71
			},
			{
				"id": 2,
				"name": "Joyce Brennan",
				"number": 65
			},
			{
				"id": 3,
				"name": "Dorthy Gardner",
				"number": 63
			},
			{
				"id": 4,
				"name": "Billie Webster",
				"number": 26
			},
			{
				"id": 5,
				"name": "Tucker Slater",
				"number": 70
			},
			{
				"id": 6,
				"name": "Letha Mercer",
				"number": 52
			},
			{
				"id": 7,
				"name": "Tanisha Sandoval",
				"number": 85
			},
			{
				"id": 8,
				"name": "Estelle Mason",
				"number": 33
			}
			]
		}
	};
});

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

app.controller('Login', function($scope, $location, API) {

	$scope.form = {};

	$scope.tournaments = API.getMatches;

	$scope.send = function(type) {
		if (!angular.isObject($scope.form[type])) {
			// err
			return;
		}

		if (type === 'team') {
			// TODO
			// $scope.form[type].name;
			// $scope.form[type].password;
		}
		else if (type === 'tournament') {
			// $scope.form[type].password;
			$location.path('/selectMatch/' + $scope.form[type].tournament.id);
		}
		else if (type === 'admin') {
			// TODO
			// $scope.form[type].name;
			// $scope.form[type].password;
		}
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

app.controller("SelectTournament", function($scope, $location, Storage, API) {

	$scope.selected = {};

	$scope.data = API.getMatches;

	$scope.send = function() {
		if (angular.isObject($scope.selected.tournament)) {
			// Storage.set("tournament", $scope.selected.tournament);
			$location.path('/selectMatch/' + $scope.selected.tournament.id);
		}
		else {
			// err
		}
	}

});

app.controller("SelectMatch", function($scope, $location, $routeParams, API) {

	$scope.selected = {};

	$scope.data = API.getMatches[$routeParams.TourID].matches;

	$scope.score = function(instant = false) {
		// $scope.selected.start = $scope.db.match.start.getHours() + ":" + $scope.db.match.start.getMinutes() + ":" + $scope.db.match.start.getSeconds();

		if (angular.isObject($scope.selected.match)) {
			// Storage.set("match", $scope.selected.match);
		}
		else {
			// err
		}

		if (instant) {
			$location.path('/scoring/' + $scope.selected.match.id);
		}
		else {
			$location.path('/scoring/' + $scope.selected.match.id);
		}
	}

});

app.controller("Scoring", function($scope, $routeParams, Globals, API) {

	$scope.data = API.getPlayers;

	$scope.db = [];

	$scope.actualScore = {
		"home": 0,
		"away": 0
	}

	$scope.scored = {};

	$scope.emptyTemp = function() {
		$scope.scored = {
			"point": Globals.default,
			"assist": Globals.default
		}
	}

	$scope.plus = function(team) {
		$scope.scored.team = team;
	}

	$scope.score = function(opt) {
		if (opt) {
			$scope.db.push(angular.copy($scope.scored));
			$scope.actualScore[$scope.scored.team]++;
			$scope.stepBack();
		}
		$scope.emptyTemp();
	}

	$scope.stepBack = function(direction = true) {
		if (direction) { // show cancel last action option
			$('#stepBack').show();
		}
		else if ($scope.db.length) { // actually cancel last action
			$scope.actualScore[$scope.db[$scope.db.length-1].team]--;
			$scope.db.splice($scope.db.length-1, 1);
			$('#stepBack').hide();
		}
	}

	$scope.compare = function(rid,sid) {
		if (sid == "") return false;
		return rid == sid;
	}

	$scope.disabled = function(rid,sid) {
		return ($scope.compare(rid,sid)) ? "disabled" : "";
	}

	$scope.emptyTemp();

});

app.controller("Scores", function($scope) {

	$scope.scoreSelect = {};

	$scope.scoreSelect.options = [
		{ id : "Q12", name: "Nissan" },
		{ id : "TR7", name: "Toyota" },
		{ id : "D4R", name: "Fiat" },
	];

});