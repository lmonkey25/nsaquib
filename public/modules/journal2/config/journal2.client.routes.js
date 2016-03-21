'use strict';

//Setting up route
angular.module('journal2').config(['$stateProvider',
	function($stateProvider) {
		// Journal state routing
		$stateProvider.
			state('listJournal2', {
				url: '/journal2?q&category&limit&sortBy&sortDir',
				controller: 'Journal2ListController',
				templateUrl: 'modules/journal2/views/list-journal2.client.view.html'
			}).
			state('createJournal2', {
				url: '/journal2/create',
				controller: 'Journal2CreateController',
				templateUrl: 'modules/journal2/views/edit-journal2.client.view.html',
				data: {
					permissions: {
						only: ['admin', 'reviewer', 'editor'],
						redirectTo: 'signin'
					}
				}
			}).
			state('viewJournal2', {
				url: '/journal2/:journal2Id?articleNo',
				controller: 'Journal2ViewController',
				templateUrl: 'modules/journal2/views/view-journal2.client.view.html'
			}).
			state('addContentJournal2', {
				url: '/journal2/:journal2Id/add',
				controller: 'Journal2AddController',
				templateUrl: 'modules/journal2/views/add-journal2.client.view.html'
			}).
			state('editJournal2', {
				url: '/journal2/:journal2Id/edit',
				templateUrl: 'modules/journal2/views/edit-journal2.client.view.html',
				controller: 'Journal2EditController',
				resolve: {
					journal2: ['$stateParams', '$q', '$location', 'Journal2', function ($stateParams, $q, $location, Journal2) {
						var deffered = $q.defer(),
							query = $location.search();
						query.journal2Id = $stateParams.journal2Id;
						Journal2.get(query, function (v) {
							deffered.resolve(v);
						});
						return deffered.promise;
					}]
				}
			});
	}
]);
