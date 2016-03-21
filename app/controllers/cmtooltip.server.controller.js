/**
* Контроллер для обработки
* полученных данных в cmtooltip
**/

'use strict';

var mongoose = require( 'mongoose' );
var CmTooltip = mongoose.model( 'CmTooltip' );
var _ = require( 'lodash' );
var errorHandler = require( './errors.server.controller' );
var User = mongoose.model( 'User' );
var policy = require( '../../config/policy' );
var acl = policy.acl();
var _Promise = require( 'promise' );
var Journal1 = mongoose.model( 'Journal1' );
var Journal2 = mongoose.model( 'Journal2' );
var url = require( 'url' );


/*
create cmtooltip
record
*/
exports.create = function( req, res, next ){
	CmTooltip.find( { user: req.body.params.cmtooltip.user } ).exec( function( err, data ){
		var cm = null;
		var i = 0;
		var index = -1;
		var location = {};
		if( err ){
			return res.status( 400 ).send({
				error: errorHandler.getErrorMessage( err )
			});
		}
		if( data === null || data.length === 0 ){
			//insert new record
			var rSave = {
				user: req.body.params.cmtooltip.user,
				cmData: [req.body.params.cmtooltip.cmData]
			};
			cm = new CmTooltip( rSave );
			cm.save( function( err ){
				if( err ){
					return res.status( 400 ).send({
						error: errorHandler.getErrorMessage( err )
					});
				}
				return res.send( cm );
			} );
		}else{
			cm = data[0];
			if( req.body.params.cmtooltip.cmData.dataType === 3 ){
				//Для начала посмотрим, есть ли в этой статье закладка
				//если да, то удалим ее
				//для журналов ставим костыль, чтобы закладка была одна на весь журнал, а не на статью
				if( 'location' in req.body.params.cmtooltip.cmData && req.body.params.cmtooltip.cmData.location.indexOf( '/journal1' ) !== -1 ){
					location = url.parse( req.body.params.cmtooltip.cmData.location, true );
					for( i = 0; i < cm.cmData.length; i++ ){
						if( cm.cmData[i].dataType === 3 && cm.cmData[i].location.indexOf( location.pathname ) !== -1 ){
							index = i;
							break;
						}
					}
				}else{
					for( i = 0; i < cm.cmData.length; i++ ){
						if( cm.cmData[i].dataType === 3 && cm.cmData[i].itemId === req.body.params.cmtooltip.cmData.itemId ){
							index = i;
							break;
						}
					}
				}
				if( index !== -1 ){
					cm.cmData.splice( index, 1 );
					cm.markModified( 'cmData' );
					cm.save( function( err ){
						if( err ){
							return res.status( 400 ).send({
								error: errorHandler.getErrorMessage( err )
							});
						}
						cm.update( { $push: {cmData: req.body.params.cmtooltip.cmData} } ).exec( function( error, rs ){
							if( error ){
								return res.status( 400 ).send({
									error: errorHandler.getErrorMessage( error )
								});
							}
							res.status( 200 ).send( cm );
						} );
					} );
				}else{
					
					//insert into array of data
					cm.update( { $push: {cmData: req.body.params.cmtooltip.cmData} } ).exec( function( err, data ){
						if( err ){
							return res.status( 400 ).send({
								error: errorHandler.getErrorMessage( err )
							});
						}
						res.status( 200 ).send( cm );
					} );
				}

			}else{
				//insert into array of data
				cm.update( { $push: {cmData: req.body.params.cmtooltip.cmData} } ).exec( function( err, data ){
					if( err ){
						return res.status( 400 ).send({
							error: errorHandler.getErrorMessage( err )
						});
					}
					//find updated object
					CmTooltip.find( { user: req.body.params.cmtooltip.user } ).exec( function( err, uData ){
						if( err ){
							return res.status( 400 ).send({
								error: errorHandler.getErrorMessage( err )
							});
						}
						res.status( 200 ).send( uData[0] );
					} );
				} );
			}
		}
	} );
};


