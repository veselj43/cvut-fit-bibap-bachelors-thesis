
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
	$('#confirmYN').on('hide.bs.modal', function() {
		$('#confirmYN #yes').unbind()
		$('#confirmYN #no').unbind()
		$('#confirmYN').unbind()
		if (noCallback) noCallback()
	})
	$('#confirmYN #yes').bind('click', function(){
		if (yesCallback) yesCallback()
		$('#confirmYN').modal('hide')
	})
	$('#confirmYN #no').bind('click', function(){
		$('#confirmYN').modal('hide')
	})
}

/**
 * Controllers
 */
app.controller('PageCtrl', function ($scope, $rootScope, $location, Auth, API, flash) {

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
			},
			err: function(response) {
				if (response.status === 400)
					flash('danger', 'Tento e-mail je již registrován.')
				else
					flash('danger', 'Chyba serveru.\nKód: ' + response.status)
			}
		})
	}

	$scope.gravatar = function() {
		let baseGravatarUrl = 'http://www.gravatar.com/avatar/'
		if ($scope.logged()) {
			let email = Auth.getData().email
			return baseGravatarUrl + md5(email.trim().toLowerCase()).toString()
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
		append: '?terminated=false', 
		ok: function(response) {
			$scope.data.upcomming = response.data.items
		}
	})

})

app.controller('Login', function($scope, $location, API, flash) {

	$scope.form = {}

})

