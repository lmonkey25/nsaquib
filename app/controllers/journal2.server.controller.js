/**
	Server-Side controller for Journal2
*/


'use strict';

var mongoose = require( 'mongoose' );
var errorHandler = require( './errors.server.controller' );
var Journal2 = mongoose.model( 'Journal2' );
var User = mongoose.model( 'User' );
var Article = mongoose.model( 'Article' );
var policy = require( '../../config/policy' );
var acl = policy.acl();
var _ = require( 'lodash' );
var _Promise = require( 'promise' );

/*
create journal
*/
exports.create = function( req, res, next ){
	var journal = new Journal2( req.body );
	var i = 0;
	journal.user = req.user;

	journal.save( function( err ){
		if( err ){
			return res.status( 400 ).send({
				message: errorHandler.getErrorMessage( err )
			});
		}
		req.journal2 = journal;
		return res.jsonp( journal );
	} );
};


/*
Table of contents
*/
function getInfo( journal ){
	return _.map( journal.articles, function( art ){
		return art;		
	} );
}


/*
Read current journal
*/
exports.read = function( req, res ){
	var articleNo = req.query.articleNo;
	var info = req.query.info;
	Journal2.update( { _id: req.journal2._id }, { $inc: { views: 1 } } ).exec( function( err ){
		if( err ){
			res.status( 500 ).send( 'Error update views count' );
		}else{
			var jr = req.journal2.toObject();
			jr.user = req.journal2.populated( 'user' );

			jr.views += 1;
			jr.tableOfContents = getInfo( jr );

			if( info ){
				jr.articlesCount = _.range( 0, jr.articles.length );
			}
			jr.content = jr.articles[articleNo || 0];
			if( jr.content ){

				User.find( { _id: jr.content.author }, function( err, usr ){
					if( err ){
						return res.status( 400 ).send( {
							message: 'Author not specified.'
						} );
					}
					if( usr.length > 0 ){
						jr.content.author = { _id: jr.content.author, displayName: usr[0].displayName };
					}
					delete jr.articles;
					return res.jsonp( jr );
				} );
			}else{
				delete jr.articles;
				return res.jsonp( jr );
			}
			//jr.content.author = req.journal2.articles[articleNo || 0].populate( 'author', 'displayName' );

		}

	} );
};


/*
Update journal
*/
exports.update = function( req, res, next ){
	var journal = req.journal2;
	var content = req.body.content;
	var article = req.query.articleNo;

	//check for the author
	User.isAuthor( content.author, function( is ){
		if( !is ){
			return res.status( 400 ).send( {
				message: 'Author not specified.'
			} );
		}
		//update book
		_.extend( journal._doc.articles[article]._doc, content );
		journal.markModified( 'articles' );
		journal = _.extend( journal, req.body );
		journal.save( function( err ){
			if( err ){
				return res.status( 400 ).send( {
					message: errorHandler.getErrorMessage( err )
				} );
			}
			req.journal2 = journal;
			return res.jsonp( journal );
		} );
	} );
};


/*
Remove journal
*/
exports.delete = function( req, res ){
	var journal = req.journal2;
	journal.remove( function( err ){
		if( err ){
			return res.status( 400 ).send( {
				message: errorHandler.getErrorMessage( err )
			} );
		}
		return res.jsonp( journal );
	} );
};


/*
List of All journals
*/
/**
 * List of Journals
 *
 * Filtering results:
 *     - q=foo: query param for text search
 *
 * Sorting results:
 *     - sortBy=param: parameter to sort against,
 *     - sortDir=asc: asc/desc sorting.
 *
 * Limiting number of results:
 *     - limit=10: max number of results to return.
 */