/*
get all data from
mongo by unique id
*/
exports.cm_data = function( req, res ){
	if( !req.query.itemId ){
		return res.send( 400 ).send({
			error: 'Can not load cmtooltip data!'
		});
	}
	if( !req.user ){
		return res.send( [] );
	}
	CmTooltip.find( { cmData: { $elemMatch: { itemId: req.query.itemId } } } ).populate([
		{
			path: 'user',
			select: '_id displayName'
		}
	]).exec( function( err, data ){
		var ret = [];
		var i = 0;
		var j = 0;
		var flagNew = false;
		var pos = 0;
		if( err ){
			return res.status( 400 ).send({
				error: errorHandler.getErrorMessage( err )
			});
		}
		//filter by user and private/share data
		for( i = 0; i < data.length; i++ ){
			//_.isEqual - because _id is Object!
			if( _.isEqual( data[i].user._id, req.user._id ) ){
				ret.push( {
					user: data[i].user,
					cmData: []
				} );
				pos = ret.length - 1;
				for( j = 0; j < data[i].cmData.length; j++ ){
					if( data[i].cmData[j].itemId === req.query.itemId ){
						ret[pos].cmData.push( data[i].cmData[j] );
					}
				}
			}else{
				//find share data
				flagNew = true;
				for( j = 0; j < data[i].cmData.length; j++ ){
					if( data[i].cmData[j].isPrivate === false && data[i].cmData[j].itemId === req.query.itemId ){
						if( flagNew ){
							ret.push( {
								user: data[i].user,
								cmData: []
							} );
							flagNew = false;
						}
						pos = ret.length - 1;
						ret[pos].cmData.push( data[i].cmData[j] );
					}
				}
			}
		}
		res.send( ret );
	} );
};


/**
get all data by userId
*/
exports.cm_data_user = function( req, res ){
	if( !req.query.userId ){
		return res.send( 400 ).send({
			error: 'Can not load cmtooltip data!'
		});
	}
	CmTooltip.find( { user: req.query.userId } ).exec( function( err, data ){
		var pr_arr = [];
		var i = 0;
		var parsed = [];
		var journal_id = null;
		var pos = 0;
		var art_index = [];
		if( err ){
			return res.status( 400 ).send({
				error: errorHandler.getErrorMessage( err )
			});
		}
		if( !data || data.length === 0 ){
			return res.status( 400 ).send({
				error: 'Cannot load cmtooltip for user!'
			});
		}


		//special for jshint!!!!!
		//what a IDIOT wrote jshint???
		function journal1Find( resolve, reject ){
			Journal1.findOne( {_id: mongoose.Types.ObjectId( journal_id ) } ).select( 'year month articles' ).exec( function( err, jrnl1 ){
				if( err ){
					console.log( err );
					return reject( err );
				}
				resolve( jrnl1 );
			} );
		}

		function journal2Find( resolve, reject ){
			Journal2.findOne( {_id: mongoose.Types.ObjectId( journal_id ) } ).select( 'year month articles' ).exec( function( err, jrnl2 ){
				if( err ){
					console.log( err );
					return reject( err );
				}
				resolve( jrnl2 );
			} );
		}

		//если у нас в линке есть journal1 or journal2, то вытаскиваем журнал и статью
		//частный случай
		for( i = 0; i < data[0].cmData.length; i++ ){
			pos = data[0].cmData[i].location.indexOf( 'journal1/' );
			if( pos !== -1 ){
				//парсим линк
				parsed.push( url.parse( data[0].cmData[i].location, true ) );
				pos = parsed[parsed.length - 1].pathname.indexOf( 'journal1/' );
				journal_id = parsed[parsed.length - 1].pathname.substring( pos + 9, parsed[parsed.length - 1].pathname.length );
				art_index.push( i );
				pr_arr.push( new _Promise( journal1Find ) );
			}else{
				pos = data[0].cmData[i].location.indexOf( 'journal2/' );
				if( pos !== -1 ){
					//парсим линк
					parsed.push( url.parse( data[0].cmData[i].location, true ) );
					pos = parsed[parsed.length - 1].pathname.indexOf( 'journal2/' );
					journal_id = parsed[parsed.length - 1].pathname.substring( pos + 9, parsed[parsed.length - 1].pathname.length );
					art_index.push( i );
					pr_arr.push( new _Promise( journal2Find ) );
				}
			}
		}
		if( pr_arr.length > 0 ){

			_Promise.all( pr_arr ).then( function( resp ){
				var i = 0;
				var j = 0;
				var articleNo = 0;
				var article = {};
				try{
					for( i = 0; i < data[0].cmData.length; i++ ){
						if( !( i in art_index ) ) continue;
						if( resp[i] === null ) continue;
						if( 'articleNo' in parsed[i].query ){
							articleNo = parseInt( parsed[i].query.articleNo );
						}
						article = { title: '' };
						if( typeof( resp[i].articles[articleNo] ) !== 'undefined' ){
							article = resp[i].articles[articleNo];
						}
						if( 'title' in data[0].cmData[i] && typeof( data[0].cmData[i].title ) !== 'undefined' ){
							data[0].cmData[i].title = resp[i].month + ', ' + resp[i].year + ' :' + article.title + ' (' + data[0].cmData[i].title + ')';
						}else{
							data[0].cmData[i].title = resp[i].month + ', ' + resp[i].year + ' :' + article.title;
						}
					}
				}catch( c_e ){
					console.log( c_e, '---', data[0].cmData[i], '--article--', resp[i], 'articleNo-', articleNo );
				}
				return res.send( data[0] );
			} );
		}else{
			return res.send( data[0] );
		}
	} );
};

