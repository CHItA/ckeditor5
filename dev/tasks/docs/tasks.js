/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const fs = require( 'fs-extra' );
const collectFiles = require( './tasks/collect-files' );
const docsBuilder = require( 'docs-builder' );

module.exports = ( config ) => {
	const tasks = {
		buildDocs( cb ) {
			// Absolute path to root directory of project.
			const projectRoot = path.join( __dirname, '..', '..', '..' );
			// Absolute path to "esnext" build of project.
			const esnextBuildPath = path.join( projectRoot, config.BUILD_DIR, 'esnext' );
			// Absolute path to documentation sources.
			const absoluteDocsSourcePath = path.join( projectRoot, config.DOCUMENTATION_SOURCE_DIR );

			const builderConfig = {
				name: 'CKEditor5 Documentation',
				disqusUrl: 'demo-test-pomek',
				rootDirectory: absoluteDocsSourcePath + path.sep,
				destinationDirectory: path.join( projectRoot, config.DOCUMENTATION_DIR ),
				guideFiles: path.join( 'guides', '**', '*.md' ),
				sampleFiles: path.join( 'samples', '**', '*.md' ),
				indexFile: path.join( projectRoot, 'docs', 'index.pug' ),
				jsDocFiles: [
					path.join( projectRoot, 'README.md' ),
					path.join( esnextBuildPath, '**', '*.@(js|jsdoc)' ),
					'!' + path.join( esnextBuildPath, 'ckeditor5', '*', 'lib', '**', '*' )
				],
				cdnFiles: {
					js: [
						'https://rawgit.com/pomek/5def0512e6096893c1ca771d26d0b488/raw/9cc7be7a0c59f7e0bd092bcce95ae688813151a7/ckeditor.js'
					],
					css: [
						'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
						'https://rawgit.com/pomek/0bc4cb6a2b1bcdadbf69fec0dbf7cde7/raw/439c96e8a932f79e13e9080b45af0fa212da7e00/ckeditor.css'
					]
				}
			};

			docsBuilder( builderConfig )
				.then( cb );
		},

		collectGuideFiles() {
			return collectFiles( config, 'guides', [ 'md' ] );
		},

		collectSampleFiles() {
			return collectFiles( config, 'samples', [ 'md', 'html', 'js' ] );
		},

		removeCollectDirectory() {
			fs.removeSync( config.DOCUMENTATION_SOURCE_DIR );
		},

		removeCollectedSamples() {
			fs.removeSync( path.join( config.DOCUMENTATION_SOURCE_DIR, 'samples' ) );
		},

		removeCollectedGuides() {
			fs.removeSync( path.join( config.DOCUMENTATION_SOURCE_DIR, 'guides' ) );
		},

		register() {
			gulp.task( 'docs', [ 'docs:collect:guides', 'docs:collect:samples', 'build:js:esnext' ], tasks.buildDocs );
			gulp.task( 'docs:collect:guides', [ 'docs:clean:guides' ], tasks.collectGuideFiles );
			gulp.task( 'docs:collect:samples', [ 'docs:clean:samples' ], tasks.collectSampleFiles );
			gulp.task( 'docs:clean:guides', tasks.removeCollectedGuides );
			gulp.task( 'docs:clean:samples', tasks.removeCollectedSamples );
			gulp.task( 'docs:clean', tasks.removeCollectDirectory );
		}
	};

	return tasks;
};
