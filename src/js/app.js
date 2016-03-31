
$(document).ready(function(){
	//Handles menu drop down
	$('.dropdown-menu').find('form').click(function (e) {
		e.stopPropagation()
	})
})

/**
 * Main AngularJS Web Application
 */
var app = angular.module('ufss', [
	'ngSanitize',
	'ngRoute',
	'flash',
	'pascalprecht.translate'
])

app.run(function($rootScope) {

	$rootScope.isEmpty = function(value) {
		if (
			typeof(value) === "undefined" ||
			value === null ||
			value == {}
		) return true
		return false
	}

	$rootScope.decider = function(val, ifTrue, ifFalse) {
		return (val) ? ifTrue : ifFalse
	}

})

app.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en', {
    'TEST': 'Hello'
  })
 
  $translateProvider.translations('cs', {
    'TEST': 'Ahoj'
  })
 
  $translateProvider.useSanitizeValueStrategy('sanitize')
  $translateProvider.preferredLanguage('cs')
}])

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {

	var partPath = "partials/"

	$routeProvider
		// Home
		.when("/", {templateUrl: partPath + "home.html", controller: "PageCtrl"})
		// Actions
		.when("/login", {templateUrl: partPath + "login.html", controller: "PageCtrl"})
		.when("/newTournament", {templateUrl: partPath + "newTournament.html", controller: "PageCtrl"})
		.when("/selectTournament", {templateUrl: partPath + "selectTournament.html", controller: "PageCtrl"})
		.when("/selectMatch/:TourID?", {templateUrl: partPath + "selectMatch.html", controller: "PageCtrl"})
		.when("/scoring/:MatchID", {templateUrl: partPath + "scoring.html", controller: "PageCtrl"})
		.when("/spirit", {templateUrl: partPath + "spirit.html", controller: "PageCtrl"})
		.when("/scores", {templateUrl: partPath + "scores.html", controller: "PageCtrl"})
		// Pages
		.when("/faq", {templateUrl: partPath + "faq.html", controller: "PageCtrl"})
		// else 404
		.otherwise({templateUrl: partPath + "404.html", controller: "PageCtrl"})
}])

app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total)

    for (var i=0; i<total; i++) {
      input.push(i)
    }

    return input
  }
})

/**
 * Services and Factories
 */
app.factory('Globals', function() {
    return {
        default : 'null'
    }
})

app.service('Auth', function() {
	let index = "login"
	let roles = {
		'team': 1,
		'tournament': 2,
		'admin': 3 
	}

	function ok() {
		return (typeof(Storage) !== "undefined") ? true : false
	}

	function get() {
		return JSON.parse(localStorage.getItem(index))
	}

	this.getAuthLvl = function() {
		if (!ok()) return 0
		return (get() === null) ? 0 : get().authLvl
	}

	this.getData = function() {
		if (!ok()) return null
		return (get() === null) ? null : get().data
	}

	this.check = function(authLvl, exact = false) {
		if (exact) return (authLvl === this.getAuthLvl())
		return (authLvl <= this.getAuthLvl())
	}

	this.login = function(type, data) {
		if (typeof(roles[type]) === "undefined") return false

		// check auth here

		localStorage.setItem(index, JSON.stringify({"authLvl": roles[type], "data": data}))
		return true
	}

	this.logout = function() {
		localStorage.setItem(index, null)
	}

	this.lastTournament = function(TourID) {
		if (TourID) localStorage.setItem("TourID", TourID)
		else return localStorage.getItem("TourID")
	}
})


/**
 * API - backend - db
 */
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
	]

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
	}
})