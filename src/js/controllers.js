
'use strict';

/**
 * Controllers
 */
app.controller('PageCtrl', function ($scope, $rootScope, $location, Auth, flash) {
	console.log("User auth level is: " + Auth.getAuthLvl())

	$scope.getActiveClass = function (path) {
		// var current = $location.path().substr(0, path.length)
		var current = $location.path().split("/")[1]
		if (path !== '/') 
			return (current === path) ? 'active' : ''
		else 
			return ($location.path() === '/') ? 'active' : ''
	}

	$scope.login = function(type, data, relog = true) {
		let nextLoc = ""
		let succMsg = ""

		if (!angular.isObject(data)) {
			flash('danger', 'Zadejte údaje pro přihlášení.')
			return
		}

		if (type === 'team') {

			if ($rootScope.isEmpty(data.name)) {
				flash('danger', 'Zadejte název týmu.')
				return
			}
			if ($rootScope.isEmpty(data.password)) {
				flash('danger', 'Zadejte heslo týmu.')
				return
			}

			succMsg = 'Přihlášení k turnaji proběhlo úspěšně.'
			nextLoc = '/spirit'

		}
		else if (type === 'tournament') {

			if ($rootScope.isEmpty(data.tournament)) {
				flash('danger', 'Zvolte turnaj.')
				return
			}
			if ($rootScope.isEmpty(data.password) && !Auth.checkRole('admin')) {
				flash('danger', 'Zadejte heslo turnaje.')
				return
			}

			Auth.storage("TourID", data.tournament)
			succMsg = 'Přihlášení k turnaji proběhlo úspěšně.'
			nextLoc = '/scoring/selectMatch'

		}
		else if (type === 'admin') {

			if ($rootScope.isEmpty(data.name)) {
				flash('danger', 'Zadejte jméno správce.')
				return
			}
			if ($rootScope.isEmpty(data.password)) {
				flash('danger', 'Zadejte heslo správce.')
				return
			}

			succMsg = 'Přihlášení jako správce proběhlo úspěšně.'
			nextLoc = '/'

		}
		else {

			flash('danger', 'Přihlášení se nezdařilo. Chyba role.')
			return

		}

		if (relog || !$scope.logged()) {
			if (!Auth.login(type, data)) {
				// TODO rozdelit na jednotlive typy pro prehlednost
				flash('danger', 'Chybné údaje přihlášení.')
				return
			}
			
			flash('success', succMsg)
		}

		$location.path(nextLoc)
	}

	$scope.logout = function() {
		Auth.logout()
		flash('success', 'Odlášení proběhlo úspěšně')
	}

	$scope.logged = function(authLvl = 1, exact = false) {
		return Auth.check(authLvl, exact)
	}

	$scope.getLoginData = function() {
		Auth.getData()
	}

})

app.controller("Breadcrumb", function($scope, $rootScope, $location, Auth) {

	$scope.breadcrumb = function() {

		function activate(row) {
			row.class = 'active'
		}
		function disable(row) {
			row.class = 'disabled'
		}

		let bc = [
			{ "text": "Vybrat turnaj", 	"href": "/scoring/selectTournament", 	"class": "" },
			{ "text": "Vybrat zápas", 	"href": "/scoring/selectMatch", 		"class": "" },
			{ "text": "Skórování", 		"href": "/scoring", 					"class": "" }
		]

		let cached = [
			0,
			Auth.TourID(),
			Auth.MatchID()
		]

		let actPath = $location.path()

		if (actPath === bc[2].href && cached[2] === -1) {
			// go from scoring to tournament select when no tournament or match are selected
			if (cached[1] === -1) $location.path(bc[0].href)
			// go from scoring to match select when tournament is selected but match is not
			else $location.path(bc[1].href)
		}
		else if (actPath === bc[1].href && cached[1] === -1) {
			// go from match select to tournament select when no tournament is selected
			$location.path(bc[0].href)
		}

		for (let i = 0; i < bc.length; i++) {
			if (actPath === bc[i].href) activate(bc[i])
			else if (cached[i] === -1) disable(bc[i])
		}

		if (!Auth.checkRole('admin')) {
			bc.splice(0, 1)
		}

		return bc

	}

	$scope.bcData = $scope.breadcrumb()

})

app.controller('Home', function($scope, $location, $http, API, flash) {

	$scope.data = {
		// "ongoing": API.getOngoing,
		// 'upcomming': API.getUpcomming
	}

	API.getMatchesForTour(1, function(data) {
		$scope.data.ongoing = data.matches
	})

	API.getTours(function(data) {
		$scope.data.upcomming = data.items
	})

})

app.controller('Login', function($scope, $location, API, flash) {

	$scope.form = {}
	$scope.tournaments = []

	API.getTours(function(data) {
		$scope.tournaments = data.items
	})

})

app.controller('newTournament', function($scope, flash) {

	function emptyRow(last) {
		return { id: last + 1, name: "", group: "" }
	}

	$scope.nt = {}

	$scope.nt.table = [emptyRow(0)]

	$scope.addRow = function() {
		$scope.nt.table.push(emptyRow($scope.nt.table.length))
	}

	$scope.parseDate = function(formDate) {
		if (typeof(formDate) === "undefined") return
		var parts = formDate.split('. ')
		return parts[2] + '-' + parts[1] + '-' + parts[0]
	}

	$scope.update = function(nt) {
		$scope.master = angular.copy(nt)
		$scope.master.dbDate = $scope.parseDate($scope.master.date)
	}

	$scope.reset = function() {
		$scope.nt = angular.copy($scope.master)
	}

	$scope.update($scope.nt)

})

