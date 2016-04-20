
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
		.when("/forgottenPass", {
			templateUrl: partPath + "forgottenPass.html"
		})
		.when("/newTournament", {
			templateUrl: partPath + "newTournament.html", 
			access: ['admin', 'organizer']
		})
		.when("/newClub", {
			templateUrl: partPath + "newClub.html", 
			access: ['admin', 'club']
		})
		.when("/scoring/selectTournament", {
			templateUrl: partPath + "scoring/selectTournament.html", 
			access: ['admin', 'organizer']
		})
		.when("/scoring/selectMatch", {
			templateUrl: partPath + "scoring/selectMatch.html", 
			access: ['admin', 'organizer', 'tournament']
		})
		.when("/scoring", {
			templateUrl: partPath + "scoring/onlineScoring.html", 
			access: ['admin', 'organizer', 'tournament']
		})
		.when("/spirit", {
			templateUrl: partPath + "spirit.html", 
			access: ['admin', 'organizer', 'club']
		})
		.when("/scores", {
			templateUrl: partPath + "scores.html"
		})
		.when("/profile", {
			templateUrl: partPath + "profile.html", 
			access: ['organizer', 'club']
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

app.service('LS', function($rootScope) {
	let def = {
		auth: 'login',
		tid: 'TourID',
		mid: 'MatchID'
	}

	this.ok = function() {
		return (typeof(Storage) !== "undefined") ? true : false
	}

	// Auth
	this.setAuth = function(data) {
		localStorage.setItem(def.auth, JSON.stringify(data))
	}

	this.getAuth = function() {
		return JSON.parse(localStorage.getItem(def.auth))
	}

	this.getApiKey = function() {
		if (this.getAuth()) return this.getAuth().apiKey
		return null
	}

	// remember last actions
	this.TourID = function() {
		if (!$rootScope.isEmpty(this.storage(def.tid))) 
			return this.storage(def.tid)
		return -1
	}

	this.MatchID = function() {
		if (!$rootScope.isEmpty(this.storage(def.mid))) 
			return this.storage(def.mid)
		return -1
	}

	// univarsal storing
	this.store = function(index, value) {
		if (!$rootScope.isEmpty(value)) localStorage.setItem(index, value)
		else return localStorage.getItem(index)
	}
	this.remove = function(index) {
		localStorage.setItem(index, null)
	}
	
})

app.service('Auth', function($rootScope, $routeParams, API, LS) {
	let index = "login"
	let roles = {
		'club': 1,
		'tournament': 2,
		'organizer': 3,
		'admin': 4 
	}

	function get() {
		return LS.getAuth()
	}

	this.getAuthLvl = function() {
		if (!LS.ok()) return 0
		return (get() === null) ? 0 : roles[this.getData().role]
	}

	this.getData = function() {
		if (!LS.ok()) return null
		return (get() === null) ? null : get()
	}

	this.check = function(authLvl, exact = false) {
		if (exact) return (authLvl === this.getAuthLvl())
		return (authLvl <= this.getAuthLvl())
	}

	this.checkRole = function(role, exact = false) {
		if ($rootScope.isEmpty(roles[role])) return false
		return this.check(roles[role], exact)
	}

	this.login = function(logData, callback) {

		let logResponse = {}

		API.login({
			data: logData,
			ok: function(response) {
				logResponse = response.data
				logResponse.password = null
				LS.setAuth(logResponse)
				callback(logResponse)
			},
			err: function(response) {
				logResponse = false
				callback(false)
			}
		})
	}

	this.logout = function() {
		LS.setAuth(null)
		LS.remove("TourID")
		LS.remove("MatchID")
		$rootScope.$emit('$routeChangeStart')
	}

})


/**
 * API - backend - db
 */
app.service('API', function($http, LS, flash) {

	let basePath = 'http://catcher.zlutazimnice.cz/api/'

	function defErrCallback(response) {
		flash('danger', 'Nezdařilo se načíst data. \nChyba byla zaznamenána a bude opravena. \nKód chyby: ' + response.status)
		// TODO log error
		console.log(response)
	}

	function mergeAppends(base, add) {
		return (add) ? base + add : base
	}

	// $http({ method: 'GET', url: '/foo' })
	// 	.success(function (data, status, headers, config) {
	// 	})
	// 	.error(function (data, status, headers, config) {
	// 	})

	function collectUri(what = "", params, append) {
		let uri = basePath + what
		uri += (params) ? ('/' + params) : 's'
		uri += (append) ? ('/' + append) : ''
		return uri
	}

	function processPromise(httpPromise, okCallback, errCallback = defErrCallback) {
		if (!okCallback) {
			console.log("callback is not a fn")
			return
		}
		httpPromise.then(okCallback, errCallback)
	}

	// GET

	this.get = function(req) {
		processPromise($http.get(collectUri(req.what, req.id, req.append)), req.ok, req.err)
	}

	this.getTour = function(req) {
		req.what = 'tournament'
		this.get(req)
	}

	this.getMatchesForTour = function(req) {
		req.what = 'tournament'
		req.append = mergeAppends('matches', req.append)
		this.get(req)
	}

	this.getPlayersForTour = function(req) {
		req.what = 'club'
		req.append = mergeAppends('players', req.append)
		this.get(req)
	}

	this.getPlayersForClub = function(req) {
		req.what = 'club'
		req.append = mergeAppends('players', req.append)
		this.get(req)
	}

	this.getDivisions = function(req) {
		req.what = 'division'
		this.get(req)
	}

	this.basicGet = function(append) {
		return $http.get(basePath + append)
	}

	// POST

	this.post = function(req) {
		if (LS.getApiKey()) req.config = {headers: {'Authorization': LS.getApiKey()}}
		processPromise($http.post(req.uri, req.data, req.config), req.ok, req.err)
	}

	// login
	
	this.login = function(req) {
		req.uri = basePath + 'login'
		this.post(req)
	}
	this.forgottenPass = function(req) {
		req.uri = basePath + 'forgotten-password'
		this.post(req)
	}
	this.register = function(req) {
		req.uri = basePath + 'users'
		this.post(req)
	}

	// post for adding new objects
	
	this.newClub = function(req) {
		req.uri = collectUri('club')
		this.post(req)
	}

	this.newXX = function(req) {
		req.uri = collectUri(what, params, append)
		this.post(req)
	}

})