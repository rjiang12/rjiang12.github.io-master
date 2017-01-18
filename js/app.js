var app = angular.module('Roy-Jiang', ['ui.router', 'ngAnimate']);

app.config(function ($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('app', {
			url: '/app',
			templateUrl: "views/app.html",
			controller: 'AppCtrl'
		})
		.state('app.home', {
			url: '/home',
			templateUrl: "views/home.html",
			controller: 'HomeCtrl'
		})
		.state('app.viewer', {
			url: '/viewer/:foldername/:filename',
			templateUrl: "views/viewer.html",
			controller: 'ViewerCtrl',
		})
		.state('app.email', {
			url: '/email',
			templateUrl: 'views/email.html',
			controller: 'EmailCtrl'
		});
	$urlRouterProvider.otherwise('/app/home');


});

app.run(function ($rootScope) {
	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
		window.componentHandler.upgradeAllRegistered();
	});
});

app.controller('AppCtrl', function ($scope, $http, $state, $location) {
	window.componentHandler.upgradeAllRegistered();
	$scope.content_title = "Blog";

	var folderName = null;

	$http.get("content.json").then(function (response) {
		$scope.links = response.data;
		$scope.contents = response.data;
	});

	$scope.bgsrc = "https://source.unsplash.com/random";
	
	$scope.linkClick = function (name) {
		if (name !== "back") {
			// go down
			var result = $.grep($scope.contents, function (e) { return e.name === name; });
			if (result.length > 0) { // show blogs
				var r = result[0];
				$scope.links = r.blogs;
				$scope.content_title = result[0].name;
				folderName = result[0].folder;
			} else { // show one lecture
				result = $.grep($scope.links, function (e) { return e.name === name; });
				$location.path("app/viewer/" + folderName + "/" + result[0].file);
				var layout = document.querySelector('.mdl-layout');
				layout.MaterialLayout.toggleDrawer();
			}

		} else {
			// go up
			$scope.links = $scope.contents;
			$scope.content_title = "Blog";
		}
	};

	$state.go('app.home', {})
});

app.controller('HomeCtrl', function ($scope, $interval) {
	$scope.time = moment().format('MMMM Do YYYY, h:mm:ss a');
	$interval(function() {
		$scope.time = moment().format('MMMM Do YYYY, h:mm:ss a');
	}, 1000);
});

app.controller('ViewerCtrl', function ($scope, $stateParams, $http) {
	componentHandler.upgradeAllRegistered();
	if (("" + $stateParams.filename).endsWith('.pdf')) {
		window.open("blogs/" + $stateParams.foldername + "/" + $stateParams.filename);
		$("#viewer-card").html("Blogs are shown in a seperate window");
	} else {
		$http.get("blogs/" + $stateParams.foldername + "/" + $stateParams.filename).then(function (response) {
			var body = {
				"text": response.data,
				"mode": "markdown"
			}
			$http.post("https://api.github.com/markdown", JSON.stringify(body)).then(function(result) {
				$("#viewer-card").html(result.data);
				MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
			});

		});
	}


});

app.controller('EmailCtrl', function($scope) {

});