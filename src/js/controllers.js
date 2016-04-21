
'use strict';

function parseDateForEdit(str) {
	let res = str.split('T')[0]
	res = res.split('-')
	return res.reverse().join('-')
}

function searchAnObject(input, key, needle) {
	for (let i in input) {
		if (input[i][key] == needle) return input[i]
	}
	return null
}

/**
 * Controllers
 */
app.controller('PageCtrl', function ($scope, $rootScope, $location, Auth, API, flash) {
	console.log("User auth level is: " + Auth.getAuthLvl())

	$scope.getActiveClass = function (path) {
		// let current = $location.path().substr(0, path.length)
		let current = $location.path().split("/")[1]
		if (path !== '/') 
			return (current === path) ? 'active' : ''
		else 
			return ($location.path() === '/') ? 'active' : ''
	}

	$scope.login = function(data) {
		let nextLoc = ""
		let succMsg = ""

		if (!angular.isObject(data)) {
			flash('danger', 'Zadejte údaje pro přihlášení.')
			return
		}

		if ($rootScope.isEmpty(data.email)) {
			flash('danger', 'Zadejte email.')
			return
		}
		if ($rootScope.isEmpty(data.password)) {
			flash('danger', 'Zadejte heslo.')
			return
		}

		function callback(logData) {
			if (logData) {
				let role = logData.role

				if (role == 'club') {
					succMsg = 'Přihlášení k týmu proběhlo úspěšně.'
					nextLoc = '/spirit'
				}
				else if (role == 'tournament') {
					// Auth.storage("TourID", data.tournament)
					succMsg = 'Přihlášení k turnaji proběhlo úspěšně.'
					nextLoc = '/scoring/selectMatch'
				}
				else if (role == 'organizer') {
					succMsg = 'Přihlášení jako organizátor proběhlo úspěšně.'
					nextLoc = '/'
				}
				else if (role == 'admin') {
					succMsg = 'Přihlášení jako správce proběhlo úspěšně.'
					nextLoc = '/'
				}
				else {
					flash('danger', 'Přihlášení se nezdařilo. Chyba role. (' + role + ')')
					return
				}

				flash('success', succMsg)
				$location.path(nextLoc)
			}
			else {
				flash('danger', 'Chybné údaje přihlášení.')
				return
			}
		}

		Auth.login(data, callback)

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

	$scope.register = function(data) {
		data.role = 'organizer'
		API.register({
			data: data,
			ok: function(response) {
				flash('success', 'Registrace proběhla v pořádku.')
			}
			// TODO
			// ,
			// err: function(response) {
			// 	console.log(response)
			// 	flash('danger', 'Tento e-mail je již registrován.')
			// }
		})
	}

})

app.controller("Breadcrumb", function($scope, $rootScope, $location, Auth, LS) {

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
			LS.TourID(),
			LS.MatchID()
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

		if (!Auth.checkRole('admin') && !Auth.checkRole('organizer')) {
			bc.splice(0, 1)
		}

		return bc

	}

	$scope.bcData = $scope.breadcrumb()

})

app.controller('Home', function($scope, $location, $http, API, flash) {

	$scope.data = {}

	API.getMatchesForTour({
		id: 1, 
		append: '?active=true&terminated=false', 
		ok: function(response) {
			$scope.data.ongoing = response.data.items
		}
	})

	API.getTour({
		append: '?active=false&terminated=false', 
		ok: function(response) {
			$scope.data.upcomming = response.data.items
		}
	})

})

app.controller('Login', function($scope, $location, API, flash) {

	$scope.form = {}
	$scope.tournaments = []

	API.getTour({
		ok: function(response) {
			$scope.tournaments = response.data.items
		}
	})

})

app.controller('newTournament', function($scope, API, flash) {

	// Tabs
	let tabsBaseUrl = 'partials/newTournament/'

	$scope.tabs = [
		{
			title: 'Informace o turnaji',
			url: 'tourForm.html'
		}, {
			title: 'Hřiště',
			url: 'fieldsForm.html'
		}, {
			title: 'Zápasy',
			url: 'matchesForm.html'
		}
	]

	$scope.getFullTabUrl = function(tabUrl) {
		return tabsBaseUrl + tabUrl
	}

	$scope.currentTab = $scope.getFullTabUrl($scope.tabs[0].url)

	$scope.onClickTab = function(tab) {
		$scope.currentTab = $scope.getFullTabUrl(tab.url)
	}

	$scope.isActiveTab = function(tabUrl) {
		return $scope.getFullTabUrl(tabUrl) == $scope.currentTab
	}

	// input data for forms
	$scope.divisions = []
	
	API.getDivisions({
		ok: function(response) {
			$scope.divisions = response.data.items
		}
	})

	// new objects
	function newField(last = 0) {
		return {
			"id": last + 1 
		}
	}
	function newMatch(last = 0) {
		return {
			"active": 0,
			"terminated": 0
		}
	}

	$scope.tour = {
		country: "CZE"
	}
	$scope.master = {} // load data if editing

	$scope.tour.matches = [newMatch()]
	$scope.tour.fields = [newField()]

	$scope.addField = function() {
		$scope.tour.fields.push(newField($scope.tour.fields.length))
	}

	$scope.addMatch = function() {
		$scope.tour.matches.push(newMatch($scope.tour.matches.length))
	}

	$scope.parseDate = function(formDate) {
		if (typeof(formDate) === "undefined") return
		let parts = formDate.split('. ')
		return parts[2] + '-' + parts[1] + '-' + parts[0]
	}

	$scope.update = function(tour) {
		$scope.master = angular.copy(tour)
		$scope.master.dbDate = $scope.parseDate($scope.master.date)
	}

	$scope.reset = function() {
		$scope.tour = angular.copy($scope.master)
	}

	$scope.update($scope.tour)

})

