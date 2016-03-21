'use strict';

//Setting up route
angular.module('journal1').config(['$stateProvider',
	function($stateProvider) {
		// Journal state routing
		$stateProvider.
			state('listJournal1', {
				url: '/journal1?q&category&limit&sortBy&sortDir',
				controller: 'Journal1ListController',
				templateUrl: 'modules/journal1/views/list-journal1.client.view.html'
			}).
			state('createJournal1', {
				url: '/journal1/create',
				controller: 'Journal1CreateController',
				templateUrl: 'modules/journal1/views/edit-journal1.client.view.html',
				data: {
					permissions: {
						only: ['admin', 'reviewer', 'editor'],
						redirectTo: 'signin'
					}
				}
			}).
			state('viewJournal1', {
				url: '/journal1/:journalId?articleNo',
				controller: 'Journal1ViewController',
				templateUrl: 'modules/journal1/views/view-journal1.client.view.html'
			}).
			state('addContentJournal1', {
				url: '/journal1/:journalId/add',
				controller: 'Journal1AddController',
				templateUrl: 'modules/journal1/views/add-journal1.client.view.html'
			}).
			state('editJournal1', {
				url: '/journal1/:journalId/edit',
				templateUrl: 'modules/journal1/views/edit-journal1.client.view.html',
				controller: 'Journal1EditController',
				resolve: {
					journal1: ['$stateParams', '$q', '$location', 'Journal1', function ($stateParams, $q, $location, Journal1) {
						var deffered = $q.defer(),
							query = $location.search();
						query.journalId = $stateParams.journalId;
						Journal1.get(query, function (v) {
							deffered.resolve(v);
						});
						return deffered.promise;
					}]
				}
			});
	}
]);