app.controller("SelectTournament", function($scope, $location, API, flash) {

	$scope.selected = {}
	$scope.data = []

	API.getTours(function(data) {
		$scope.data = data.items
	})

})

app.controller("SelectMatch", function($scope, $rootScope, $location, $routeParams, Auth, API, flash) {

	if (Auth.TourID() === -1) return

	$scope.selected = {}
	$scope.data = []

	API.getMatchesForTour(Auth.TourID(), function(data) {
		$scope.data = data.matches
	})

	$scope.score = function(instant = false) {
		// $scope.selected.start = $scope.db.match.start.getHours() + ":" + $scope.db.match.start.getMinutes() + ":" + $scope.db.match.start.getSeconds()

		if (angular.isObject($scope.selected.match)) {
			if (instant) {
				// $location.path('/scoring/')
			}
			else {
				Auth.storage("MatchID", $scope.selected.match.id)
				$location.path('/scoring')
			}
		}
		else {
			flash('danger', 'Nebyl správně vybrán zápas')
		}
	}

})

app.controller("OnlineScoring", function($scope, $rootScope, $routeParams, Globals, API, Auth, flash) {

	if (Auth.TourID() === -1 || Auth.MatchID() === -1) return

	$scope.data = []
	//API.getPlayers

	API.getMatchesForTour(Auth.TourID(), function(data) {
		let tmp = data.matches

		for (let i in tmp) {
			if (tmp[i].id == Auth.MatchID()) {
				$scope.data = tmp[i]
				break;
			}
		}

		API.getPlayersForClub(
			$scope.data.homeTeam.id,
			function(data) {
				$scope.data.homeTeam.players = data.players
			}, function() {
				$scope.data.homeTeam.players = []
				// TODO log error
			}
		)

		API.getPlayersForClub(
			$scope.data.awayTeam.id, 
			function(data) {
				$scope.data.awayTeam.players = data.players
			}, function(data) {
				$scope.data.awayTeam.players = []
				// TODO log error
			}
		)
	})

	$scope.db = []

	$scope.actualScore = {
		"homeTeam": 0,
		"awayTeam": 0
	}

	$scope.scored = {}

	$scope.detail = false

	function emptyTemp() {
		$scope.scored = {
			"point": Globals.default,
			"assist": Globals.default
		}
	}

	$scope.plus = function(team) {
		$scope.scored.team = team + 'Team'
	}

	$scope.score = function(opt) {
		if (opt) {
			$scope.actualScore[$scope.scored.team]++
			$scope.scored.actualScore = angular.copy($scope.actualScore)
			$scope.db.splice(0,0, angular.copy($scope.scored))
			$scope.stepBack()
		}
		emptyTemp()
	}

	$scope.stepBack = function(direction = true) {
		if (direction) { // show "cancel last action" option
			$('#stepBack').show()
		}
		else if ($scope.db.length) { // cancel last action
			$scope.actualScore[$scope.db[0].team]--
			$scope.db.splice(0, 1)
			$('#stepBack').hide()
		}
	}

	$scope.compare = function(rid,sid) {
		if (sid == "") return false
		return rid == sid
	}

	$scope.disabled = function(rid,sid) {
		return ($scope.compare(rid,sid)) ? "disabled" : ""
	}

	$scope.toggleScoreHistory = function() {
		document.getElementById('ScoreHistoryToggle').value = ($scope.detail) ? 'Zobrazit podrobnosti' : 'Skrýt podrobnosti'
		$scope.detail = !$scope.detail
	}

	$scope.echoPlayer = function(team, row, key) {
		// TODO hrac[s id row[key]]
		if (team + 'Team' === row.team) return (row[key] === "null") ? "Anonym" : row[key]
		return "-"
	}

	emptyTemp()

	$('#scorePoint').on('hidden.bs.modal', function () {
	    emptyTemp()
	})

})

app.controller("Spirit", function($scope, Auth, API, flash) {

	$scope.selected = {}

	$scope.data = []

	API.getMatchesForTour(1, function(data) {
		$scope.data = data.matches
	})

	$scope.spirit = {}

	$scope.select = function(score) {
		$scope.selected.score = score
	}

	$scope.save = function() {
		flash('success', 'Uloženo')
	}

})

app.controller("Scores", function($scope, $rootScope, API, flash) {

	$scope.selected = {}
	$scope.tours = []
	$scope.matches = []

	API.getTours(function(data) {
		$scope.tours = data.items
	})

	$scope.scoreData = {}

	let changedTour = function() {
		if ($rootScope.isEmpty($scope.selected.tournament)) {
			$scope.scoreData = {}
			return
		}

		API.getMatchesForTour($scope.selected.tournament.id, function(data) {
			$scope.scoreData = $scope.matches = data.matches
		})
	}

	let changedMatch = function() {
		if ($rootScope.isEmpty($scope.selected.match)) {
			$scope.scoreData = $scope.matches
		}
		else {
			$scope.scoreData = [$scope.selected.match]
		}
	}

	$scope.$watch('selected.match', changedMatch, true)
	$scope.$watch('selected.tournament', changedTour, true)

})