app.controller('newTournament', function($scope, $filter, API, flash) {

	// Tabs
	let tabsBaseUrl = 'partials/newTournament/'

	$scope.tooltips = {
		tba: 'TBA = bude doplněno podle předchozích zápasů'
	}

	$scope.tabs = [
		{
			title: 'Informace o turnaji',
			url: 'tourForm.html'
		}, {
			title: 'Hřiště',
			url: 'fieldsForm.html'
		}, {
			title: 'Playoff zápasy',
			url: 'matchesPlayoffForm.html'
		}, {
			title: 'Skupiny',
			url: 'groupsForm.html'
		}, {
			title: 'Skupinové zápasy',
			url: 'matchesForm.html'
		}
	]

	$scope.getFullTabUrl = function(tabUrl) {
		return tabsBaseUrl + tabUrl
	}

	$scope.currentTabIndex = 0
	$scope.currentTab = $scope.getFullTabUrl($scope.tabs[0].url)

	$scope.onClickTab = function(index) {
		$scope.currentTabIndex = index
		$scope.currentTab = $scope.getFullTabUrl($scope.tabs[index].url)
	}

	$scope.isActiveTab = function(tabUrl) {
		return $scope.getFullTabUrl(tabUrl) == $scope.currentTab
	}

	$scope.isNextTab = function() {
		return ($scope.currentTabIndex < $scope.tabs.length-1)
	}

	$scope.nextTab = function() {
		$scope.onClickTab($scope.currentTabIndex + 1)
	}

	// input data for forms
	$scope.divisions = []
	$scope.teams = []
	$scope.teamCopies = []

	$scope.tour = {
		country: "CZE",
		groups: [newGroup()],
		fields: [newField()],
		playoff: [newMatch()]
	}
	$scope.tmpData = {
		groupMatches: [newMatch()]
	}
	let master = {}

	$scope.multiple = {
		teams: {
			texts: {
				selectAll       : "Vybrat vše",
				selectNone      : "Zrušit výběr",
				reset           : "Obnovit",
				search          : "Vyhledávání...",
				nothingSelected : "Nevybráno"
			},
			settings: {
				scrollable: true
			}
		}
	}
	
	API.get({
		what: 'division',
		ok: function(response) {
			$scope.divisions = response.data.items
		}
	})

	$scope.$watch('tour.divisionId', function() {
		API.get({
			what: 'team',
			append: '?divisionId=' + $scope.tour.divisionId,
			ok: function(response) {
				$scope.teams = response.data.items
			}
		})
	}, true)
	

	// new objects
	function newField(last = 0) {
		return {
			"id": last + 1 
		}
	}
	function newGroup(last = 0) {
		return {
			//"id": last + 1 
			"advancements": []
		}
	}
	function newMatch(last = 0) {
		return {
			startTime: {
				date: ($scope.tour && $scope.tour.startDate) ? $scope.tour.startDate : ""
			},
			winner: {
				"nextStepIde": null,
				"finalStanding": null
			},
			looser: {
				"nextStepIde": null,
				"finalStanding": null
			}
		}
	}

	$scope.addGroup = function() {
		$scope.tour.groups.push(newGroup($scope.tour.groups.length))
	}

	$scope.addField = function() {
		$scope.tour.fields.push(newField($scope.tour.fields[$scope.tour.fields.length-1].id))
	}

	$scope.addGroupMatch = function() {
		$scope.tmpData.groupMatches.push(newMatch($scope.tmpData.groupMatches.length))
	}

	$scope.addPlayoffMatch = function() {
		$scope.tour.playoff.push(newMatch($scope.tour.playoff.length))
	}

	let parseDate = function(date, time = '00:00') {
		return date + 'T' + time + ':00'
		// if (typeof(formDate) === "undefined") return
		// let parts = formDate.split('. ')
		// return parts[2] + '-' + parts[1] + '-' + parts[0]
	}

	let parseNull = function(variable) {
		return (variable == "" || variable == "null") ? null : variable
	}

	$scope.getSelectDescForField = function(obj) {
		let r = obj.ide
		if (obj.description) r += ' - ' + obj.description
		return r
	}

	let replaceIdWithSeeding = function(teamArr, id) {
		for (let i in teamArr) {
			if (teamArr[i].id == id) return teamArr[i].seeding
		}
		return null
	}

	$scope.update = function(tour) {
		master = angular.copy(tour)

		if (master.teams) {
			for (let i = 0; i < master.teams.length; i++) {
				master.teams[i].seeding = i+1
			}
		}
		if ($scope.tmpData.groupMatches.length) {
			for (let i in $scope.tmpData.groupMatches) {
				if (!master.groups[$scope.tmpData.groupMatches[i].group]) continue
				if (!master.groups[$scope.tmpData.groupMatches[i].group].matches) 
					master.groups[$scope.tmpData.groupMatches[i].group].matches = []
				let tmp = angular.copy($scope.tmpData.groupMatches[i])
				delete tmp.group
				master.groups[$scope.tmpData.groupMatches[i].group].matches.push(tmp)
			}
		}
		if (master.playoff.length) {
			for (let i in master.playoff) {
				master.playoff[i].endTime = parseDate(master.playoff[i].startTime.date, master.playoff[i].endTime)
				master.playoff[i].startTime = parseDate(master.playoff[i].startTime.date, master.playoff[i].startTime.time)
				master.playoff[i].looser.nextStepIde = parseNull(master.playoff[i].looser.nextStepIde)
				master.playoff[i].looser.FinalStanding = parseNull(master.playoff[i].looser.FinalStanding)
				master.playoff[i].winner.nextStepIde = parseNull(master.playoff[i].winner.nextStepIde)
				master.playoff[i].winner.FinalStanding = parseNull(master.playoff[i].winner.FinalStanding)
				master.playoff[i].homeSeed = replaceIdWithSeeding(master.teams, master.playoff[i].homeSeed)
				master.playoff[i].awaySeed = replaceIdWithSeeding(master.teams, master.playoff[i].awaySeed)
			}
		}
		if (master.groups.length) {
			for (let i in master.groups) {
				for (let j in master.groups[i].matches) {
					master.groups[i].matches[j].endTime = parseDate(
						master.groups[i].matches[j].startTime.date, 
						master.groups[i].matches[j].endTime
					)
					master.groups[i].matches[j].startTime = parseDate(
						master.groups[i].matches[j].startTime.date, 
						master.groups[i].matches[j].startTime.time
					)

					master.groups[i].matches[j].homeSeed = replaceIdWithSeeding(master.teams, master.groups[i].matches[j].homeSeed)
					master.groups[i].matches[j].awaySeed = replaceIdWithSeeding(master.teams, master.groups[i].matches[j].awaySeed)
				}
				// for (let j in master.groups[i].teams) {
				// 	master.groups[i].teams[j].id = replaceIdWithSeeding(master.teams, master.groups[i].teams[j].id)
				// }
			}
		}

		// $scope.x = master

		API.create({
			what: 'tournament',
			data: master,
			ok: function(response) {
				flash('success', 'Turnaj byl vytvořen.')
				API.edit({
					what: 'tournament',
					id: response.data.id,
					data: { ready: true },
					ok: function(response) {
					}
				})
			},
			err: function(response) {
				flash('danger', response.data.title + ": \n" + response.data.description)
			}
		})
	}


	$scope.$watch('tour.divisionId', function() {
		if ($scope.tour.divisionId)
			$scope.filteredTeams = $filter('getByKey')($scope.teams, 'divisionId', $scope.tour.divisionId)
		else 
			$scope.filteredTeams = []
	}, true)

	$scope.$watch('tour.teams', function() {
		if ($scope.tour.teams) {
			$scope.multiple.teams.$validation = {
				required: ($scope.tour.teams.length == 0)
			}
			for (let i = 0; i < $scope.tour.groups.length; i++) {
				$scope.teamCopies[i] = angular.copy($scope.tour.teams)
			}
		}
		else 
			$scope.tour.teams = []
	}, true)

	$scope.$watch('tour.groups.length', function() {
		for (let i = 0; i < $scope.tour.groups.length; i++) {
			if (!$scope.teamCopies[i])
				$scope.teamCopies[i] = angular.copy($scope.tour.teams)
		}
	}, true)

	// function setDatepicker(id) {
	// 	$(id).datepicker('setStartDate', $scope.tour.startDate)
	// 	$(id).datepicker('setEndDate', $scope.tour.endDate)
	// 	$(id).datepicker('setDate', $scope.tour.startDate)
	// }

	// $scope.$watch('tmpData.groupMatches.length', function() {
	// 	if ($scope.tour.startDate) {
	// 		setDatepicker('#startDate'+$scope.tmpData.groupMatches.length-1)
	// 	}
	// }, true)
	// $scope.$watch('tour.playoff.length', function() {
	// 	if ($scope.tour.startDate) {
	// 		setDatepicker('#po_startDate'+$scope.tour.playoff.length-1)
	// 	}
	// }, true)

})

