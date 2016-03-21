/**
* Роуты для компонента
* cmtooltip
*/

'use strict';

module.exports = function( app ){
	var cmtooltip = require( '../../app/controllers/cmtooltip.server.controller' );

	app.route( '/api/cmtooltip' )
		.get( cmtooltip.all )
		.post( cmtooltip.create )
		.put( cmtooltip.update )
		.delete( cmtooltip.remove );

	app.route( '/api/cmtooltip/:itemId' )
		.get( cmtooltip.cm_data );

	/*app.route( '/api/cmtooltip/:toolId' )
		.get( cmtooltip.readOne );

	app.param( 'toolId', cmtooltip.getOne );*/
};