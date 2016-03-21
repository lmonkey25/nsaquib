/*
Client-Side controller for Journal1
*/

'use strict';

angular.module( 'journal1' )
	.controller( 'Journal1ListController', ['$scope', '$stateParams', 'Authentication', 'Journal1', 'Roles', 'PageTitle', 'MetaInformation', 'Authors', '_', 'GetterFromServer',
		function( $scope, $stateParams, Authentication, Journal1, Roles, PageTitle, MetaInformation, Authors, _, GetterFromServer ){
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;


			PageTitle.setTitle( 'Journal 1' );
			MetaInformation.setMetaDescription( 'Journal 1' );

			GetterFromServer.featured( 'journal1' ).then( function( data ){
				$scope.featured = data.data;
			});

			Authors.query().then( function( result ){
				$scope.authors = result.data;
				$scope.selectedAuthors = [];
				return result.data;
			});
			$scope.find = function () {
				$scope.originalJournal1 = $scope.journal1 = Journal1.query( $stateParams );
				$scope.canCreate = Roles.hasAtLeastRole( 'editor' );
				$scope.$emit('UNLOAD');
			};
			$scope.filter = function( author, e ){
				e.preventDefault();
				$scope.journal1 = _.filter( $scope.originalJournal1, function( item ){
					return true;//author._id === item.author;
				});
				resetActive();
				$scope.selectedAuthors.push( author );
				author.active = true;
				$scope.filtered = true;
			};
			$scope.resetFilter = function () {
				$scope.journal1 = $scope.originalJournal1;
				resetActive();
				$scope.filtered = false;
			};
			function resetActive() {
				$scope.selectedAuthors = [];
				_.forEach( $scope.authors, function( item ){
					item.active = false;
				});
			}
		}]
	 )
	.controller( 'Journal1ViewController', ['$scope', '$stateParams', '$timeout', '$location', '$anchorScroll', '$sce', 'Authentication', 'Roles', 'Journal1', '_', 'PageTitle', 'MetaInformation', 'DeleteArticle',
		function ($scope, $stateParams, $timeout, $location, $anchorScroll, $sce, Authentication, Roles, Journal1, _, PageTitle, MetaInformation, DeleteArticle) {
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;
			$scope.menuTitle = {
				articles: {
					title: {}
				}
			};

			$scope.update = function(){
				//checkLang();
				PageTitle.setTitle($scope.journal1.year + '-' + $scope.journal1.month);
				var options = {
					articleNo: $location.search().articleNo || 0
				};
				/*jshint ignore:start*/
				//if ($scope.book.author != null) $scope.book.author = $scope.book.author.value;
				/*jshint ignore:end*/
				$scope.canEdit = Roles.hasAtLeastRole( 'reviewer' ) || (
					Authentication.user && (
						$scope.journal1.user === Authentication.user._id
					)
				);
				$scope.editUrl = '/#!/journal1/' + $scope.journal1._id + '/edit?articleNo=' + options.articleNo;
				$scope.content = $scope.journal1.content;
				changeTitle();
				$scope.$emit('UNLOAD');
			};

			function checkLang(){
				if( $scope.journal1.journallanguage.length !== 2 ){
					$scope.lang = $scope.journal1.journallanguage[0] === 'English' ? 'en': 'ur';
				}else{
					$scope.lang = 'en';
				}
			}

			$scope.findOne = function () {
				$scope.journal1 = Journal1.get({
					journalId: $stateParams.journalId,
					articleNo: $location.search().articleNo
				});
				$scope.journal1.$promise.then( $scope.update );

			};

			$scope.updateProp = function( property, data ){
				var journal = $scope.journal1;
				if( property === 'en' || property === 'ur' ){
					journal.title[property] = data;
				}

				journal[property] = data;
				return journal.$update();
			};

			$scope.remove = function(){
				if( !$scope.journal1 ) return;

				$scope.journal1.$remove( function(){
					$location.path( 'journal1' );
				});
			};

			$scope.close = function(){
				$scope.journal1.status = 'closed';
				return $scope.journal1.$update();
			};

			$scope.open = function(){
				$scope.journal1.status = 'open';
				return $scope.journal1.$update();
			};

			$scope.switchArticle = function( ar ){
				$location.search( {'articleNo': ar} );
			};

			function changeTitle() {
				/*$scope.menuTitle.article.title = $location.search().articleNo ?
					$scope.journal1.tableOfContents[$location.search().articleNo].title:*/
					//$scope.journal1.content.title; //!!!!!
				PageTitle.setTitle( $scope.journal1.year + '-' + $scope.journal1.month/* + ' - ' + $scope.menuTitle.article.title[$scope.lang]*/ );
			}
			$scope.changeLang = function () {
				$scope.lang = $scope.lang === 'en'? 'ur': 'en';
				changeTitle();
			};
			$scope.deleteArticle = function( index ){
				var journal = $scope.journal1;
				var articleId = journal.tableOfContents[index]._id;
				DeleteArticle.query( journal._id, articleId, function( data ){
					$scope.journal1.tableOfContents = data.articles;
					$scope.switchArticle( 0 );
					$scope.content = $scope.journal1.content;
					changeTitle();
					$scope.$emit('UNLOAD');
				} );
			};
			angular.element(window).on( 'scroll', function(){
				$scope.$apply( $scope.isAffixNow = angular.element( document ).scrollTop() !== 0 );
			});
		}])

	.controller('Journal1CreateController', [
		'$scope',
		'$location',
		'Authentication',
		'Journal1FormSchema',
		'Journal1',
		'Authors',
		'articlesSanitizer',
		'PageTitle',
		'MetaInformation',
		'_',
		function ($scope, $location, Authentication, Journal1FormSchema, Journal1, Authors, articlesSanitizer, PageTitle, MetaInformation, _) {
			$scope.authentication = Authentication;
			$scope.journal1FormSchema = Journal1FormSchema;
			$scope.journal1 = {};
			$scope.isCreating = true;
			PageTitle.setTitle( 'Create Journal 1' );
			MetaInformation.setMetaDescription( 'Create journal1' );
			Authors.query().then(function (result) {
				$scope.authors = result.data;
				return result.data;
			});
			$scope.create = function () {
				var journal = $scope.journal1;
				journal.journallanguage = _.keys( _.pick( journal.language, function( key ,val ){
					return val;
				}));
				journal = new Journal1( journal );

				journal.$save( function( response ){
					$location.path( 'journal1/' + response._id + '/add' );
				},function( errorResponse ){
					$scope.error = errorResponse.data.message;
				});
			};
		}])

	.controller('Journal1EditController', [
		'$scope',
		'$location',
		'Authentication',
		'Journal1FormSchema',
		'articlesSanitizer',
		'journal1',
		'Authors',
		'PageTitle',
		'MetaInformation',
		'_',
		function ($scope, $location, Authentication, Journal1FormSchema, articlesSanitizer, journal1, Authors, PageTitle, MetaInformation, _) {
			$scope.authentication = Authentication;
			$scope.journal1 = journal1;
			$scope.journal1.language = {};
			$scope.isCreating = false;
			$scope.categories = [];
			$scope.keywords = [];
			_.each( journal1.journallanguage, function( lang ){
				$scope.journal1.language[lang] = true;
			});
			$scope.journal1FormSchema = Journal1FormSchema;
			var i = 0;
			var q = $location.search();
			$scope.backUrl = 'journal1/' + journal1._id + '?articleNo=' + q.articleNo;
			PageTitle.setTitle( 'Edit Journal 1' );
			MetaInformation.setMetaDescription( 'Edit Journal 1' );
			Authors.query().then(function( result ){
				$scope.authors = result.data;
				return result.data;
			});
			if( 'content' in $scope.journal1 ){
				//make categories and keywords arrays
				for( i in $scope.journal1.content.categories ){
					$scope.categories.push( {name: $scope.journal1.content.categories[i]} );
				}
				for( i in $scope.journal1.content.keywords ){
					$scope.keywords.push( {name: $scope.journal1.content.keywords[i]} );
				}
			}

			// Update existing Journal
			$scope.update = function( form ){
				var journal = $scope.journal1;
				journal.content.author = journal.content.author._id;
				journal.journallanguage = _.keys( _.pick( journal.language, function( key ,val ){
					return val;
				}));
				//convert categories and keywords
				journal.content.categories = [];
				journal.content.keywords = [];
				for( i in $scope.categories ){
					journal.content.categories.push( $scope.categories[i].name );
				}
				for( i in $scope.keywords ){
					journal.content.keywords.push( $scope.keywords[i].name );
				}
				//-------------------------------
				journal.$update( $location.search(), function(){
					$location.path( 'journal1/' + journal._id );
				},function( errorResponse ){
					$scope.error = errorResponse.data.message;
				});
			};

			//add new category line
			$scope.addContentArray = function( what ){
				if( what === 'categories' ){
					$scope.categories.push( {name: ''} );
				}else{
					$scope.keywords.push( {name: ''} );
				}
			};

			//delete content lines
			$scope.deleteContentArray = function( what, $index ){
				if( what === 'categories' ){
					$scope.categories.splice( $index, 1 );
				}else{
					$scope.keywords.splice( $index, 1 );
				}
			};

		}])
	.controller('Journal1AddController', [
		'$scope',
		'$location',
		'$timeout',
		'$stateParams',
		'Journal1',
		'Authors',
		'Authentication',
		'PageTitle',
		'MetaInformation',
		function( $scope, $location, $timeout, $stateParams, Journal1, Authors, Authentication, PageTitle, MetaInformation ){
			$scope.authentication = Authentication;
			PageTitle.setTitle( 'Add content' );
			MetaInformation.setMetaDescription( 'Add content' );

			$scope.categories = [];
			$scope.keywords = [];

			$scope.categories.push( {name: ''} );
			$scope.keywords.push( {name: ''} );

			Authors.query().then(function( result ){
				$scope.authors = result.data;
				return result.data;
			});

			$scope.getJournal = function(){
				$scope.journal = Journal1.get( {
					journalId: $stateParams.journalId,
					info: true
				});
			};
			$scope.closeAlert = function(){
				$scope.info = null;
			};
			$scope.save = function(){
				var i = 0;
				$scope.journal.add.author = $scope.journal.add.author._id;
				//$
				//convert categories and keywords
				$scope.journal.add.categories = [];
				$scope.journal.add.keywords = [];
				for( i in $scope.categories ){
					$scope.journal.add.categories.push( $scope.categories[i].name );
				}
				for( i in $scope.keywords ){
					$scope.journal.add.keywords.push( $scope.keywords[i].name );
				}
				//-------------------------------
				$scope.journal.$save( function( response ){
					$scope.categories = [];
					$scope.keywords = [];

					$scope.categories.push( {name: ''} );
					$scope.keywords.push( {name: ''} );
					
					$scope.info = {
						status: 'success',
						message: 'Content has been added'
					};
					$scope.getJournal();
					$timeout( $scope.closeAlert, 3000 );
				},function( errorResponse ){
					$scope.info = {
						status: 'danger',
						message: 'Something went wrong'
					};
					$timeout( $scope.closeAlert, 3000 );
				});
			};

			//add new category line
			$scope.addContentArray = function( what ){
				console.log( $scope.categories );
				if( what === 'categories' ){
					$scope.categories.push( {name: ''} );
					//$scope.journal1.content.categories.push( '' );
				}else{
					$scope.keywords.push( {name: ''} );
				}
			};

			//delete content lines
			$scope.deleteContentArray = function( what, $index ){
				if( what === 'categories' ){
					$scope.categories.splice( $index, 1 );
				}else{
					$scope.keywords.splice( $index, 1 );
				}
			};

		}
	])
;
