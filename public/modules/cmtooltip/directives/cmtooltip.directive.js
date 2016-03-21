/**
* Директива для отображения
* тултипов при выделении или уже выделенном месте
*/

'use strict';

angular.module( 'cmtooltip' )
	.directive( 'cmSelect', function( $http, $compile, _ ){
		return {
			restrict: 'A',
			transclude: false,
			link: function( $scope, elem, attrs ){

				/*
				get selection with html tags
				*/
				function getSelectionHtml(){
					var html = '';
					var sel = null;
					var container = null;
					var i = 0;
					var len = 0;
					if( typeof( window.getSelection ) !== 'undefined' ){
						sel = window.getSelection();
						if( sel.rangeCount ){
							container = document.createElement( 'div' ); //create container for html
							for( i = 0, len = sel.rangeCount; i < len; ++i ){
								container.appendChild( sel.getRangeAt( i ).cloneContents() );
							}
							html = container.innerHTML;
						}
					}else if( typeof( document.selection ) !== 'undefined' ){
						if( document.selection.type === 'Text' ){
							html = document.selection.createRange().htmlText;
						}
					}
					return html;
				}


				/*
				get selection text start and end pos
				*/
				function getSelectionCharOffsetsWithin( element ){
				    var start = 0, end = 0;
				    var sel, range, priorRange;
				    var div = {};
				    var div2 = {};
				    var first = '';
				    var second = '';
				    var elemSel = null;
				    var pos = -1;
				    if( typeof window.getSelection !== 'undefined' ) {
				        range = window.getSelection().getRangeAt(0);
				        priorRange = range.cloneRange();
				        priorRange.selectNodeContents(element);
				        priorRange.setEnd(range.startContainer, range.startOffset);
				        div = document.createElement( 'div' );
				        div.appendChild( priorRange.cloneContents() );
				        first = div.innerHTML;

						if( first.indexOf( 'editcontprop' ) !== -1 || ( first.indexOf( '<span' ) !== -1 && first.indexOf( 'sp_' ) !== -1 ) ){
							elemSel = $( '<div>' + first + '</div>' );
							elemSel.find( 'span' ).each( function( index ){
								var text = '';
								if( this.id && this.id !== null && this.id.indexOf( 'sp_' ) !== -1 ){
									text = $( this ).html();
									$(this).replaceWith( text );
								}
							} );
							first = elemSel.html();
						}
						//необходимо убирать последний закрывающий тег,
						//чтобы правильно вычислять смещение

						pos = first.lastIndexOf( '>' );
						if( pos !== -1 && pos === first.length - 1 ){
							pos = first.lastIndexOf( '</' );
							if( pos !== -1 ){
								first = first.substring( 0, pos );
							}
						}
				        div2 = document.createElement( 'div' );
				        div2.appendChild( range.cloneContents() );
				        second = div2.innerHTML;

						if( second.indexOf( 'editcontprop' ) !== -1 || ( second.indexOf( '<span' ) !== -1 && second.indexOf( 'sp_' ) !== -1 ) ){
							elemSel = $( '<div>' + second + '</div>' );
							elemSel.find( 'span' ).each( function( index ){
								var text = '';
								if( this.id && this.id !== null && this.id.indexOf( 'sp_' ) !== -1 ){
									text = $( this ).html();
									$(this).replaceWith( text );
								}
							} );
							second = elemSel.html();
						}
				        /*start = priorRange.toString().length;
				        end = start + range.toString().length;*/
				        start = first.length;
				        end = start + second.length;
				    } else if (typeof document.selection !== 'undefined' &&
				            (sel = document.selection).type !== 'Control') {
				        range = sel.createRange();
				        priorRange = document.body.createTextRange();
				        priorRange.moveToElementText(element);
				        priorRange.setEndPoint('EndToStart', range);
				        start = priorRange.text.length;
				        end = start + range.text.length;
				    }
				    return {
				        startOffset: start,
				        endOffset: end
				    };
				}


				$http.get( 'modules/cmtooltip/views/cm-first.client.view.html' )
					.then( function( response ){
						var template = '';
						if( !response || response.status !== 200 ){
							console.log( 'Error load template!' );
							return false;
						}
						template = angular.element( response.data );
						template = $compile( template )( $scope );
						$( elem ).mouseup( function( e ){
							if( window.getSelection ){
								var selRawText = window.getSelection().toString();
								var selText = '';
								var rRange = {
									startOffset: 0,
									endOffset: 0
								};
								var offset = {};
								var left = 0;
								var top = 0;
								var height = 0;
								var width = 0;
								var posLeft = 0;
								var place = 'top';
								var fullFirstText = ($scope.elemData && $scope.elemData.textContent)?$scope.elemData.textContent:elem.html();
								var elemSel = null;
								selText = getSelectionHtml();
								//Удаляем уже промаркированные теги
								if( selText.indexOf( 'editcontprop' ) !== -1 || ( selText.indexOf( '<span' ) !== -1 && selText.indexOf( 'sp_' ) !== -1 ) ){
									elemSel = $( '<div>' + selText + '</div>' );
									elemSel.find( 'span' ).each( function( index ){
										var text = '';
										if( this.id && this.id !== null && this.id.indexOf( 'sp_' ) !== -1 ){
											text = $( this ).html();
											$(this).replaceWith( text );
										}
									} );
									selText = elemSel.html();
								}
								//---------------------------------
								if( selText.length ){ //if some text is selected
									//send to scope unique id of element
									$scope.cmSelect = attrs.cmSelect;
									$scope.selText = {
										text: '',
										range: null,
										length: 0,
										rawText: selRawText
									};
									$scope.selText.text = _.clone( selText );
									rRange = getSelectionCharOffsetsWithin( elem.context );
									/*rRange.startOffset = fullFirstText.indexOf( $scope.selText.text );
									rRange.endOffset = rRange.startOffset + $scope.selText.text.length;*/
									$scope.selText.range = rRange;
									$scope.selText.length = $scope.selText.text.length;
									$( elem ).popover({
										html: true,
										trigger: 'manual',
										content: template,
										placement: function( context, source ){
											var position = $( source ).position();
											var ret = 'top';
											return ret;
										}
									});
									$( elem ).popover( 'show' );
									offset = $( this ).offset();
									left = e.pageX;
									top = e.pageY;
									height = $( '.popover' ).height();
									width = $( '.popover' ).width();
									posLeft = left - width;
									place = 'top';
									if( posLeft < 0 ){
										posLeft = 10;
									}
									$( '.popover' ).css( 'left', ( posLeft - offset.left ) + 'px' );
									$( '.popover' ).css( 'top', ( top - offset.top ) + 'px' );
								}else{
									$( elem ).popover( 'destroy' );
								}
							}
						});
					} );
			}
		};
	} );