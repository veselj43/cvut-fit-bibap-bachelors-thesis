
'use strict';

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
	'ngMessages',
	'flash',
	// 'pascalprecht.translate'
])

app.run(function($rootScope, $route, $location, $templateCache, Auth) {

	// clears cache
	// $rootScope.$on('$viewContentLoaded', function() {
	// 	$templateCache.removeAll()
	// })

	$rootScope.isEmpty = function(value) {
		if (
			value === undefined ||
			typeof(value) === "undefined" ||
			value === null ||
			value === {} ||
			value === "null" ||
			value === ""
		) return true
		return false
	}

	$rootScope.decider = function(val, ifTrue, ifFalse) {
		return (val) ? ifTrue : ifFalse
	}

	$rootScope.$on('$routeChangeStart', function (event, next) {

		function authAllow(array) {
			for (var i in array) {
				if (Auth.checkRole(array[i], true)) return true
			}
			return false
		}

		let params = ($rootScope.isEmpty(next)) ? $route.current : next

		if (params.access !== undefined) {
			if (!authAllow(params.access)) $location.path('/')
		}

	})

})

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {

	var partPath = "partials/"

	$routeProvider
		// Home
		.when("/", {
			templateUrl: partPath + "home.html"
		})
		// Actions
		.when("/login", {
			templateUrl: partPath + "login.html"
		})
		.when("/newTournament", {
			templateUrl: partPath + "newTournament.html", 
			access: ['admin']
		})
		.when("/scoring/selectTournament", {
			templateUrl: partPath + "scoring/selectTournament.html", 
			access: ['admin']
		})
		.when("/scoring/selectMatch", {
			templateUrl: partPath + "scoring/selectMatch.html", 
			access: ['admin', 'tournament']
		})
		.when("/scoring", {
			templateUrl: partPath + "scoring/onlineScoring.html", 
			access: ['admin', 'tournament']
		})
		.when("/spirit", {
			templateUrl: partPath + "spirit.html", 
			access: ['admin', 'team']
		})
		.when("/scores", {
			templateUrl: partPath + "scores.html"
		})
		// Pages
		.when("/faq", {
			templateUrl: partPath + "faq.html"
		})
		// else 404
		.otherwise({
			templateUrl: partPath + "404.html"
		})
}])


/**
 * translation ('pascalprecht.translate' module) ready, but not in use yet
 */

// app.config(['$translateProvider', function ($translateProvider) {
//   $translateProvider.translations('en', {
//     'TEST': 'Hello'
//   })
 
//   $translateProvider.translations('cs', {
//     'TEST': 'Ahoj'
//   })
 
//   $translateProvider.useSanitizeValueStrategy('sanitize')
//   $translateProvider.preferredLanguage('cs')
// }])

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

app.service('Auth', function($rootScope, $routeParams) {
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

	this.checkRole = function(role, exact = false) {
		if ($rootScope.isEmpty(roles[role])) return false
		return this.check(roles[role], exact)
	}

	this.login = function(type, data) {
		if (typeof(roles[type]) === "undefined") return false

		// check auth here

		localStorage.setItem(index, JSON.stringify({"authLvl": roles[type], "data": data}))
		return true
	}

	this.logout = function() {
		localStorage.setItem(index, null)
		localStorage.setItem("TourID", null)
		localStorage.setItem("MatchID", null)
		$rootScope.$emit('$routeChangeStart')
	}

	this.storage = function(index, value) {
		if (!$rootScope.isEmpty(value)) localStorage.setItem(index, value)
		else return localStorage.getItem(index)
	}

	this.TourID = function() {
		if (!$rootScope.isEmpty(this.getData().tournament)) 
			return this.getData().tournament
		if (!$rootScope.isEmpty(this.storage("TourID"))) 
			return this.storage("TourID")
		return -1
	}

	this.MatchID = function() {
		if (!$rootScope.isEmpty(this.storage("MatchID"))) 
			return this.storage("MatchID")
		return -1
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

	this.getUpcomming = [
		{
			"id": 0,
			"date_start": "15. 03. 2016 22:25:03",
			"name": "Ecratic",
			"place": "Illumity"
		},
		{
			"id": 1,
			"date_start": "02. 01. 2016 07:32:50",
			"name": "Geoform",
			"place": "Boilcat"
		},
		{
			"id": 2,
			"date_start": "18. 02. 2016 07:43:45",
			"name": "Nexgene",
			"place": "Dancity"
		},
		{
			"id": 3,
			"date_start": "02. 01. 2016 23:02:25",
			"name": "Pyrami",
			"place": "Namebox"
		},
		{
			"id": 4,
			"date_start": "11. 03. 2016 16:20:54",
			"name": "Flumbo",
			"place": "Cowtown"
		}
	]

	this.getOngoing = [
		{
			"id": 0,
			"date_start": "13. 02. 2016 06:52:18",
			"team_home": {
				"name": "Harmoney"
			},
			"team_away": {
				"name": "Dreamia"
			},
			"place": "Cinaster"
		},
		{
			"id": 1,
			"date_start": "10. 02. 2016 10:59:05",
			"team_home": {
				"name": "Qot"
			},
			"team_away": {
				"name": "Tropolis"
			},
			"place": "Furnitech"
		},
		{
			"id": 2,
			"date_start": "29. 03. 2016 03:21:51",
			"team_home": {
				"name": "Xylar"
			},
			"team_away": {
				"name": "Ersum"
			},
			"place": "Xixan"
		}
	]
})