app.controller("SelectTournament", function($scope, $location, LS, API, Auth, flash) {

	$scope.selected = {}
	$scope.data = []

	API.get({
		what: 'tournament',
		append: (Auth.check(4)) ? null : '?userId=' + Auth.getData().id,
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

app.controller("SelectMatch", function($scope, $rootScope, $location, $filter, $routeParams, LS, API, flash) {

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
			$scope.data.matches = $filter('definedMatches')(response.data.items)
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

	API.edit({
		what: 'tournament',
		id: TourID, 
		data: activate,
		ok: function(response) {
		},
		err: function(response) {
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
			let terminated = { terminated: true }
			API.edit({
				what: 'match',
				id: MatchID,
				data: terminated,
				ok: function(response) {
					flash('success', 'Zápas byl úspěšně ukončen')
					$location.path('/scoring/selectMatch')
				}
			})
		})
	}

	emptyTemp()

	$('#scorePoint').on('hidden.bs.modal', function () {
	    emptyTemp()
	})

})

app.controller("Roster", function($scope, $filter, Auth, API, flash) {

	$scope.selected = {
		tour: null,
		players: []
	}

	$scope.data= {
		filteredTours: [],
		tours: [],
		players: []
	}

	$scope.multiple = {
		texts: {
			selectAll       : "Vybrat vše",
			selectNone      : "Zrušit výběr",
			reset           : "Obnovit",
			search          : "Vyhledávání...",
			nothingSelected : "Nevybráno"
		},
		settings: {
			scrollable: true
		}
	}

	let clubID = Auth.getData().clubId
	let teamID = null

	let readyCount = {
		all: null,
		ready: 0
	}

	function ready() {
		readyCount.ready++
		if (readyCount.all > readyCount.ready) return

		angular.forEach($scope.data.tours, function(item) {
			for (let i in item.teams) {
				if (item.teams[i].clubId == clubID) {
					item.currentTeamID = item.teams[i].teamId
					$scope.data.filteredTours.push(angular.copy(item))
					break;
				}
			}
		})
	}

	API.get({
		what: 'tournament',
		append: '?terminated=false',
		ok: function(response) {
			$scope.data.tours = response.data.items
			readyCount.all = response.data.count

			angular.forEach($scope.data.tours, function(item) {
				API.get({
					what: 'tournament',
					id: item.id,
					append: 'teams',
					ok: function(response) {
						item.teams = response.data.items
						ready()
					}
				})
				API.get({
					what: 'tournament',
					id: item.id,
					append: 'players',
					ok: function(response) {
						item.players = response.data.items
					}
				})
			})
		}
	})

	API.get({
		what: 'club',
		id: clubID,
		append: 'players',
		ok: function(response) {
			$scope.data.players = response.data.items
			// $scope.data.players = $filter('getByKey')(response.data.items, 'clubId', clubID)
		}
	})

	$scope.actions = {
		save: function() {
			angular.forEach($scope.data.players, function(player) {
				if (player.ticked) {
					// console.log({playerId: player.id, teamId: $scope.selected.tour.currentTeamID})
					API.create({
						what: 'tournament',
						id: $scope.selected.tour.id,
						append: 'players',
						data: {playerId: player.id, teamId: $scope.selected.tour.currentTeamID},
						ok: function(response) {
							flash('Uloženo.')
						}
					})
				}
			})
		}
	}

})

app.controller("Spirit", function($scope, Auth, API, flash) {

	$scope.selected = {}
	$scope.data = []
	$scope.spirit = {}
	$scope.invalid = true

	API.get({
		what: 'match',
		id: 9,
		append: '', 
		ok: function(response) {
			$scope.data = [response.data]
		}
	})

	// API.get({
	// 	what: 'club',
	// 	id: LS.getData().clubId,
	// 	append: 'missing-spirits',
	// 	ok: function(response) {
	// 		console.log(response.data)
	// 	}
	// })

	$scope.select = function(what, score) {
		$scope.spirit[what] = score
		$scope.invalid = !$scope.isValid($scope.spirit)
	}

	$scope.isValid = function(data) {
		return (
			data.rules > 0 &&
			data.fouls > 0 &&
			data.fair > 0 &&
			data.positive > 0 &&
			data.communication > 0
		)
	}

	$scope.save = function(data) {
		// API.create({
		// 	what: 'match',
		// 	id: $scope.selected.match,
		// 	append: 'spirits',
		// 	data: data,
		// 	ok: function(response) {
		// 		flash('success', 'Uloženo.')
		// 	}
		// })
		if ($scope.isValid(data))
			flash('success', 'Uloženo.')
		else
			flash('danger', 'Označte všechny body hodnocení.')
	}

})

app.controller("Scores", function($scope, $rootScope, API, flash) {

	$scope.selected = {}
	$scope.tours = []
	$scope.matches = []
	$scope.show = {}

	// TODO prozatim
	// API.getTour({
	// 	ok: function(response) {
	// 		$scope.tours = $scope.tours.concat(response.data.items)
	// 	}
	// })
	API.getTour({
		append: '?terminated=true', 
		ok: function(response) {
			$scope.tours = $scope.tours.concat(response.data.items)
		}
	})
	API.getTour({
		append: '?active=true&terminated=false', 
		ok: function(response) {
			$scope.tours = $scope.tours.concat(response.data.items)
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

	$scope.tours = {
		terminated: [],
		active: []
	}
	$scope.user = Auth.getData()
	$scope.editUser = {}

	let basePath = 'partials/profile/'
	let params = $location.search()

	$scope.updateList = function() {
		API.get({
			what: 'tournament',
			append: '?terminated=true&userId=' + Auth.getData().id,
			ok: function(response) {
				$scope.tours.terminated = response.data.items
			}
		})
		API.get({
			what: 'tournament',
			append: '?terminated=false&userId=' + Auth.getData().id,
			ok: function(response) {
				$scope.tours.active = response.data.items
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

	$scope.terminateTour = function(id, name) {
		confirmYN(
			'Opravdu ukončit turnaj <strong>' + name + '</strong>?', 
			function(){
				API.edit({
					what: 'tournament',
					id: id,
					data: { terminated: true },
					ok: function(response) {
						flash('success', 'Turnaj ukončen.')
						$route.reload()
					}
				})
			}
		)
	}

	$scope.putUser = function(data) {
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
		API.edit({
			what: 'tournament',
			id: edit,
			data: data,
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
