/**
** Контроллер клиентской
** части для компонента тултипов
** !!!cmSelect - unique ID of element, where we take selected text!!!
***/

'use strict';

angular.module( 'cmtooltip' ).controller( 'CMTooltip1Controller', ['$scope', '$stateParams', 'Authentication', 'Roles', '_', '$http', '$location', 'MetaInformation', 'PageTitle', '$timeout', '$modal',
	function( $scope, $stateParams, Authentication, Roles, _, $http, $location, MetaInformation, PageTitle, $timeout, $modal ){
		$scope.chHighlight = false; //show highlight form
		$scope.chComment = false; //show comment form
		$scope.chShowButtons = true;
		$scope.authentication = Authentication;
		if( !$scope.authentication.user || typeof( $scope.authentication.user._id ) === 'undefined' ){
			$scope.chShowButtons = false;
		}

		//init showing options
		$scope.initShow = function(){
			$scope.chHighlight = false; //show highlight form
			$scope.chComment = false; //show comment form
		};

		//show highlight form
		$scope.showHighlight = function(){
			var selText = null;
			$scope.chComment = false; //show comment form
			$scope.isPrivateH = true;
			$scope.chHighlight = ($scope.chHighlight)?false:true;
		};

		//show comment form
		$scope.showComment = function(){
			var selText = null;
			$scope.chHighlight = false;
			$scope.isPrivateC = true;
			$scope.commentC = '';
			$scope.chComment = ($scope.chComment)?false:true;
		};

		//save highlight
		$scope.createHighlight = function(){
			var cmData = [];
			var rSave = {
				user: null,
				cmData: null
			};
			var range = null;
			var url = '';
			var pos = -1;
			var title = '';

			if( !$scope.authentication.user || typeof( $scope.authentication.user._id ) === 'undefined' ){
				$location.path( 'signin' );
				return false;
			}

			url = $location.url();
			pos = url.indexOf( '#' );
			if( pos !== -1 ){
				url = url.substring( 0, pos );
			}
			if( $scope.selText ){
				if( $scope.selText.length > 0 ){
					range = $scope.selText.range;
					title = ( $scope.selText.rawText.length <= 45 )?$scope.selText.rawText:$scope.selText.rawText.substring( 0, 44 ) + '...';
					rSave.user = $scope.authentication.user._id;
					rSave.cmData = {
						dataType: 1,
						isPrivate: $scope.isPrivateH,
						comment: '',
						itemId: $scope.cmSelect,
						posStart: range.startOffset,
						posEnd: range.endOffset,
						location: url,
						title: title
					};
					if( range.startOffset === -1 ){
						return false;
					}
					$timeout( function(){
						$http.post( 'api/cmtooltip',
							{
								params: {
									cmtooltip: rSave
								}
							}
						).success( function( data ){
							$scope.submitted = true;
							window.location.reload();
							return data;
						} ).error( function( err ){
							$scope.submitted = false;
							return err;
						} );
					} );
				}
			}
		};


		//save comment
		$scope.createComment = function(){
			var cmData = [];
			var rSave = {
				user: null,
				cmData: null
			};
			var range = null;
			var url = '';
			var pos = -1;
			var title = '';
			if( !$scope.authentication.user ){
				$location.path( 'signin' );
				return false;
			}
			if( $scope.selText ){
				if( $scope.selText.length > 0 ){
					url = $location.url();
					pos = url.indexOf( '#' );
					if( pos !== -1 ){
						url = url.substring( 0, pos );
					}
					range = $scope.selText.range;
					title = ( $scope.selText.rawText.length <= 45 )?$scope.selText.rawText:$scope.selText.rawText.substring( 0, 44 ) + '...';
					rSave.user = $scope.authentication.user._id;
					rSave.cmData = {
						dataType: 2,
						isPrivate: $scope.isPrivateC,
						comment: $scope.commentC,
						itemId: $scope.cmSelect,
						posStart: range.startOffset,
						posEnd: range.endOffset,
						location: url,
						title: title
					};
					if( range.startOffset === -1 ){
						return false;
					}
					$timeout( function(){
						$http.post( 'api/cmtooltip',
							{
								params: {
									cmtooltip: rSave
								}
							}
						).success( function( data ){
							$scope.submitted = true;
							window.location.reload();
							return data;
						} ).error( function( err ){
							$scope.submitted = false;
							return err;
						} );
					} );
				}
			}
		};

		//save bookmark
		$scope.createBookmark = function(){
			var cmData = [];
			var rSave = {
				user: null,
				cmData: null
			};
			var range = null;
			var url = '';
			var pos = -1;
			var title = '';
			if( !$scope.authentication.user ){
				$location.path( 'signin' );
				return false;
			}
			if( $scope.selText ){
				if( $scope.selText.length > 0 ){
					url = $location.url();
					pos = url.indexOf( '#' );
					if( pos !== -1 ){
						url = url.substring( 0, pos );
					}
					range = $scope.selText.range;
					title = ( $scope.selText.rawText.length <= 45 )?$scope.selText.rawText:$scope.selText.rawText.substring( 0, 44 ) + '...';
					rSave.user = $scope.authentication.user._id;
					rSave.cmData = {
						dataType: 3,
						isPrivate: true,
						comment: '',
						itemId: $scope.cmSelect,
						posStart: range.startOffset,
						posEnd: range.endOffset,
						location: url,
						title: title
					};
					if( range.startOffset === -1 ){
						return false;
					}
					$timeout( function(){
						$http.post( 'api/cmtooltip',
							{
								params: {
									cmtooltip: rSave
								}
							}
						).success( function( data ){
							window.location.reload();
							return data;
						} ).error( function( err ){
							return err;
						} );
					} );
				}
			}
		};


		//save to Facebook
		$scope.createFacebook = function(){
			var cmData = [];
			var rSave = {
				user: null,
				cmData: null
			};
			var range = null;
			var url = '';
			var pos = -1;
			var title = '';
			if( !$scope.authentication.user ){
				$location.path( 'signin' );
				return false;
			}
			if( $scope.selText && $scope.selText.length > 0 ){
				url = $location.url();
				pos = url.indexOf( '#' );
				if( pos !== -1 ){
					url = url.substring( 0, pos );
				}
				range = $scope.selText.range;
				title = ( $scope.selText.rawText.length <= 45 )?$scope.selText.rawText:$scope.selText.rawText.substring( 0, 44 ) + '...';
				rSave.user = $scope.authentication.user._id;
				rSave.cmData = {
					dataType: 4,
					isPrivate: false,
					comment: '',
					itemId: $scope.cmSelect,
					posStart: range.startOffset,
					posEnd: range.endOffset,
					location: url,
					title: title
				};
				if( range.startOffset === -1 ){
					return false;
				}
				MetaInformation.setMetaDescription( $scope.selText.rawText );
				var container = null;
				container = document.createElement( 'div' );
				container.id = 'fb-12345';
				container.innerHtml = '<label title="TitleOf">Content Of</label>';
				//window.open( 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent( $location.absUrl() + '/#fb-12345' ), 'socialtexts', 'width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no,url=no' );
				//window.open( 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent( 'http://www.wordpress.proffibit.com/#!/journal1/5652cedefc2668527f062f05' ), 'socialtexts', 'width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no,url=no' );
				$timeout( function(){
					$http.post( 'api/cmtooltip',
						{
							params: {
								cmtooltip: rSave
							}
						}
					).success( function( data ){
						window.open( 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent( $location.absUrl() ), 'socialtexts', 'width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no,url=no' );
						return data;
					} ).error( function( err ){
						return err;
					} );
				} );

			}
		};


		//save to Twitter
		$scope.createTwitter = function(){
			var cmData = [];
			var rSave = {
				user: null,
				cmData: null
			};
			var range = null;
			var url = '';
			var pos = -1;
			var title = '';
			if( !$scope.authentication.user ){
				$location.path( 'signin' );
				return false;
			}
			if( $scope.selText && $scope.selText.length > 0 ){
				url = $location.url();
				pos = url.indexOf( '#' );
				if( pos !== -1 ){
					url = url.substring( 0, pos );
				}
				range = $scope.selText.range;
				title = ( $scope.selText.rawText.length <= 45 )?$scope.selText.rawText:$scope.selText.rawText.substring( 0, 44 ) + '...';
				rSave.user = $scope.authentication.user._id;
				rSave.cmData = {
					dataType: 5,
					isPrivate: false,
					comment: '',
					itemId: $scope.cmSelect,
					posStart: range.startOffset,
					posEnd: range.endOffset,
					location: url,
					title: title
				};
				if( range.startOffset === -1 ){
					return false;
				}
				$timeout( function(){
					$http.post( 'api/cmtooltip',
						{
							params: {
								cmtooltip: rSave
							}
						}
					).success( function( data ){
						var text = $scope.selText.rawText;
						var pos = -1;
						if( text.length > 80 ){ //cut to 80 characters
							text = $scope.selText.rawText.substring( 0, 79 );
						}
						pos = data.cmData.length;
						text += encodeURIComponent($location.absUrl()+'/#sp_'+data.cmData[pos - 1]._id);
						window.open('http://twitter.com/share?text='+text+'&url='+encodeURIComponent($location.absUrl()),'socialtext', 'width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no,url=no');
						return data;
					} ).error( function( err ){
						return err;
					} );
				} );
			}
		};

		//Sign in modal window
		$scope.openModal = function (size, event) {
			//поиск и удаление тултипа
			var popover = $( '.popover' );
			if( popover ){
				popover.popover( 'destroy' );
			}
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/modules/users/views/authentication/signin.client.view.html',
				controller: 'SinginController',
				size: size
			});

		};

	}] )
	.controller( 'CMTooltip2Controller', ['$scope', '$stateParams', 'Authentication', 'Roles', '_', '$http', 'CmParse', '$timeout',
		function( $scope, $stateParams, Authentication, Roles, _, $http, CmParse, $timeout ){
		$scope.chHighlight = false; //show highlight form
		$scope.chComment = false; //show comment form
		$scope.chBookmark = false;
		$scope.authentication = Authentication;
		$scope.isPrivateH = true;
		$scope.isPrivateC = true;
		$scope.commentC = '';

		//init showing options
		$scope.initShow = function(){
			if( $scope.editcontprop && $scope.editcontprop !== null && $scope.editcontprop.length > 0 ){
				$http.get( '/api/cmtooltip?toolId=' + $scope.editcontprop, {
					query: {
						user: $scope.authentication.user
					}
				} ).success( function( data ){
					if( !data ) return false;
					switch( data.cmData[0].dataType ){
						case 1:
							$scope.chHighlight = true;
							$scope.chComment = false;
							$scope.chBookmark = false;
							$scope.isPrivateH = data.cmData[0].isPrivate;
							$scope.editcontprop = data.cmData[0]._id;
							break;
						case 2:
							$scope.chHighlight = false;
							$scope.chComment = true;
							$scope.chBookmark = false;
							$scope.isPrivateC = data.cmData[0].isPrivate;
							$scope.commentC = data.cmData[0].comment;
							$scope.editcontprop = data.cmData[0]._id;
							break;
					}
				} );
			}else{
				$scope.chHighlight = false; //show highlight form
				$scope.chComment = false; //show comment form
				$( '#hide-share-div' ).remove(); //remove hide button
			}
		};

		//show highlight form
		$scope.showHighlight = function(){
			//при повторном нажатии удалить выделение
			if( $scope.chHighlight && $scope.editcontprop && $scope.editcontprop !== null && $scope.editcontprop.length > 0 ){
				$scope.chHighlight = false;
				$http.delete( '/api/cmtooltip', {
					params: {
						toolId: $scope.editcontprop
					}
				} ).success( function( data ){
					if( data ){
						CmParse.render( $scope, $scope.elemData.elem, $scope.elemData.attrs.setcontprop, $scope.elemData.textContent );
					}
				} ).error( function( err ){
					console.log( err );
				} );
			}
		};

		//show comment form
		$scope.showComment = function(){
			//при повторном нажатии удалить выделение
			if( $scope.chComment && $scope.editcontprop && $scope.editcontprop !== null && $scope.editcontprop.length > 0 ){
				$scope.chComment = false;
				$http.delete( '/api/cmtooltip', {
					params: {
						toolId: $scope.editcontprop
					}
				} ).success( function( data ){
					if( data ){
						CmParse.render( $scope, $scope.elemData.elem, $scope.elemData.attrs.setcontprop, $scope.elemData.textContent );
					}
				} ).error( function( err ){
					console.log( err );
				} );
			}
		};

		//save highlight
		$scope.updateHighlight = function(){
			var rSave = {};
			//console.log( $scope.elemData.textContent );
			if( $scope.editcontprop && $scope.editcontprop !== null && $scope.editcontprop.length > 0 ){
				rSave = {
					isPrivate: $scope.isPrivateH,
					comment: ''
				};
				$timeout( function(){
					$http.put( '/api/cmtooltip',{
						params: {
							toolId: $scope.editcontprop,
							cmData: rSave
						}
					} ).success( function( data ){
						CmParse.render( $scope, $scope.elemData.elem, $scope.elemData.attrs.setcontprop, $scope.elemData.textContent );
						$scope.submitted = true;
						return data;
					} ).error( function( err ){
						return err;
					} );
				} );
			}
		};


		//save comment
		$scope.updateComment = function(){
			var rSave = {};
			if( $scope.editcontprop && $scope.editcontprop !== null && $scope.editcontprop.length > 0 ){
				rSave = {
					isPrivate: $scope.isPrivateC,
					comment: $scope.commentC
				};
				$timeout( function(){
					$http.put( '/api/cmtooltip',{
						params: {
							toolId: $scope.editcontprop,
							cmData: rSave
						}
					} ).success( function( data ){
						$scope.submitted = true;
						CmParse.render( $scope, $scope.elemData.elem, $scope.elemData.attrs.setcontprop, $scope.elemData.textContent );
						return data;
					} ).error( function( err ){
						return err;
					} );
				} );
			}
		};


		}
	] )
	.controller( 'CMTooltipUserController', ['$scope', '$stateParams', 'Authentication', 'Roles', '_', '$http', '$filter',
		function( $scope, $stateParams, Authentication, Roles, _, $http, $filter ){
			$scope.authentication = Authentication;
			$scope.cmData = { aHighlight: [], aComment: [], aBookmark: [], aFb: [], aTwitter: [],
								isHighlight: false, isComment: false, isBookmark: false, isFb: false, isTwitter: false
							};

			//get list of all user links
			$scope.getAllLinks = function(){
				$http.get( '/api/cmtooltip?userId=' + $scope.authentication.user._id )
				.success( function( data ){
					var i = 0;
					var pr = 'Private';
					var title = '';
					var date = null;
					var count = {
						h: 0,
						c: 0,
						b: 0,
						f: 0,
						t: 0
					};
					for( i = 0; i < data.cmData.length; i++ ){
						pr = (data.cmData[i].isPrivate)?'Private':'Share';
						switch( data.cmData[i].dataType ){
							case 1:
								count.h++;
								title = ( 'title' in data.cmData[i] )?data.cmData[i].title:'Highlight №' + count.h;
								if( 'modifyDate' in data.cmData[i] ){
									date = new Date( data.cmData[i].modifyDate );
									title = count.h  + '.' + $filter( 'date' )( date, 'yyyy-MM-dd' ) + ' ' + title;
								}
								$scope.cmData.aHighlight.push( {
									title: title,
									tooltip: pr,
									link: '/#!' + data.cmData[i].location + '#sp_' + data.cmData[i]._id,
									id: data.cmData[i]._id
								} );
								break;
							case 2:
								count.c++;
								title = ( 'title' in data.cmData[i] )?data.cmData[i].title:'Comment №' + count.c;
								if( 'modifyDate' in data.cmData[i] ){
									date = new Date( data.cmData[i].modifyDate );
									title = count.c  + '.' + $filter( 'date' )( date, 'yyyy-MM-dd' ) + ' ' + title;
								}
								$scope.cmData.aComment.push( {
									title: title,
									tooltip: '(' + pr + ') ' + data.cmData[i].comment,
									link: '/#!' + data.cmData[i].location + '#sp_' + data.cmData[i]._id,
									id: data.cmData[i]._id
								} );
								break;
							case 3:
								count.b++;
								title = ( 'title' in data.cmData[i] )?data.cmData[i].title:'Bookmark №' + count.b;
								if( 'modifyDate' in data.cmData[i] ){
									date = new Date( data.cmData[i].modifyDate );
									title = count.b  + '.' + $filter( 'date' )( date, 'yyyy-MM-dd' ) + ' ' + title;
								}
								$scope.cmData.aBookmark.push( {
									title: title,
									link: '/#!' + data.cmData[i].location + '#sp_' + data.cmData[i]._id,
									id: data.cmData[i]._id
								} );
								break;
							case 4:
								count.f++;
								title = ( 'title' in data.cmData[i] )?data.cmData[i].title:'Facebook №' + count.f;
								if( 'modifyDate' in data.cmData[i] ){
									date = new Date( data.cmData[i].modifyDate );
									title = count.f  + '.' + $filter( 'date' )( date, 'yyyy-MM-dd' ) + ' ' + title;
								}
								$scope.cmData.aFb.push( {
									title: title,
									link: '/#!' + data.cmData[i].location + '#sp_' + data.cmData[i]._id,
									id: data.cmData[i]._id
								} );
								break;
							case 5:
								count.t++;
								title = ( 'title' in data.cmData[i] )?data.cmData[i].title:'Twitter №' + count.t;
								if( 'modifyDate' in data.cmData[i] ){
									date = new Date( data.cmData[i].modifyDate );
									title = count.t  + '.' + $filter( 'date' )( date, 'yyyy-MM-dd' ) + ' ' + title;
								}
								$scope.cmData.aTwitter.push( {
									title: title,
									link: '/#!' + data.cmData[i].location + '#sp_' + data.cmData[i]._id,
									id: data.cmData[i]._id
								} );
								break;
						}
					}
					$scope.cmData.isHighlight = (count.h > 0)?true:false;
					$scope.cmData.isComment = (count.c > 0)?true:false;
					$scope.cmData.isBookmark = (count.b > 0)?true:false;
					$scope.cmData.isFb = (count.f > 0)?true:false;
					$scope.cmData.isTwitter = (count.t > 0)?true:false;
				} )
				.error( function( err ){
					console.log( err );
				} );
			};

			//delete link
			$scope.deleteLink = function( toolId, dataType ){
				if( !toolId ) return false;
				$http.delete( '/api/cmtooltip', {
					params: {
						toolId: toolId
					}
				} ).success( function( data ){
					var i = 0;
					var index = -1;
					var tmp = [];
					if( data ){
						switch( dataType ){
							case 1:
								tmp = $scope.cmData.aHighlight;
								break;
							case 2:
								tmp = $scope.cmData.aComment;
								break;
							case 3:
								tmp = $scope.cmData.aBookmark;
								break;
							case 4:
								tmp = $scope.cmData.aFb;
								break;
							case 5:
								tmp = $scope.cmData.aTwitter;
								break;
						}
						for( i = 0; i < tmp.length; i++ ){
							if( _.isEqual( toolId, tmp[i].id ) ){
								index = i;
								break;
							}
						}
						if( index !== -1 ){
							tmp.splice( index, 1 );
							switch( dataType ){
								case 1:
									$scope.cmData.aHighlight = tmp;
									break;
								case 2:
									$scope.cmData.aComment = tmp;
									break;
								case 3:
									$scope.cmData.aBookmark = tmp;
									break;
								case 4:
									$scope.cmData.aFb = tmp;
									break;
								case 5:
									$scope.cmData.aTwitter = tmp;
									break;
							}
							$scope.cmData.isHighlight = ($scope.cmData.aHighlight.length > 0)?true:false;
							$scope.cmData.isComment = ($scope.cmData.aComment.length > 0)?true:false;
							$scope.cmData.isBookmark = ($scope.cmData.aBookmark.length > 0)?true:false;
							$scope.cmData.isFb = ($scope.cmData.aFb.length > 0)?true:false;
							$scope.cmData.isTwitter = ($scope.cmData.aTwitter.length > 0)?true:false;
						}
					}
				} ).error( function( err ){
					console.log( err );
				} );

			};
		}
	] );