exports.search = function( req, res ){
	var promise,
		query,
		querySetup;

	querySetup = function( hasSufficientRole ){
		var conditions = [],
			limit = 500,
			sorts = {},
			projection = null,
			cond,
			tmpcond,
			query;

		if( !hasSufficientRole ){
			tmpcond = { status: 'open' };
			if( req.user ){
				tmpcond = {$or: [{ user: req.user.id }, tmpcond]};
			}
			conditions.push( tmpcond );
		}
		if( 'journal2' in req.query ){
			var authors = _.isArray( req.query.journal2.articles )?
				{$in: _.map( req.query.journal2.articles, function( authorId ){
					return mongoose.Types.ObjectId( authorId );
				})}
				: mongoose.Types.ObjectId( req.query.journal2.arcticles );
			conditions.push({ author: authors });
		}

		if( 'category' in req.query ){
			var categories = _.isArray( req.query.category ) ?
				{ $in : req.query.category }
				: req.query.category;
			conditions.push( { categories: categories } );
		}


		if( 'q' in req.query ){
			conditions.push( {$text: { $search: req.query.q, $language: 'en' } } );
			projection = { score: { $meta: 'textScore' } };
			sorts.score = { $meta: 'textScore'};
		}
		if( 'limit' in req.query ){
			limit = parseInt( req.query.limit );
		}
		if( 'sortBy' in req.query ){
			sorts[req.query.sortBy] = req.query.sortDir || 'desc';
		}

		sorts.created = 'desc';
		cond = conditions.length > 0 ? {$and: conditions} : {};
		query = Journal2.find( cond, projection ).sort( sorts ).limit( limit );

		query.populate( 'author', 'displayName' );
		return query;
	};

	// Setup filters.
	promise = new _Promise( function( resolve, reject ){
		policy.hasAtLeastRole( req, 'reviewer', function( err, has ){
			if( err ) return reject( {errors: [ {message: 'Insufficient role.'} ] } );
			query = querySetup( has );
			query.exec( function( err, journals ){
				if( err ){
					console.log( err );
					return reject( err );
				}
				_.each( journals, function( jr ) {
					if( jr._doc.articles ) delete jr._doc.arcticles;
				});
				return resolve( journals );
			});
		});
	});

	return promise;
};

exports.list = function( req, res ){
	var error = function( errObj ){
		res.status( 400 ).send({
			message: errorHandler.getErrorMessage( errObj )
		});
	};

	exports.search( req, res ).then(
		function( data ){
			return res.jsonp( data );
		},
		function( err ){
			return error( err );
		}
	);
};


exports.categories = function (req, res) {
	var limit = 16;

	Journal2.aggregate(
		{ $unwind: '$categories' },
		{ $group: { _id: '$_id', cat: { $addToSet: '$categories'} } },
		{ $unwind: '$cat' },
		{ $group: { _id: '$cat', count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: limit },
		function (err, categories) {
			if (err) {
				res.status(500).send(err);
			}
			else {
				res.jsonp(categories);
			}
		});
};


/**
 * Journal middleware
 */
exports.journal2ByID = function( req, res, next, id ){
	Journal2.findById( id )
		.populate([
			{path: 'user', select: 'displayName'}
		])
		.exec( function( err, journal ){
			if( err )return next(err);
			if( !journal ) return next( new Error( 'Failed to load Journal ' + id ) );
			req.journal2 = journal;
			next();
		});
};

/**
 * Only reviewer or higher role can see non-opened journal.
 */
exports.canAccessJournal2 = function( req, res, next ){
	/*jshint ignore:start*/
	if( req.journal2.status === 'open' || req.user && ( req.journal2.populated( 'user' ) == req.user.id ) ){
		return next();
	}else{
		policy.hasAtLeastRole( req, 'reviewer', function( err, has ){
			if( has ) return next();
			else return res.status(403).send( 'Forbidden.' );
		});
	}
	/*jshint ignore:end*/
};

exports.canModifyJournal2 = function( req, res, next ){
	/*jshint ignore:start*/
	if( req.user && ( req.journal2.populated( 'user' ) == req.user.id ) ){
		next();
	}else{
		policy.hasAtLeastRole( req, 'reviewer', function( err, has ){
			if( has ) next();
			else res.status( 403 ).send( 'Forbidden' );
		});
	}
	/*jshint ignore:end*/
};

/**
 * Journal authorization middleware
 */
exports.hasAuthorization = function( req, res, next ){
	if( req.journal2.user.id !== req.user.id ){
		return res.status( 403 ).send( 'User is not authorized' );
	}
	next();
};

exports.authors = function( req, res ){
	User.find( {roles: 'author'} )
		.select( 'displayName _id' )
		.exec( function( err, authors ){
		res.send( authors );
	});
};
exports.addContent = function( req, res ){
	var content = req.body.add,
		journal = req.journal2;
	//if( content.mode === 'article' ){
		journal.update( {$push: {articles: content}} ).exec();
	//}
	res.send( journal );
};

/*
Delete article
*/
exports.deleteArticle = function( req, res, next ){
	var journalId = req.query.journal2Id;
	var articleId = req.query.article2Id;
	Journal2.findById( journalId ).exec( function( err, data ){
		var i = 0;
		var index = -1;
		if( err ){
			return next( err );
		}
		//delete article
		for( i = 0; i < data.articles.length; i++ ){
			if( data.articles[i]._id === articleId ){
				index = i;
				break;
			}
		}
		if( index !== -1 ){
			data.articles.splice( index, 1 );
			data.markModified( 'articles' );
			data.save( function( err ){
				if( err ){
					return res.status( 400 ).send( {
						message: errorHandler.getErrorMessage( err )
					} );
				}
				req.journal2 = data;
				res.send( req.journal2 );
			} );
		}else{
			res.send( data );
		}
	} );
};
