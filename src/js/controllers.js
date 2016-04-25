
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

function confirmYN(text, yesCallback, noCallback) {
	$('#confirmYN').modal('show')
	$('#confirmYN #text').html(text)
	if (yesCallback)
		$('#confirmYN #yes').bind('click', function(){
			yesCallback()
			$('#confirmYN').modal('hide')
			$('#confirmYN #yes').unbind()
			$('#confirmYN #no').unbind()
		})
	if (noCallback)
		$('#confirmYN #no').bind('click', function(){
			noCallback()
			$('#confirmYN #yes').unbind()
			$('#confirmYN #no').unbind()
		})
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

	$scope.gravatar = function() {
		let baseGravatarUrl = 'http://www.gravatar.com/avatar/'
		if ($scope.logged()) {
			let email = Auth.getData().email
			return baseGravatarUrl + CryptoJS.MD5(email.trim().toLowerCase()).toString()
		}
		return null
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

	$scope.getSelectDescForField = function(obj) {
		let r = obj.ide
		if (obj.description) r += ' - ' + obj.description
		return r
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
		append: '?terminated=false',
		ok: function(response) {
			$scope.data.matches = response.data.items
			if (response.data.count == 0) flash('warning', 'V tomto turnaji nejsou žádné zápasy ke skórvání.')
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

	let TourID = LS.TourID()
	let MatchID = LS.MatchID()

	if (TourID === -1 || MatchID === -1) return

	$scope.data = {}
	$scope.scored = {}
	$scope.players = []
	$scope.detail = false
	
	let activate = {
		active: true
	}

	function setMatchData() {
		API.get({
			what: 'match',
			id: MatchID, 
			append: 'points',
			ok: function(response) {
				$scope.data = response.data

				API.get({
					what: 'tournament',
					id: TourID,
					append: 'players?teamId=' + $scope.data.homeTeam.id, 
					ok: function(response) {
						$scope.data.homeTeam.players = response.data.items

						$scope.$watch(
							'scored.homePoint', 
							function() {
								$scope.players = ($scope.scored.homePoint) ? $scope.data.homeTeam.players : $scope.data.awayTeam.players
							}, true
						)
					},
					err: function() {
						$scope.data.homeTeam.players = []
						// TODO log error
					}
				})

				API.get({
					what: 'tournament',
					id: TourID, 
					append: 'players?teamId=' + $scope.data.awayTeam.id, 
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
	}

	API.edit({
		what: 'match',
		id: MatchID, 
		data: activate,
		ok: function(response) {
			setMatchData()
		},
		err: function(response) {
			if (response.status === 304) {
				setMatchData()
				return
			}
		}
	})

	function emptyTemp() {
		$scope.scored = {
			"assistPlayerId": Globals.default,
			"scorePlayerId": Globals.default,
			"callahan": false
		}
	}

	$scope.plus = function(isHome) {
		$scope.scored.homePoint = isHome
	}

	$scope.score = function(opt) {
		if (opt) {
			if ($scope.scored.assistPlayerId == Globals.default) $scope.scored.assistPlayerId = null
			if ($scope.scored.scorePlayerId == Globals.default) $scope.scored.scorePlayerId = null
			API.create({
				what: 'match',
				id: MatchID,
				append: 'points',
				data: $scope.scored,
				ok: function(response) {
					$scope.data.points.splice(0,0, angular.copy(response.data))
					$scope.stepBack()
				}
			})
		}
		emptyTemp()
	}

	$scope.stepBack = function(direction = true) {
		if (direction) { // show "cancel last action" option
			$('#stepBack').show()
		}
		else if ($scope.data.points.length) { // cancel last action
			API.delete({
				what: 'match',
				id: MatchID,
				append: 'points',
				ok: function(response) {
					$scope.data.points.splice(0, 1)
					$('#stepBack').hide()
				}
			})
		}
	}

	// 
	$scope.compare = function(rid,sid) {
		if (sid == "") return false
		return rid == sid
	}

	$scope.disabled = function(rid,sid) {
		return ($scope.compare(rid,sid)) ? "disabled" : ""
	}

	$scope.toggleScoreHistory = function() {
		$('#ScoreHistoryToggle').text(($scope.detail) ? 'Zobrazit podrobnosti' : 'Skrýt podrobnosti')
		$scope.detail = !$scope.detail
	}

	$scope.echoPlayer = function(player, show) {
		if (show) 
			return (player && player.firstname && player.lastname) ? player.firstname + ' ' + player.lastname : 'Anonym'
		return "-"
	}

	$scope.matchEnd = function() {
		// TODO prehled pred ukoncenim ??
		// let terminated = { active: false }
		confirmYN('Opravdu chcete ukončit zápas?', function(){
			let terminted = { terminated: true }
			API.edit({
				what: 'match',
				id: MatchID,
				data: terminated,
				ok: function(response) {
					flash('success', 'Zápas byl úspěšně ukončen')
				},
				err: function(response) {
					let msg = handleError(response.status)
					flash('danger', msg)
				}
			})
		})
	}

	emptyTemp()

	$('#scorePoint').on('hidden.bs.modal', function () {
	    emptyTemp()
	})

})

app.controller("Spirit", function($scope, Auth, API, flash) {

	$scope.selected = {}
	$scope.data = 
	$scope.spirit = {}

	API.getMatchesForTour({
		id: 1,
		append: '?active=true', 
		ok: function(response) {
			$scope.data = response.data.items
		}
	})

	API.get({
		what: 'tournament',
		id: 1,
		append: 'missing-spirits',
		ok: function(response) {
			console.log(response.data)
		}
	})

	$scope.select = function(what, score) {
		$scope.spirit[what] = score
	}

	$scope.save = function() {
		API.create({
			what: 'match',
			id: $scope.selected.match,
			append: 'spirits',
			ok: function(response) {
				flash('success', 'Uloženo.')
			}
		})
	}

})

app.controller("Scores", function($scope, $rootScope, API, flash) {

	$scope.selected = {}
	$scope.tours = []
	$scope.matches = []
	$scope.show = {}

	// TODO prozatim
	API.getTour({
		ok: function(response) {
			$scope.tours = $scope.tours.concat(response.data.items)
		}
	})
	// API.getTour({
	// 	append: '?terminated=true', 
	// 	ok: function(response) {
	// 		$scope.tours = $scope.tours.concat(response.data.items)
	// 	}
	// })
	// API.getTour({
	// 	append: '?active=true&terminated=false', 
	// 	ok: function(response) {
	// 		$scope.tours = $scope.tours.concat(response.data.items)
	// 	}
	// })

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

		API.get({
			what: 'tournament',
			id: $scope.selected.tournament.id, 
			append: 'groups', 
			ok: function(response) {
				console.log(response.data.items)
				$scope.show.groups = response.data.items
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

/**
 * User profile
 */
app.controller("Profile", function($scope, $rootScope, $route, $location, API, Auth, flash) {

	// TODO jen vlastni vytvorene turnaje
	$scope.tours = []
	$scope.user = Auth.getData()
	$scope.editUser = {}

	let basePath = 'partials/profile/'
	let params = $location.search()

	$scope.updateList = function() {
		API.get({
			what: 'tournament',
			ok: function(response) {
				$scope.tours = response.data.items
			}
		})
	}
	$scope.updateList()

	$scope.profile = function() {
		$scope.actionFile = null
		$location.search('editProfile', null)
		$location.search('createTour', null)
		$location.search('editTour', null)
	}

	$scope.editProfile = function() {
		$location.search('editProfile')
	}

	$scope.createTour = function() {
		$location.search('createTour')
	}

	$scope.editTour = function(id) {
		$location.search('editTour', id)
	}

	$scope.putUser = function(data) {
		console.log(data)
		API.editUser({
			id: $scope.user.id,
			data: data,
			ok: function(response) {
				flash('success', 'Údaje profilu upraveny.')
			}
		})
	}
	$scope.resetUser = function() {
		$scope.editUser.email = $scope.user.email
	}

	function getAFPath(fileName) {
		return basePath + fileName + '.html'
	}

	$scope.resetUser()

	if (params.editProfile) 
		$scope.actionFile = getAFPath('editUser')
	else if (params.createTour) 
		$scope.actionFile = getAFPath('../newTournament')
	else if (params.editTour)
		$scope.actionFile = getAFPath('../admin/editTour')

})

/**
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

	$scope.getTabFileUrl = function(tab) {
		let file = (tab) ? tab : (currentTab.file) ? currentTab.file : currentTab.tab
		return tabsBaseUrl + file + '.html'
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

	$scope.delete = function(id, name) {
		// overit smazani (y/n)
		confirmYN(
			'Opravdu smazat <strong>' + name + '</strong>?', 
			function(){
				API.delete({
					what: currentTab.delete,
					id: id,
					ok: function(response) {
						flash('success', 'Smazáno.')
						$route.reload()
					}
				})
			}
		)
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

	if (!edit) return

	// edit
	$scope.master = {} // load data if editing
	$scope.edit = {}
	$scope.divisions = []
	$scope.teams = []

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

	API.get({
		what: 'club',
		id: edit,
		ok: function(response) {
			$scope.master = response.data
			$scope.reset()
		}
	})

	API.get({
		what: 'division',
		ok: function(response) {
			$scope.divisions = response.data.items
		}
	})

	$scope.updateTeamList = function() {
		API.get({
			what: 'club',
			id: edit,
			append: 'teams',
			ok: function(response) {
				$scope.teams = response.data.items
			}
		})
	}
	$scope.updateTeamList()

	$scope.clubEditTabs = {
		basePath: 'partials/admin/clubEdit/',
		tabs: [
			{
				title: 'Týmy',
				file: 'teams.html'
			},
			{
				title: 'Hráči',
				file: 'players.html'
			}
		],
		selected: {},
		file: '',
		getTabFileUrl: function() {
			return $scope.clubEditTabs.basePath + $scope.clubEditTabs.selected.file
		},
		isActive: function(tab) {
			return (tab == $scope.clubEditTabs.selected.file)
		},
		select: function(tab) {
			$scope.clubEditTabs.selected = tab
			$scope.clubEditTabs.file = $scope.clubEditTabs.getTabFileUrl()
		}
	}
	$scope.clubEditTabs.select($scope.clubEditTabs.tabs[0])

	$scope.create_team = {
		form: {
			clubId: edit
		},
		show: function() {
			$('#createTeam').modal('show')
		},
		post: function(data) {
			API.newTeam({
				data: data,
				ok: function(response) {
					flash('success', 'Tým byl přidán.')
					$scope.updateTeamList()
					$('#createTeam').modal('hide')
				}
			})
		}
	}

	$scope.edit_team = {
		form: {},
		master: {},
		show: function(id) {
			API.get({
				what: 'team',
				id: id,
				ok: function(response) {
					$scope.edit_team.master = response.data
					$scope.edit_team.reset()
				}
			})
			$('#editTeam').modal('show')
		},
		reset: function() {
			$scope.edit_team.form = angular.copy($scope.edit_team.master)
		},
		put: function(data) {
			API.editTeam({
				id: $scope.edit_team.master.id,
				data: data,
				ok: function(response) {
					flash('success', 'Tým byl upraven.')
					$scope.updateTeamList()
					$('#editTeam').modal('hide')
				}
			})
		}
	}

	$scope.deleteTeam = function(id, name) {
		// overit smazani (y/n)
		confirmYN(
			'Opravdu smazat <strong>' + name + '</strong>?', 
			function(){
				API.delete({
					what: 'team',
					id: id,
					ok: function(response) {
						flash('success', 'Smazáno.')
						$scope.updateTeamList()
					}
				})
			}
		)
	}

	$scope.clubPlayer = {
		list: [],
		update: function() {
			API.get({
				what: 'club',
				id: edit,
				append: 'players',
				ok: function(response) {
					$scope.clubPlayer.list = response.data.items
				}
			})
		},
		create: {
			data: {
				clubId: edit
			},
			show: function() {
				$('#createPlayer').modal('show')
			},
			create: function(data) {
				API.newPlayer({
					data: data,
					ok: function(response) {
						flash('success', 'Hráč byl přidán.')
						$scope.clubPlayer.update()
						$('#createPlayer').modal('hide')
					}
				})
			}
		},
		edit: {
			master: {},
			data: {},
			show: function(id) {
				API.get({
					what: 'player',
					id: id,
					ok: function(response) {
						$scope.clubPlayer.edit.master = response.data
						$scope.clubPlayer.edit.reset()
					}
				})
				$('#editPlayer').modal('show')
			},
			edit: function(data) {
				API.editPlayer({
					id: $scope.clubPlayer.edit.master.id,
					data: data,
					ok: function(response) {
						flash('success', 'Hráč byl upraven.')
						$('#editPlayer').modal('hide')
						$scope.clubPlayer.update()
					}
				})
			},
			reset: function(data) {
				$scope.clubPlayer.edit.data = angular.copy($scope.clubPlayer.edit.master)
			}
		},
		delete: function(id, name) {
			// overit smazani (y/n)
			confirmYN(
				'Opravdu smazat <strong>' + name + '</strong>?', 
				function(){
					API.delete({
						what: 'player',
						id: id,
						ok: function(response) {
							flash('success', 'Hráč byl smazán.')
							$scope.clubPlayer.update()
						}
					})
				}
			)
		}
	}
	$scope.clubPlayer.update()

})

app.controller('TourForm', function($scope, $location, $route, $filter, API, flash) {

	let edit = ($location.search().editTour) ? $location.search().editTour : $location.search().edit

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
			email: data.email,
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
