'use strict';

var mongoose = require( 'mongoose' );
var _ = require( 'lodash' );
var Schema = mongoose.Schema;

var multilangValidator = function( val ){
	if( !_.isObject( val ) ) return false;
	if( !( 'en' in val ) && !( 'ur' in val ) ) return false;
	if( 'en' in val && val.en === '' && 'ur' in val && val.ur === '' ) return false;
	return true;
};

/*
Article schema
*/
var ArticleSchema = new Schema( {} );
ArticleSchema.add( {
	title: {
		type: String,/*,
		properties: {
			en: { type: 'string', title: 'English', trim: true, default: '' },
			ur: { type: 'string', title: 'Urdu', trim: true, default: '' }
		},*/
		required: 'Please fill in article title'/*,
		validate: multilangValidator*/
	},
	body: {
		type: String,
		/*properties: {
			en: { type: 'string', title: 'English', trim: true, default: '' },
			ur: { type: 'string', title: 'Urdu', trim: true, default: '' }
		},*/
		required: 'Please fill in article content'/*,
		validate: multilangValidator*/
	},
	categories: [String],
	keywords: [String],
	author: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	status: {
		type: String,
		enum: ['draft', 'open', 'closed'],
		default: 'draft'
	}
} );

mongoose.model( 'Article', ArticleSchema );

/*
Journal schema
*/
var JournalSchema = new Schema( {
	journallanguage: {
		type: Array,
		enum: ['English', 'Urdu']
	},
	month: {
		type: String,
		enum: ['January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November', 'December'
			],
		default: 'January'
	},
	year: {
		type: String
	},
	status: {
		type: String,
		enum: ['draft', 'open', 'closed'],
		default: 'draft'
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	articles: [ArticleSchema],
	views: {
		type: Number,
		default: 0
	}
} );

//journal 1 model
var JournalModel1 = mongoose.model( 'Journal1', JournalSchema );
//journal 2 model
var JournalModel2 = mongoose.model( 'Journal2', JournalSchema );

// Full text
JournalModel1.collection.ensureIndex(
	{
		'articles.title': 'text',
		'articles.body': 'text',
		'articles.categories': 'text',
		'articles.keywords': 'text'
	},{
		name: 'text_idx'
	},
	function( err ){
		if( err ){
			console.log( err );
		}
	}
);

JournalModel2.collection.ensureIndex(
	{
		'articles.title': 'text',
		'articles.body': 'text',
		'articles.categories': 'text',
		'articles.keywords': 'text'
	},{
		name: 'text_idx'
	},
	function( err ){
		if( err ){
			console.log( err );
		}
	}
);