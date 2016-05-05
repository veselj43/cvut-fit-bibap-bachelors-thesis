
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
let app = angular.module('ufss', [
	'ngSanitize',
	'ngRoute',
	'ngMessages',
	'flash',
	'isteven-multi-select',
	'checklist-model',
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
			typeof(value) === "undefined" ||
			value === undefined ||
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
			for (let i in array) {
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

	let partPath = "partials/"

	$routeProvider
		// Test
		.when("/test", {
			templateUrl: partPath + "_test.html"
		})
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
			access: ['admin']
		})
		.when("/editClub/:ClubId", {
			templateUrl: partPath + "editClub.html", 
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
			access: ['admin', 'organizer', 'club']
		})
		// Administration
		.when("/admin/:tab?", {
			templateUrl: partPath + "admin.html", 
			access: ['admin']
		})
		// .when("/admin/clubs", {
		// 	templateUrl: partPath + "admin/clubs.html", 
		// 	access: ['admin']
		// })
		// .when("/admin/tours", {
		// 	templateUrl: partPath + "admin/tours.html", 
		// 	access: ['admin']
		// })
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
	return function(input, param) {
		if (angular.isObject(param))
			for (let i = param.from; i < param.to; i++) {
				input.push(i)
			}
		else 
			for (let i = 0; i < param; i++) {
				input.push(i)
			}

		return input
	}
})

app.filter('getByKey', function() {
  return function(items, key, needle) {
		let filtered = []

		angular.forEach(items, function(item) {
			if(item[key] == needle) {
				filtered.push(item)
			}
		})

		return filtered
	}
})

app.filter('definedMatches', function() {
	return function(items) {
		let filtered = []

		angular.forEach(items, function(item) {
			if(item.homeTeam.name != null && item.awayTeam.name != null){
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
		let filtered = []

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

app.filter('czDate', function($filter) {
	let angularDateFilter = $filter('date')
	return function(theDate) {
		return angularDateFilter(theDate, 'dd. MM. yyyy')
	}
})

app.filter('czDateTime', function($filter) {
	let angularDateFilter = $filter('date')
	return function(theDate) {
		return angularDateFilter(theDate, 'dd. MM. yyyy HH:mm')
	}
})

app.filter('czTime', function($filter) {
	let angularDateFilter = $filter('date')
	return function(theDate) {
		return angularDateFilter(theDate, 'HH:mm')
	}
})

app.filter('DatePick', function($filter) {
	let angularDateFilter = $filter('date')
	return function(theDate) {
		return angularDateFilter(theDate, 'yyyy-mm-dd')
	}
})

/**
 * Directives
*/
app.directive('ngValidateTba', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function($scope, $element, $attrs, ngModel) {
			ngModel.$validators.required = function(modelValue) {
				return true
			}

			ngModel.$validators.tba = function(modelValue) {
				return (modelValue === null || !ngModel.$isEmpty(modelValue))
			}
		}
	}
})

app.directive('ngValidateNextStep', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function($scope, $element, $attrs, ngModel) {
			ngModel.$validators.consequence = function(modelValue) {
				if (!ngModel.$isEmpty(modelValue)) $scope.data[$attrs.ngValidateNextStep].finalStanding = ""
				return true
			}
		}
	}
})

app.directive('ngValidateFinalStanding', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function($scope, $element, $attrs, ngModel) {
			ngModel.$validators.consequence = function(modelValue) {
				if (!ngModel.$isEmpty(modelValue)) $scope.data[$attrs.ngValidateFinalStanding].nextStepIde = ""
				return !(ngModel.$isEmpty(modelValue) && ngModel.$isEmpty($scope.data[$attrs.ngValidateFinalStanding].nextStepIde))
			}

			ngModel.$validators.standing = function(modelValue) {
				return (!angular.isNumber(modelValue) || modelValue > 0)
			}
		}
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
	this.def = {
		auth: 'login',
		tid: 'TourID',
		mid: 'MatchID'
	}

	let def = this.def

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
		if (!$rootScope.isEmpty(this.store(def.tid))) 
			return this.store(def.tid)
		return -1
	}

	this.MatchID = function() {
		if (!$rootScope.isEmpty(this.store(def.mid))) 
			return this.store(def.mid)
		return -1
	}

	// uniletsal storing
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
		flash(
			'danger', 
			'Nezdařilo se načíst data. \n' + 
			'Chyba byla zaznamenána a bude opravena. \nKód chyby: ' + response.status + ' ' + response.statusText
		)
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

	/** 
	 * GET
	 * req.data - post data
	 * req.ok - success callback fn
	 */

	this.get = function(req) {
		if (LS.getApiKey()) req.config = {headers: {'Authorization': LS.getApiKey()}}
		processPromise($http.get(collectUri(req.what, req.id, req.append), req.config), req.ok, req.err)
	}
	this.delete = function(req) {
		if (LS.getApiKey()) req.config = {headers: {'Authorization': LS.getApiKey()}}
		processPromise($http.delete(collectUri(req.what, req.id, req.append), req.config), req.ok, req.err)
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

	/**
	 * POST / PUT
	 * req.data - post data
	 * req.ok - success callback fn
	 */
	
	this.post = function(req) {
		if (LS.getApiKey()) req.config = {headers: {'Authorization': LS.getApiKey()}}
		processPromise($http.post(req.uri, req.data, req.config), req.ok, req.err)
	}
	this.put = function(req) {
		if (LS.getApiKey()) req.config = {headers: {'Authorization': LS.getApiKey()}}
		processPromise($http.put(req.uri, req.data, req.config), req.ok, req.err)
	}

	// login
	
	this.login = function(req) {
		req.uri = basePath + 'login'
		this.post(req)
	}
	this.forgottenPass = function(req) {
		req.uri = basePath + 'forgotten-password?email=' + req.email
		this.post(req)
	}
	this.register = function(req) {
		req.uri = basePath + 'users'
		this.post(req)
	}

	// post / put for adding new objects / editing existing ones
	
	this.newUser = function(req) {
		req.uri = collectUri('user')
		this.post(req)
	}
	this.editUser = function(req) {
		if (!req.id) return
		req.uri = collectUri('user', req.id)
		this.put(req)
	}

	this.newClub = function(req) {
		req.uri = collectUri('club')
		this.post(req)
	}
	this.editClub = function(req) {
		req.uri = collectUri('club', req.id)
		this.put(req)
	}

	this.newTeam = function(req) {
		req.uri = collectUri('team')
		this.post(req)
	}
	this.editTeam = function(req) {
		req.uri = collectUri('team', req.id)
		this.put(req)
	}

	this.newPlayer = function(req) {
		req.uri = collectUri('player')
		this.post(req)
	}
	this.editPlayer = function(req) {
		req.uri = collectUri('player', req.id)
		this.put(req)
	}

	this.editTour = function(req) {
		req.uri = collectUri('tournament', req.id)
		this.put(req)
	}

	this.create = function(req) {
		req.uri = collectUri(req.what, req.id, req.append)
		this.post(req)
	}

	this.edit = function(req) {
		req.uri = collectUri(req.what, req.id, req.append)
		this.put(req)
	}

})