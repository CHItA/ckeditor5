/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const jsdoc = require( 'gulp-jsdoc3' );
const path = require( 'path' );
const collectFiles = require( './tasks/collect-files' );

module.exports = ( config ) => {
	const tasks = {
		buildDocs( cb ) {
			const esnextBuildPath = path.join( config.ROOT_DIR, config.BUILD_DIR, 'esnext' );
			const jsDocConfig = {
				opts: {
					encoding: 'utf8',
					destination: path.join( config.BUILD_DIR, 'docs' ),
					recurse: true,
					access: 'all'
				},
				plugins: [
					'node_modules/jsdoc/plugins/markdown',
					'dev/tasks/docs/plugins/comment-fixer'
				]
			};

			const patterns = [
				'README.md',
				// Add all js and jsdoc files, including tests (which can contain utils).
				path.join( esnextBuildPath, '**', '*.@(js|jsdoc)' ),
				// Filter out libs.
				'!' + path.join( esnextBuildPath, 'ckeditor5', '*', 'lib', '**', '*' )
			];

			gulp.src( patterns, { read: false } )
				.pipe( jsdoc( jsDocConfig, cb ) );
		},

		collectGuideFiles() {
			return collectFiles( config, 'guides', [ 'md' ] );
		},

		collectSampleFiles() {
			return collectFiles( config, 'samples', [ 'md', 'html', 'js' ] );
		},

		register() {
			gulp.task( 'docs', [ 'build:js:esnext' ], tasks.buildDocs );
			gulp.task( 'docs:prepare:guides', tasks.collectGuideFiles );
			gulp.task( 'docs:prepare:samples', tasks.collectSampleFiles );
		}
	};

	return tasks;
};
