'use strict';

angular.module( 'journal2' )
	.factory('Journal2', ['$resource',
		function($resource) {
			return $resource('api/journal2/:journal2Id', {
				journal2Id: '@_id',
				articleNo:'@articleNo',
				info: '@info'
			}, {
				update: {
					method: 'PUT'
				},
				query: {
					method: 'GET',
					isArray: true,
					responseType: 'json'
				}
			});
		}])
	.factory('Authors', ['$http', function( $http ){
		return {
			query: function () {
				return $http.get('/api/authors')
					.success(function (authors) {
						return authors;
					})
					.error(function (err) {
						return err;
					});
			}
		};
	}])
	.factory('Categories', ['$http', '_', 
		function ($http, _) {
			var transform = function (data) {
				return _.map(data, function (cat) {
					return {
						text: cat._id,
						weight: cat.count,
						link: '#!/journal2?category='+ _.trim(cat._id)
					};
				});	
			};
			
			return {
				top: function (done, err) {
					$http.get('/api/journal2/categories')
						.success(function (data) {
							done(transform(data));
						})
						.error(err);
				}
			};
		}])
	.factory( 'articlesSanitizer', ['_', function (_) {
		function sanitizeArticles( articles ){
			var arts = _.filter( articles, function( art ){
				if( !art || !( 'title' in art ) || _.trim( art.title.en ) === '' && _.trim( art.content.en ) === '' ) return false;
				else return true;
			});

			return arts;
		}

		return function( articles ){
			return sanitizeArticles( articles );
		};
	}])
	.factory( 'DeleteArticle2', ['$http',
		function( $http ){
			return {
				query: function( journalId, articleId, cbf ){
					$http.delete( 'api/article2', { params: { article2Id: articleId, journal2Id: journalId } } )
					.success( function( data ){
						if( cbf ){
							cbf( data ); //callback for
						}
						return data;
					} )
					.error( function( err ){
						return err;
					} );
				}
			};
		}
	] )

	.factory('Journal2FormSchema',
	['$http', 'userAutocomplete', function( $http, userAutocomplete ){
		return {
			schema: {
				type: 'object',
				properties: {
					featured: {
						type: 'boolean',
						title: 'Is featured?'
					},
                    journallanguage: {
                        type: 'array',
                        title: 'Languages available for this Journal',
                        items: {type: 'string', enum: ['English', 'Urdu']},
                        validationMessage: 'Please select at least one Language',
                        required: true
                    },					
					month: {
						type: 'object',
						title: 'Month',
						required: 'true',
						items: {
							type: 'string',
							enum: ['January', 'February', 'March', 'April', 'May', 'June',
									'July', 'August', 'September', 'October', 'November', 'December'
								]
						}
					},
					year: {
						type: 'string'
					},
					content: {
						type: 'object',
						title: 'Articles',
						properties: {
							title: {
								type: 'object',
								title: 'Title',
								properties: {
									en: {
										type: 'string',
										title: 'English title',
										minLength: 3,
										validationMessage: 'Please enter title.'
									},
									ur: {type: 'string', title: 'Urdu title'}
								},
								required: 'en'
							},
							body: {
								type: 'object',
								title: 'Body',
								properties: {
									en: {
										type: 'string',
										title: 'English content',
										minLength: 3,
										validationMessage: 'Please enter content.'
									},
									ur: {type: 'string', title: 'Urdu content'}
								},
								required: 'en'
							},
							categories: {
								type: 'array',
								title: 'Categories',
								items: { type: 'string', title: 'Category' }
							},
							keywords: {
								type: 'array',
								title: 'Keywords',
								items: { type: 'string', title: 'Keyword' }
							},
							status: {
								type: 'string',
								title: 'Status',
								enum: ['draft', 'open', 'closed']
							},
							author: {
								type: 'string',
								title: 'Author',
								format: 'uiselect',
								items: [],
								required: true,
								validationMessage: 'Author should be set.'
							}

						}
					},
					status: {
						type: 'string',
						title: 'Status',
						enum: ['draft', 'open', 'closed']
					}
				}
			},
			form: [
				'featured',
				'journallanguage',
				'month',
				'year',
				{
					key: 'body',
					title: 'Articles',
					items: [
						'body.title.en',
						'body.title.ur',
						{ key: 'body.content.en', type: 'textarea'},
						{ key: 'body.content.ur', type: 'textarea'}
						]
				},
				{
					key: 'author',
					placeholder: 'You may enable the original author to edit this article',
					options: {
						uiClass: 'short_select',
						async: {
							refreshDelay: 100,
							call: function (schema, options, search) {
								return userAutocomplete(search);
							}
						}
					}
				},
				{
					key: 'status',
					type: 'select',
					titleMap: [
						{ value: 'draft', name: 'Draft' },
						{ value: 'open', name: 'Open' },
						{ value: 'closed', name: 'Closed' }
					]
				},
				{
					type: 'submit',
					title: 'Save'
				}
			]
		};
	}])
;
