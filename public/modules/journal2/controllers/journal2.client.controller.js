/*
Client-Side controller for Journal2
*/

'use strict';

angular.module( 'journal2' )
	.controller( 'Journal2ListController', ['$scope', '$stateParams', 'Authentication', 'Journal2', 'Roles', 'PageTitle', 'MetaInformation', 'Authors', '_', 'GetterFromServer',
		function( $scope, $stateParams, Authentication, Journal2, Roles, PageTitle, MetaInformation, Authors, _, GetterFromServer ){
			$scope.$emit('LOAD');
			$scope.authentication = Authentication;
			$scope.Roles = Roles;


			PageTitle.setTitle( 'Journal 1' );
			MetaInformation.setMetaDescription( 'Journal 1' );

			GetterFromServer.featured( 'journal2' ).then( function( data ){
				$scope.featured = data.data;
			});

			Authors.query().then( function( result ){
				$scope.authors = result.data;
				$scope.selectedAuthors = [];
				return result.data;
			});
			$scope.find = function () {
				$scope.originalJournal2 = $scope.journal2 = Journal2.query( $stateParams );
				$scope.canCreate = Roles.hasAtLeastRole( 'editor' );
				$scope.$emit('UNLOAD');
			};
			$scope.filter = function( author, e ){
				e.preventDefault();
				$scope.journal2 = _.filter( $scope.originalJournal2, function( item ){
					return true;//author._id === item.author;
				});
				resetActive();
				$scope.selectedAuthors.push( author );
				author.active = true;
				$scope.filtered = true;
			};
			$scope.resetFilter = function () {
				$scope.journal2 = $scope.originalJournal2;
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
	.controller( 'Journal2ViewController', ['$scope', '$stateParams', '$timeout', '$location', '$anchorScroll', '$sce', 'Authentication', 'Roles', 'Journal2', '_', 'PageTitle', 'MetaInformation', 'DeleteArticle2',
		function ($scope, $stateParams, $timeout, $location, $anchorScroll, $sce, Authentication, Roles, Journal2, _, PageTitle, MetaInformation, DeleteArticle2) {
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
				PageTitle.setTitle($scope.journal2.year + '-' + $scope.journal2.month);
				var options = {
					articleNo: $location.search().articleNo || 0
				};
				/*jshint ignore:start*/
				//if ($scope.book.author != null) $scope.book.author = $scope.book.author.value;
				/*jshint ignore:end*/
				$scope.canEdit = Roles.hasAtLeastRole( 'reviewer' ) || (
					Authentication.user && (
						$scope.journal2.user === Authentication.user._id
					)
				);
				$scope.editUrl = '/#!/journal2/' + $scope.journal2._id + '/edit?articleNo=' + options.articleNo;
				$scope.content = $scope.journal2.content;
				changeTitle();
				$scope.$emit('UNLOAD');
			};

			function checkLang(){
				if( $scope.journal2.journallanguage.length !== 2 ){
					$scope.lang = $scope.journal2.journallanguage[0] === 'English' ? 'en': 'ur';
				}else{
					$scope.lang = 'en';
				}
			}

			$scope.findOne = function () {
				$scope.journal2 = Journal2.get({
					journal2Id: $stateParams.journal2Id,
					articleNo: $location.search().articleNo
				});
				$scope.journal2.$promise.then( $scope.update );
				console.log( $scope.journal2 );

			};

			$scope.updateProp = function( property, data ){
				var journal = $scope.journal2;
				if( property === 'en' || property === 'ur' ){
					journal.title[property] = data;
				}

				journal[property] = data;
				return journal.$update();
			};

			$scope.remove = function(){
				if( !$scope.journal2 ) return;

				$scope.journal2.$remove( function(){
					$location.path( 'journal2' );
				});
			};

			$scope.close = function(){
				$scope.journal2.status = 'closed';
				return $scope.journal2.$update();
			};

			$scope.open = function(){
				$scope.journal2.status = 'open';
				return $scope.journal2.$update();
			};

			$scope.switchArticle = function( ar ){
				$location.search( {'articleNo': ar} );
			};

			function changeTitle() {
				/*$scope.menuTitle.article.title = $location.search().articleNo ?
					$scope.journal2.tableOfContents[$location.search().articleNo].title:*/
					//$scope.journal2.content.title; //!!!!!
				PageTitle.setTitle( $scope.journal2.year + '-' + $scope.journal2.month/* + ' - ' + $scope.menuTitle.article.title[$scope.lang]*/ );
			}
			$scope.changeLang = function () {
				$scope.lang = $scope.lang === 'en'? 'ur': 'en';
				changeTitle();
			};
			$scope.deleteArticle = function( index ){
				var journal = $scope.journal2;
				var articleId = journal.tableOfContents[index]._id;
				DeleteArticle2.query( journal._id, articleId, function( data ){
					$scope.journal2.tableOfContents = data.articles;
					$scope.switchArticle( 0 );
					$scope.content = $scope.journal2.content;
					changeTitle();
					$scope.$emit('UNLOAD');
				} );
			};
			angular.element(window).on( 'scroll', function(){
				$scope.$apply( $scope.isAffixNow = angular.element( document ).scrollTop() !== 0 );
			});
		}])

	.controller('Journal2CreateController', [
		'$scope',
		'$location',
		'Authentication',
		'Journal2FormSchema',
		'Journal2',
		'Authors',
		'articlesSanitizer',
		'PageTitle',
		'MetaInformation',
		'_',
		function ($scope, $location, Authentication, Journal2FormSchema, Journal2, Authors, articlesSanitizer, PageTitle, MetaInformation, _) {
			$scope.authentication = Authentication;
			$scope.journal2FormSchema = Journal2FormSchema;
			$scope.journal2 = {};
			$scope.isCreating = true;
			PageTitle.setTitle( 'Create Journal 1' );
			MetaInformation.setMetaDescription( 'Create journal2' );
			Authors.query().then(function (result) {
				$scope.authors = result.data;
				return result.data;
			});
			$scope.create = function () {
				var journal = $scope.journal2;
				journal.journallanguage = _.keys( _.pick( journal.language, function( key ,val ){
					return val;
				}));
				journal = new Journal2( journal );

				journal.$save( function( response ){
					$location.path( 'journal2/' + response._id + '/add' );
				},function( errorResponse ){
					$scope.error = errorResponse.data.message;
				});
			};
		}])

	.controller('Journal2EditController', [
		'$scope',
		'$location',
		'Authentication',
		'Journal2FormSchema',
		'articlesSanitizer',
		'journal2',
		'Authors',
		'PageTitle',
		'MetaInformation',
		'_',
		function ($scope, $location, Authentication, Journal2FormSchema, articlesSanitizer, journal2, Authors, PageTitle, MetaInformation, _) {
			$scope.authentication = Authentication;
			$scope.journal2 = journal2;
			$scope.journal2.language = {};
			$scope.isCreating = false;
			$scope.categories = [];
			$scope.keywords = [];
			_.each( journal2.journallanguage, function( lang ){
				$scope.journal2.language[lang] = true;
			});
			$scope.journal2FormSchema = Journal2FormSchema;
			var i = 0;
			var q = $location.search();
			$scope.backUrl = 'journal2/' + journal2._id + '?articleNo=' + q.articleNo;
			PageTitle.setTitle( 'Edit Journal 1' );
			MetaInformation.setMetaDescription( 'Edit Journal 1' );
			Authors.query().then(function( result ){
				$scope.authors = result.data;
				return result.data;
			});
			if( 'content' in $scope.journal2 ){
				//make categories and keywords arrays
				for( i in $scope.journal2.content.categories ){
					$scope.categories.push( {name: $scope.journal2.content.categories[i]} );
				}
				for( i in $scope.journal2.content.keywords ){
					$scope.keywords.push( {name: $scope.journal2.content.keywords[i]} );
				}
			}

			// Update existing Journal
			$scope.update = function( form ){
				var journal = $scope.journal2;
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
					$location.path( 'journal2/' + journal._id );
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
	.controller('Journal2AddController', [
		'$scope',
		'$location',
		'$timeout',
		'$stateParams',
		'Journal2',
		'Authors',
		'Authentication',
		'PageTitle',
		'MetaInformation',
		function( $scope, $location, $timeout, $stateParams, Journal2, Authors, Authentication, PageTitle, MetaInformation ){
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
				$scope.journal = Journal2.get( {
					journal2Id: $stateParams.journal2Id,
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
					//$scope.journal2.content.categories.push( '' );
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
