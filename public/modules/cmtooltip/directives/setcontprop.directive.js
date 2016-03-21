/**
* Директива для получения
* контента и проставления в нем
* необходимых тегов
*/

'use strict';

angular.module( 'cmtooltip' ).directive( 'setcontprop', function( $http, $compile, $timeout, CmParse, CmShare ){
	return {
		restrict: 'A',
		transclude: true,
		replace: true,
		link: function( $scope, elem, attrs ){
			attrs.$observe( 'setcontprop', function( value ){
				//@ params are not available immediatly
				$timeout( function(){
					//for livereload in controller
					$scope.elemData = {
						elem: elem,
						attrs: attrs,
						textContent: elem.html(),
						oldScope: $scope
					};
					CmParse.render( $scope, elem, value, elem.html() );
					CmShare.renderButton( '#at4-share' );
				} );
			} );
		}
	};
} )
	.directive( 'editcontprop', function( $http, $compile, $timeout ){
		return {
			restrict: 'A',
			transclude: false,
			link: function( $scope, elem, attrs ){
				$http.get( 'modules/cmtooltip/views/cm-second.client.view.html' )
					.then( function( response ){
						var template = '';
						var selObj = null;
						var selText = '';
						if( !response || response.status !== 200 ){
							console.log( 'Error load template!' );
							return false;
						}

						//click в любом месте убирает тултип
						$( 'body' ).click( function( e ){
							if( $scope.showEdit ){
								$( '.popover' ).each( function( i ){
									if( $( this ).has( e.target ).length === 0 ){
										$( this ).popover( 'destroy' );
										$scope.showEdit = false;
									}
								} );
							}
						} );


						if( 'editcontprop' in attrs ){
							$scope.editcontprop = attrs.editcontprop;
							template = angular.element( response.data );
							template = $compile( template )( $scope );
							$( '#sp_' + attrs.editcontprop ).popover( 'destroy' );
							//clear events
							$( document ).off( 'click', '#sp_' + attrs.editcontprop ).on( 'click', '#sp_' + attrs.editcontprop, function(){
								if( window.getSelection ){
									selObj = window.getSelection();
									selText = selObj.toString();
								}
								//проверка на то, что публичное отключено - пока так
								if( this.style.backgroundColor === 'rgb(255, 255, 255)' ){
									$( this ).popover( 'destroy' );
									$scope.showEdit = false;
									return false;
								}
								if( attrs.editcontprop.length > 0 && selText.length === 0 ){ //if some clicked
									if( !$scope.showEdit ){
										$( this ).popover({
											html: true,
											trigger: 'manual',
											content: template,
											placement: 'auto top',
											id: 'cmedit_popover',
											title: function(){
												return $( this ).data( 'title' ) + '<span class="close">&times;</span>';
											}
										}).on( 'shown.bs.popover', function( e ){
											var popover = $( this );
											$( this ).parent().find('div.popover .close').on('click', function( e ){
												popover.popover('hide');
											});
										} ); 
										$( this ).popover( 'show' );
										$scope.showEdit = true;
									}else{
										$scope.showEdit = false;
										$( this ).popover( 'hide' );
										$( this ).popover( 'destroy' );
									}
								}else{
									$scope.showEdit = false;
									$( this ).popover( 'destroy' );
								}
							});
						}else{
							$( this ).popover( 'destroy' );
						}
					} );

			}
		};
	} );