app.controller("SelectTournament", function($scope, $location, LS, API, flash) {

	$scope.selected = {}
	$scope.data = []

	API.getTour({
		ok: function(response) {
			$scope.data = response.data.items
		}
	})

	$scope.select = function() {
		if (angular.isNumber($scope.selected.tournament)) {
			LS.store(LS.def.tid, $scope.selected.tournament)
			$location.path('/scoring/selectMatch')
		}
		else {
			flash('danger', 'Nebyl správně vybrán turnaj.')
		}
	}

})

app.controller("SelectMatch", function($scope, $rootScope, $location, $routeParams, LS, API, flash) {

	if (LS.TourID() === -1) return

	$scope.selected = {}
	$scope.data = []

	API.getTour({
		id: LS.TourID(), 
		ok: function(response) {
			$scope.data = response.data
		}
	})

	API.getMatchesForTour({
		id: LS.TourID(), 
		ok: function(response) {
			$scope.data.matches = response.data.items
		}
	})

	$scope.score = function(instant = false) {
		// $scope.selected.start = $scope.db.match.start.getHours() + ":" + $scope.db.match.start.getMinutes() + ":" + $scope.db.match.start.getSeconds()

		if (angular.isObject($scope.selected.match)) {
			if (instant) {
				// $location.path('/scoring/')
			}
			else {
				LS.store(LS.def.mid, $scope.selected.match.id)
				$location.path('/scoring')
			}
		}
		else {
			flash('danger', 'Nebyl správně vybrán zápas.')
		}
	}

})

