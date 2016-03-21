/**
*
* Модель данных для
* компонента комментариев
*/

'use strict';

var mongoose = require( 'mongoose' );
var _ = require( 'lodash' );
var Schema = mongoose.Schema;


var DataSchema = new Schema({});
DataSchema.add( {
	dataType: {
		type: Number,
		default: 1,
		enum: [1, 2, 3] //1 - Highlight; 2 - Comment; 3 - Bookmark
	},
	isPrivate: {
		type: Boolean,
		default: true
	},
	comment: String,
	itemId: String,
	posStart: Number,
	posEnd: Number,
	location: String,
	title: String,
	modifyDate: {
		type: Date,
		default: Date.now
	}
} );


/**
* Data Schema
*/
var CmSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	cmData: [DataSchema]
});

var CmModel = mongoose.model( 'CmTooltip', CmSchema );