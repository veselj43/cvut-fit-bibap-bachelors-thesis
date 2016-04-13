
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
	// 'mgcrea.ngStrap',
	// 'pascalprecht.translate'
])

app.run(function($rootScope, $route, $location, $templateCache, Auth) {

	$rootScope.ngMessagesFile = "templates/_messages.html"

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
			access: ['admin', 'organizier']
		})
		.when("/newClub", {
			templateUrl: partPath + "newClub.html", 
			access: ['admin', 'team']
		})
		.when("/scoring/selectTournament", {
			templateUrl: partPath + "scoring/selectTournament.html", 
			access: ['admin', 'organizier']
		})
		.when("/scoring/selectMatch", {
			templateUrl: partPath + "scoring/selectMatch.html", 
			access: ['admin', 'organizier', 'tournament']
		})
		.when("/scoring", {
			templateUrl: partPath + "scoring/onlineScoring.html", 
			access: ['admin', 'organizier', 'tournament']
		})
		.when("/spirit", {
			templateUrl: partPath + "spirit.html", 
			access: ['admin', 'organizier', 'team']
		})
		.when("/scores", {
			templateUrl: partPath + "scores.html"
		})
		.when("/profile", {
			templateUrl: partPath + "profile.html", 
			access: ['organizier', 'team']
		})
		// Administration
		.when("/admin", {
			templateUrl: partPath + "admin.html", 
			access: ['admin']
		})
		.when("/admin/clubs", {
			templateUrl: partPath + "admin/clubs.html", 
			access: ['admin']
		})
		.when("/admin/tours", {
			templateUrl: partPath + "admin/tours.html", 
			access: ['admin']
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


/**
 * Custom filters
 */
app.filter('range', function() {
	return function(input, total) {
		total = parseInt(total)

		for (var i = 0; i < total; i++) {
			input.push(i)
		}

		return input
	}
})

app.filter('definedMatches', function() {
	return function(items) {
		var filtered = []

		angular.forEach(items, function(item) {
			if(item.homeTeam.name !== null && item.awayTeam.name !== null){
				filtered.push(item)
			}
		})

		// filtered.sort(function(a,b){
		//     if(a.indexOf(word) < b.indexOf(word)) return -1
		//     else if(a.indexOf(word) > b.indexOf(word)) return 1
		//     else return 0
		// })

		return filtered
	}
})

app.filter('definedValue', function() {
	return function(items, val) {
		var filtered = []

		angular.forEach(items, function(item) {
			if (item[val]) {
				filtered.push(item)
			}
		})

		// filtered.sort(function(a,b){
		//     if(a.indexOf(word) < b.indexOf(word)) return -1
		//     else if(a.indexOf(word) > b.indexOf(word)) return 1
		//     else return 0
		// })

		return filtered
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
		'organizier': 3,
		'admin': 4 
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
app.service('API', function($http, flash) {

	let basePath = 'http://catcher.zlutazimnice.cz/api/'

	function defErrCallback(data, status, headers, config) {
		flash('danger', 'Nezdařilo se načíst data. \nChyba byla zaznamenána a bude opravena. \nKód chyby: ' + status)
		// TODO log error
		console.log(config)
	}

	function mergeAppends(base, add) {
		return (add) ? base + add : base
	}

	// $http({ method: 'GET', url: '/foo' })
	// 	.success(function (data, status, headers, config) {
	// 	})
	// 	.error(function (data, status, headers, config) {
	// 	})

	function getPromise(what = "", params, append) {
		let uri = basePath + what
		uri += (params) ? ('/' + params) : 's'
		uri += (append) ? ('/' + append) : ''
		return $http.get(uri)
	}

	this.get = function(what, params, append, okCallback, errCallback = defErrCallback) {
		if (!okCallback) {
			console.log("callback is not a fn")
			return
		}
		getPromise(what, params, append).success(okCallback).error(errCallback)
	}

	this.getTour = function(req) {
		this.get('tournament', req.id, req.append, req.ok, req.err)
	}

	// this.getMatch = function(TourID, MatchID) {
	// 	this.get('tournament', id)
	// }

	this.getMatchesForTour = function(req) {
		this.get('tournament', req.id, mergeAppends('matches', req.append), req.ok, req.err)
	}

	this.getPlayersForTour = function(req) {
		this.get('club', req.id, mergeAppends('players', req.append), req.ok, req.err)
	}

	this.getPlayersForClub = function(req) {
		this.get('club', req.id, mergeAppends('players', req.append), req.ok, req.err)
	}

	this.getDivisions = function(req) {
		this.get('division', null, req.append, req.ok, req.err)
	}

	this.basicGet = function(append) {
		return $http.get(basePath + append)
	}

})