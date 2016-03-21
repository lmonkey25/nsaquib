'use strict';

module.exports = function( app ){
	var journal1 = require( '../../app/controllers/journal1.server.controller' );
	var ft = require( '../../app/controllers/featured.server.controller' );
	// Journal routes
	app.route( '/api/journal1' )
		.get( journal1.list )
		.post( journal1.create, ft.update );

	app.route('/api/journal1/categories')
		.get(journal1.categories);

	app.route( '/api/journal1/:journalId' )
		.get( journal1.canAccessJournal, journal1.read )
		.post( journal1.canModifyJournal, journal1.addContent )
		.put( journal1.canModifyJournal, journal1.update, ft.update )
		.delete( journal1.delete );
	//articles
	app.route( '/api/article1' )
		.delete( /*journal1.canModifyJournal,*/ journal1.deleteArticle );
	// Bind Journal middleware
	app.param( 'journalId', journal1.journalByID );

	app.route( '/api/authors' )
		.get( journal1.authors );
};