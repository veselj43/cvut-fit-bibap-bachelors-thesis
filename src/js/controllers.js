
/**
 * Controllers
 */
app.controller('PageCtrl', function ($scope, $rootScope, $location, Auth) {
	console.log("User auth level is: " + Auth.getAuthLvl())

	$scope.getActiveClass = function (path) {
		var current = $location.path().substr(0, path.length)
		if (path !== '/') 
			return (current === path) ? 'active' : ''
		else 
			return ($location.path() === '/') ? 'active' : ''
	}

	$scope.login = function(type, data, relog = true) {
		if (relog || !$scope.logged()) Auth.login(type, data)

		if (!angular.isObject(data)) {
			// err
			return
		}

		if (type === 'team') {
			// TODO
			// $scope.form[type].name
			// $scope.form[type].password
		}
		else if (type === 'tournament') {
			Auth.lastTournament(data.tournament)
			// $scope.form[type].password
			$location.path('/selectMatch/' + data.tournament)
		}
		else if (type === 'admin') {
			// TODO
			// $scope.form[type].name
			// $scope.form[type].password
		}
	}

	$scope.logout = function() {
		Auth.logout()
	}

	$scope.logged = function(authLvl = 1, exact = false) {
		return Auth.check(authLvl, exact)
	}

	$scope.getLoginData = function() {
		Auth.getData()
	}

})

app.controller('Login', function($scope, $location, API) {

	$scope.form = {}

	$scope.tournaments = API.getMatches

})

app.controller('newTournament', function($scope) {

	function emptyRow(last) {
		return { id : last + 1, name: "", group: "" }
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

app.controller("SelectTournament", function($scope, $location, API) {

	$scope.selected = {}

	$scope.data = API.getMatches

})

app.controller("SelectMatch", function($scope, $location, $routeParams, Auth, API) {

	$scope.selected = {}

	function TourID() {
		if (Auth.getData().tournament) 
			return Auth.getData().tournament
		if ($routeParams.TourID)
			return $routeParams.TourID
		if (Auth.lastTournament()) 
			return Auth.lastTournament()
		return 0
	}

	$scope.data = API.getMatches[TourID()]

	$scope.score = function(instant = false) {
		// $scope.selected.start = $scope.db.match.start.getHours() + ":" + $scope.db.match.start.getMinutes() + ":" + $scope.db.match.start.getSeconds()

		if (angular.isObject($scope.selected.match)) {
			// Storage.set("match", $scope.selected.match)
		}
		else {
			// err
		}

		if (instant) {
			$location.path('/scoring/' + $scope.selected.match.id)
		}
		else {
			$location.path('/scoring/' + $scope.selected.match.id)
		}
	}

})

app.controller("Scoring", function($scope, $routeParams, Globals, API) {

	$scope.data = API.getPlayers

	$scope.db = []

	$scope.actualScore = {
		"home": 0,
		"away": 0
	}

	$scope.scored = {}

	function emptyTemp() {
		$scope.scored = {
			"point": Globals.default,
			"assist": Globals.default
		}
	}

	$scope.plus = function(team) {
		$scope.scored.team = team
	}

	$scope.score = function(opt) {
		if (opt) {
			$scope.db.push(angular.copy($scope.scored))
			$scope.actualScore[$scope.scored.team]++
			$scope.stepBack()
		}
		emptyTemp()
	}

	$scope.stepBack = function(direction = true) {
		if (direction) { // show "cancel last action" option
			$('#stepBack').show()
		}
		else if ($scope.db.length) { // actually cancel last action
			$scope.actualScore[$scope.db[$scope.db.length-1].team]--
			$scope.db.splice($scope.db.length-1, 1)
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

	emptyTemp()

	$('#scorePoint').on('hidden.bs.modal', function () {
	    emptyTemp()
	})

})

app.controller("Spirit", function($scope, Auth, API, flash) {

	$scope.selected = {}

	$scope.data = API.getMatches[1].matches

	$scope.spirit = {}

	$scope.select = function(score) {
		$scope.selected.score = score
	}

	$scope.save = function() {
		flash('success', 'Uloženo')
	}

})

app.controller("Scores", function($scope, $rootScope, API) {

	$scope.selected = {}

	$scope.data = API.getMatches

	$scope.scoreData = {}


	$scope.show = function() {
		if ($rootScope.isEmpty($scope.selected.tournament)) {
			$scope.scoreData = {}
			return
		}
		if ($rootScope.isEmpty($scope.selected.match)) {
			$scope.scoreData = $scope.selected.tournament.matches
		}
		else {
			$scope.scoreData = [$scope.selected.match]
		}
		// console.log('selected.match has changed.')
		// console.log($scope.scoreData.length)
	}

	$scope.$watch('selected', $scope.show, true)

})