app.controller("OnlineScoring", function($scope, $rootScope, $routeParams, Globals, API, LS, flash) {

	if (LS.TourID() === -1 || LS.MatchID() === -1) return

	$scope.data = []
	//API.getPlayers

	let TourID = LS.TourID();

	API.getMatchesForTour({
		id: TourID, 
		ok: function(response) {
			let tmp = response.data.items // TODO predelat na /match/{id} ??

			for (let i in tmp) {
				if (tmp[i].id == LS.MatchID()) {
					$scope.data = tmp[i]
					break;
				}
			}

			API.getPlayersForTour({
				id: TourID,
				append: '?teamId=' + $scope.data.homeTeam.id, 
				ok: function(response) {
					$scope.data.homeTeam.players = response.data.items
				},
				err: function() {
					$scope.data.homeTeam.players = []
					// TODO log error
				}
			})

			API.getPlayersForTour({
				id: TourID, 
				append: '?teamId=' + $scope.data.awayTeam.id, 
				ok: function(response) {
					$scope.data.awayTeam.players = response.data.items
				},
				err: function(response) {
					$scope.data.awayTeam.players = []
					// TODO log error
				}
			})
		}
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

	API.getMatchesForTour({
		id: 1,
		append: '?terminated=true', 
		ok: function(response) {
			$scope.data = response.data.items
		}
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

	API.getTour({
		append: '?terminated=true', 
		ok: function(response) {
			$scope.tours = response.data.items
		}
	})

	$scope.scoreData = {}

	let changedTour = function() {
		if ($rootScope.isEmpty($scope.selected.tournament)) {
			$scope.scoreData = {}
			return
		}

		API.getMatchesForTour({
			id: $scope.selected.tournament.id, 
			append: '?terminated=true', 
			ok: function(response) {
				$scope.scoreData = $scope.matches = response.data.items
			}
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

/*
 * Administration
 */
app.controller("Admin", function($scope, $rootScope, $filter, $route, $routeParams, $location, API, flash) {

	let tabsBaseUrl = 'partials/admin/'
	let baseUrl = '#/admin/'

	$scope.tabs = [
		{
			tab: 'clubs',
			create: 'newClub',
			edit: 'editClub',
			delete: 'club',
			title: 'Správa klubů'
		}, {
			tab: 'tours',
			create: '../newTournament',
			edit: 'editTour',
			delete: 'tournament',
			title: 'Správa turnajů'
		}, {
			tab: 'newUser',
			title: 'Vytvořit oddílový účet'
		}
	]

	let currentTab = ($routeParams.tab) ? $filter('getByKey')($scope.tabs, 'tab', $routeParams.tab)[0] : $scope.tabs[0]

	let create = $location.search().create
	let edit = $location.search().edit

	$scope.getHref = function(tab) {
		return baseUrl + tab
	}

	$scope.getTabFileUrl = function(tab = currentTab.tab) {
		return tabsBaseUrl + tab + '.html'
	}

	$scope.isActiveTab = function(tab) {
		return currentTab.tab == tab
	}

	$scope.actionFile = false
	if (create) $scope.actionFile = $scope.getTabFileUrl(currentTab.create)
	else if (edit) $scope.actionFile = $scope.getTabFileUrl(currentTab.edit)
	
	$scope.list = function() {
		$location.search('create', null)
		$location.search('edit', null)
	}

	$scope.create = function() {
		$location.search('create', true)
	}

	$scope.edit = function(id) {
		$location.search('edit', id)
	}

	$scope.delete = function(id) {
		// overit smazani (y/n)
		return
		API.delete({
			what: currentTab.delete,
			id: id,
			ok: function(response) {
				flash('success', 'Smazáno.')
				$route.reload()
			}
		})
	}

})

app.controller("Clubs", function($scope, $rootScope, API, flash) {

	$scope.clubs = []

	$scope.updateList = function() {
		API.get({
			what: 'club',
			ok: function(response) {
				$scope.clubs = response.data.items
			}
		})
	}
	$scope.updateList()

})

app.controller("Tours", function($scope, $rootScope, API, flash) {

	$scope.tours = []

	$scope.updateList = function() {
		API.get({
			what: 'tournament',
			ok: function(response) {
				$scope.tours = response.data.items
			}
		})
	}
	$scope.updateList()

})

app.controller("UserForm", function($scope, $rootScope, API, flash) {

	// new
	$scope.data = {
		clubs: [],
		roles: [
			{
				key: 'organizer', 
				name: 'Organizátor'
			}, {
				key: 'club', 
				name: 'Klubový účet'
			}
		]
	}

	API.get({
		what: 'club',
		ok: function(response) {
			$scope.data.clubs = response.data.items
		}
	})

	$scope.user = {
		role: "club"
	}

	$scope.post = function(data) {
		API.newUser({
			data: data,
			ok: function(response) {
				flash('success', 'Nový klubový účet byl vytvořen.')
				$route.reload()
			}
		})
	}

})

app.controller('ClubForm', function($scope, $location, $route, API, flash) {

	let edit = $location.search().edit

	// new
	$scope.club = {
		country: "CZE"
	}

	$scope.post = function(data) {
		API.newClub({
			data: data,
			ok: function(response) {
				flash('success', 'Nový klub byl přidán.')
				$route.reload()
			}
		})
	}

	// edit
	$scope.master = {} // load data if editing
	$scope.edit = {}

	$scope.reset = function() {
		$scope.edit = angular.copy($scope.master)
	}
	$scope.put = function(data) {
		API.editClub({
			data: data,
			id: edit,
			ok: function(response) {
				flash('success', 'Údaje klubu byly upraveny.')
				$route.reload()
			}
		})
	}

	if (edit) {
		API.get({
			what: 'club',
			id: edit,
			ok: function(response) {
				$scope.master = response.data
				$scope.reset()
			}
		})
	}

	let divisions = []
	$scope.teams = []

	API.get({
		what: 'division',
		ok: function(response) {
			divisions = response.data.items
		}
	})

	$scope.getDivision = function(id) {
		let res = searchAnObject(divisions, 'id', id)
		return (res) ? res.division : ''
	}

	$scope.updateList = function() {
		API.get({
			what: 'team',
			ok: function(response) {
				$scope.teams = response.data.items
			}
		})
	}
	$scope.updateList()

})

app.controller('TourForm', function($scope, $location, $route, $filter, API, flash) {

	let edit = $location.search().edit

	// edit
	$scope.master = {} // load data if editing
	$scope.edit = {}

	$scope.reset = function() {
		$scope.edit = angular.copy($scope.master)
	}
	$scope.put = function(data) {
		API.editTour({
			data: data,
			id: edit,
			ok: function(response) {
				flash('success', 'Údaje klubu byly upraveny.')
				$route.reload()
			}
		})
	}

	if (edit) {
		API.get({
			what: 'tournament',
			id: edit,
			ok: function(response) {
				$scope.master = response.data
				$scope.master.startDate = $scope.master.startDate.split('T')[0]
				$scope.master.endDate = $scope.master.startDate.split('T')[0]
				$scope.reset()
			}
		})
	}

})

/*
 * Simpler actions
 */
app.controller("ForgottenPass", function($scope, $rootScope, API, flash){

	$scope.sendNewPass = function(data) {
		API.forgottenPass({
			data: data,
			ok: function(response) {
				flash('success', 'Na email vám bylo odesláno nové heslo.')
			},
			err: function(response) {
				if (response.status === 401) flash('warning', 'Byl zadán nezaregistrovaný email.')
			}
		})
	}

})