/**
get all data from cmtooltip
*/
exports.all = function( req, res ){
	if( req.query !== null && req.query.itemId ){
		exports.cm_data( req, res );
	}else if( req.query !== null && req.query.toolId ){
		exports.readOne( req, res );
	}else if( req.query !== null && req.query.userId ){
		exports.cm_data_user( req, res );
	}else{
		CmTooltip.find( {} ).populate([
			{
				path: 'user',
				select: '_id displayName'
			}
		]).exec( function( err, data ){
			if( err ){
				return res.status( 400 ).send({
					error: errorHandler.getErrorMessage( err )
				});
			}
			req.tooltips = data;
			res.send( data );
		} );
	}
};


/*
delete tooltip
*/
exports.remove = function( req, res, next ){
	var id = req.query.toolId;
	if( id ){
		CmTooltip.find( { cmData: { $elemMatch: { _id: id } } } ).exec( function( err, data ){
			var i = 0;
			var index = -1;
			if( err ){
				return next( err );
			}
			if( !data ){
				return res.status( 400 ).send({
					error: 'Cannot delete tooltip ' + id
				});
			}
			for( i = 0; i < data[0].cmData.length; i++ ){
				if( id === data[0].cmData[i]._id.toString() ){
					index = i;
					break;
				}
			}
			if( index !== -1 ){
				//remove tooltip
				data[0].cmData.splice( index, 1 );
				data[0].markModified( 'cmData' );
				data[0].save( function( err ){
					if( err ){
						return res.status( 400 ).send({
							error: errorHandler.getErrorMessage( err )
						});
					}
					res.status(200).send( data[0] );
				} );
			}else{
				res.send( data[0] );
			}
		} );
	}else{
		res.status( 400 ).send({
			error: 'Cannot delete cmtooltip!'
		});
	}
};


/*
update tooltip
*/
exports.update = function( req, res ){
	var id = req.body.params.toolId;
	var cmData = req.body.params.cmData;
	if( id ){
		CmTooltip.find( { cmData: { $elemMatch: { _id: id } } } ).exec( function( err, data ){
			var i = 0;
			var index = -1;
			if( err ){
				return res.status( 400 ).send({
					error: errorHandler.getErrorMessage( err )
				});
			}
			if( !data ){
				return res.status( 400 ).send({
					error: 'Cannot update tooltip ' + id
				});
			}
			for( i = 0; i < data[0].cmData.length; i++ ){
				if( id === data[0].cmData[i]._id.toString() ){
					index = i;
					break;
				}
			}
			if( index !== -1 ){
				data[0].cmData[index].isPrivate = cmData.isPrivate;
				data[0].cmData[index].comment = ( cmData.comment)?cmData.comment:'';
				//update tooltip
				data[0].markModified( 'cmData' );
				data[0].save( function( err ){
					if( err ){
						return res.status( 400 ).send({
							error: errorHandler.getErrorMessage( err )
						});
					}
					res.status(200).send( data[0] );
				} );
			}else{
				res.send( data[0] );
			}
		} );
	}else{
		res.status( 400 ).send({
			error: 'Cannot update cmtooltip!'
		});
	}
};


/*
read one tooltip
*/
exports.readOne = function( req, res ){
	var id = req.query.toolId;
	CmTooltip.find( { cmData: { $elemMatch: { _id: id } } } )
		.populate([
			{ path: 'user', select: '_id displayName' }
		])
		.exec( function( err, data ){
			var ret = {
				user: null,
				cmData: []
			};
			var i = 0;
			if( err ){
				return res.status( 400 ).send({
					error: errorHandler.getErrorMessage( err )
				});
			}
			if( !data ){
				return new Error( 'Failed to load cmtooltip ' + id );
			}
			ret.user = data[0].user;
			for( i = 0; i < data[0].cmData.length; i++ ){
				if( id === data[0].cmData[i]._id.toString() ){
					ret.cmData.push( data[0].cmData[i] );
					break;
				}
			}
			res.send( ret );
		});
};



/*
get one cmtooltip
*/
exports.getOne = function( req, res, next, id ){
	CmTooltip.find( { cmData: { $elemMatch: { _id: id } } } )
		.populate([
			{ path: 'user', select: '_id displayName' }
		])
		.exec( function( err, data ){
			if( err ){
				return next( err );
			}
			if( !data ){
				return next( new Error( 'Failed to load cmtooltip ' + id ) );
			}
			req.cmtooltip = data;
			next();
		});
};