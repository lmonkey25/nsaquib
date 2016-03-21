'use strict';

module.exports = function( app ){
	var journal2 = require( '../../app/controllers/journal2.server.controller' );
	var ft = require( '../../app/controllers/featured.server.controller' );
	// Journal routes
	app.route( '/api/journal2' )
		.get( journal2.list )
		.post( journal2.create, ft.update );

	app.route('/api/journal2/categories')
		.get(journal2.categories);

	app.route( '/api/journal2/:journal2Id' )
		.get( journal2.canAccessJournal2, journal2.read )
		.post( journal2.canModifyJournal2, journal2.addContent )
		.put( journal2.canModifyJournal2, journal2.update, ft.update )
		.delete( journal2.delete );
	//articles
	app.route( '/api/article2' )
		.delete( /*journal1.canModifyJournal,*/ journal2.deleteArticle );
	// Bind Journal middleware
	app.param( 'journal2Id', journal2.journal2ByID );

	app.route( '/api/authors' )
		.get( journal2.authors );
};