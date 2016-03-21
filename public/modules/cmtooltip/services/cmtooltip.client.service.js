'use strict';

angular.module( 'cmtooltip' )
	.factory( 'CmParse', [ '$http', '$compile', '$location','_',
	function( $http, $compile, $location, _ ){
		return {
			render: function( $scope, elem, id_prop, text_element ){
				//*************************************
				/*
				* Проверка на пересечения
				* и устранение таковых
				*/
				function checkCrossing( cm1, cm2 ){
					var i = 0;
					var j = 0;
					var ret = [];
					var tmp1 = [];
					var tmp2 = [];
					var obj = {};
					var pos = [];
					var curr = -1;
					var flagPush = false;

					if( cm1 === null || cm2 === null ) return ret;
					//crossing in first
					tmp1 = checkCrossOne( cm1 );
					tmp2 = checkCrossOne( cm2 );

					if( tmp1.length === 0 && tmp2.length !== 0 ) return tmp2;
					if( tmp1.length !== 0 && tmp2.length === 0 ) return tmp1;

					for( i = 0; i < tmp1.length; i++ ){
						ret.push( tmp1[i] );
					}
					for( j = 0; j < tmp2.length; j++ ){
						flagPush = false;
						if( j in pos ) continue; //отработка
						for( i = 0; i < tmp1.length; i++ ){
							if( tmp2[j].posStart >= tmp1[i].posStart && tmp2[j].posEnd <= tmp1[i].posEnd ){
								//всередине - continue;
								pos.push( j );
								flagPush = true;
								curr = ret.length - 1;
								continue;
							}else if( tmp1[i].posStart >= tmp2[j].posStart && tmp1[i].posEnd <= tmp2[j].posEnd ){
								//приват всередине
								obj = _.clone( tmp2[j] );
								obj.posEnd = tmp1[i].posStart;
								ret.push( obj );
								obj = _.clone( tmp2[j] );
								obj.posStart = tmp1[i].posEnd;
								ret.push( obj );
								pos.push( j );
								curr = ret.length - 1;
								flagPush = true;
								continue;
							}else if( tmp2[j].posStart < tmp1[i].posEnd && tmp2[j].posEnd > tmp1[i].posEnd ){
								if( !flagPush || curr === -1 ){
									obj = _.clone( tmp2[j] );
									obj.posStart = tmp1[i].posEnd;
									ret.push( obj );
									pos.push( j );
									flagPush = true;
									curr = ret.length - 1;
								}else{
									ret[curr].posStart = tmp1[i].posEnd;
								}
								continue;
							}else if( tmp2[j].posEnd > tmp1[i].posStart && tmp2[j].posEnd < tmp1[i].posEnd ){
								if( !flagPush || curr === -1 ){
									obj = _.clone( tmp2[j] );
									obj.posEnd = tmp1[i].posStart;
									ret.push( obj );
									pos.push( j );
									flagPush = true;
									curr = ret.length - 1;
									continue;
								}else{
									ret[curr].posEnd = tmp1[i].posStart;
								}
							}
							if( flagPush ) break;
						}
						if( !flagPush ){
							ret.push( tmp2[j] );
							pos.push( j );
							curr = ret.length - 1;
						}
					}
					return ret;
				}

				/**
				* Проверка пересечения в одном массиве
				*/
				function checkCrossOne( cm ){
					var i = 0;
					var ret = [];
					var pos = 0;
					var tmp = {};
					for( i = 0; i < cm.length; i++ ){
						if( i === 0 ){
							ret.push( cm[i] );
						}else{
							pos = ret.length - 1;
							if( cm[i].posStart >= ret[pos].posStart && cm[i].posEnd <= ret[pos].posEnd ){
								//всередине
								tmp = _.clone( ret[pos] );
								ret[pos].posEnd = cm[i].posStart;
								ret.push( cm[i] );
								tmp.posStart = cm[i].posEnd;
								ret.push( tmp );
							}else if( cm[i].posStart < ret[pos].posEnd ){
								ret[pos].posEnd = cm[i].posStart;
								ret.push( cm[i] );
							}else{
								ret.push( cm[i] );
							}
						}
					}
					return ret;
				}

				//get data about cmtooltips on page
				$http.get( '/api/cmtooltip?itemId=' + id_prop, {
					query: {
						user: $scope.authentication.user
					}
				} ).success( function( data ){
					var i = 0;
					var j = 0;
					var cmRawPriv = [];
					var cmRawNon = [];
					var cmData = [];
					var text = '';
					var tmp = {};
					//parse data
					if( !data || data.length === 0 ) return false;
					for( i = 0; i < data.length; i++ ){
						if( data[i] !== null && 'cmData' in data[i] && data[i].cmData.length > 0 ){
							for( j = 0; j < data[i].cmData.length; j++ ){
								tmp = data[i].cmData[j];
								tmp.user = data[i].user;
								if( tmp.isPrivate ){
									cmRawPriv.push( tmp ); //private data
								}else{
									cmRawNon.push( tmp ); //share data
								}
							}
						}
						//sorting cmData by posStart
						cmRawPriv.sort( function( a, b ){
							if( a.posStart > b.posStart ){
								return 1;
							}
							if( a.posStart < b.posStart ){
								return -1;
							}
							return 0; //==
						} );
						cmRawNon.sort( function( a, b ){
							if( a.posStart > b.posStart ){
								return 1;
							}
							if( a.posStart < b.posStart ){
								return -1;
							}
							return 0; //==
						} );
						cmData = checkCrossing( cmRawPriv, cmRawNon );
						//sort
						cmData.sort( function( a, b ){
							if( a.posStart > b.posStart ){
								return 1;
							}
							if( a.posStart < b.posStart ){
								return -1;
							}
							return 0; //==
						} );

						//console.log( cmData );

					}
					var tag = '';
					var content = '';
					var pos = -1;
					var url = '';
					var elem_id = '';
					var elem_obj = null;
					//get element text
					content = text_element;
					//parse data
					for( i = 0; i < cmData.length; i++ ){
						if( i === 0 && cmData[i].posStart !== 0 ){
							text = content.substring( 0, cmData[i].posStart );
							pos = cmData[i].posStart;
						}
						tag = '';
						switch( cmData[i].dataType ){
							case 1:
								if( cmData[i].isPrivate ){
									//tag = '<span class="highlight-text-private">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									tag = '<span style="background-color:#4169E1;color:white;" title="Hihglighted you" editcontprop="' + cmData[i]._id + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
								}else{
									//tag = '<span class="highlight-text">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									if( $scope.authentication.user._id === cmData[i].user._id ){
										tag = '<span class="share-highlight" style="background-color:#c6d2f6;" title="Hihglighted ' + cmData[i].user.displayName + '" editcontprop="' + cmData[i]._id + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									}else{
										tag = '<span class="share-highlight" style="background-color:#c6d2f6;" title="Hihglighted ' + cmData[i].user.displayName + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									}
								}
								break;
							case 2:
								if( cmData[i].isPrivate ){
									tag = '<span style="background-color:#696969;color:white;" title="' + cmData[i].comment + ':' + cmData[i].user.displayName + '" editcontprop="' + cmData[i]._id + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									//tag = '<span style="border-bottom:1px dotted #696969;" title="' + cmData[i].comment + ':' + cmData[i].user.displayName + '" editcontprop="' + cmData[i]._id + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
								}else{
									//tag = '<span style="border-bottom:1px dotted #C3C3C3;" title="' + cmData[i].comment + ':' + cmData[i].user.displayName + '" editcontprop="' + cmData[i]._id + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									if( $scope.authentication.user._id === cmData[i].user._id ){
										tag = '<span class="share-comment" style="background-color:#C3C3C3;" title="' + cmData[i].comment + ':' + cmData[i].user.displayName + '" editcontprop="' + cmData[i]._id + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									}else{
										tag = '<span class="share-comment" style="background-color:#C3C3C3;" title="' + cmData[i].comment + ':' + cmData[i].user.displayName + '" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
									}
								}
								break;
							case 3:
								tag = '<span style="background-color:#ffffcc;" title="Bookmark" id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
								break;
							case 4: 	//FB
							case 5: 	//Twitter
								tag = '<span id="sp_' + cmData[i]._id + '">' + content.substring( cmData[i].posStart, cmData[i].posEnd ) + '</span>';
								break;
						}

						if( pos < cmData[i].posStart ){
							text += content.substring( pos, cmData[i].posStart );
						}
						text += tag;
						pos = cmData[i].posEnd;
					}
					if( pos < content.length ){
						text += content.substring( pos, content.length - 1 );
					}
					var compilled = $compile( '<div>' + text + '</div>' )( $scope ); //for compile directive
					elem.html( text );
					//scroll to elememt if need
					url = $location.url();
					pos = url.indexOf( '#' );
					if( pos !== -1 ){
						elem_id = url.substring( pos, url.length );
						elem_obj = $( elem_id );
						if( elem_obj[0] ){
							window.scrollTo( 0, elem_obj.offset().top );
						}
					}
				} ).error( function( err ){
					console.log( err );
				} );

				//*************************************
			}
		};
	} ] )
.factory( 'CmShare', ['$timeout', '_',
	function( $timeout, _ ){
		return {
			renderButton: function( id_element ){
				$timeout( function(){
					var element = $( id_element );
					var btn = null;
					var template = '';
					if( !element ){
						return false;
					}
					//prepare template
					template = '<div id="hide-share-div"><button id="hide-share-button" class="btn"><span class="glyphicon glyphicon-list-alt"></span></button></div>';
					element.find( '#hide-share-div' ).remove(); //зачистка предыдущих рейнкарнаций
					element.append( template );
					btn = $( '#hide-share-button' );
					if( btn ){
						btn.click( function( e ){
							$( '.share-highlight' ).each( function( el ){
								if( this.style.backgroundColor !== 'rgb(255, 255, 255)' ){
									this.style.backgroundColor = '#FFFFFF';
								}else{
									this.style.backgroundColor = '#c6d2f6';
								}
							} );
							$( '.share-comment' ).each( function( el ){
								if( this.style.backgroundColor !== 'rgb(255, 255, 255)' ){
									this.style.backgroundColor = '#FFFFFF';
								}else{
									this.style.backgroundColor = '#C3C3C3';
								}
							} );
						} );
					}
				} );
			}
		};
	}
	] );