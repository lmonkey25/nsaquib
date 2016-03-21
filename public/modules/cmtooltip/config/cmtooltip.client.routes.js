/*
* Роуты для cmtooltip
* Клиентская часть
*/

'use strict';

angular.module( 'cmtooltip' )
	.config( ['$stateProvider', function( $stateProvider ){
		$stateProvider.state( 'createCmtooltip', {
			url: '/cmtooltip/create',
			data: {
				permissions: {
					only: ['admin', 'reviewer', 'editor'],
					redirectTo: 'signin'
				}
			}
		} );
		$stateProvider.state( 'getAllCmtooltip', {
			url: '/cmtooltip',
			data: {
				permissions: {
					only: ['admin', 'reviewer', 'editor'],
					redirectTo: 'signin'
				}
			}
		} );
		$stateProvider.state( 'getCmtooltip', {
			url: '/cmtooltip/:itemId'
			/*data: {
				permissions: {
					only: ['admin', 'reviewer', 'editor'],
					redirectTo: 'signin'
				}
			}*/
		} );
	}] );