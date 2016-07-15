/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const fs = require( 'fs-extra' );
const gutil = require( 'gulp-util' );
const rename = require( 'gulp-rename' );
const collectFiles = require( './tasks/collect-files' );
const docsBuilder = require( 'docs-builder' );
const utils = require( '../build/utils' );

module.exports = ( config ) => {
	const tasks = {
		buildDocs( cb ) {
			// Absolute path to root directory of project.
			const projectRoot = path.join( __dirname, '..', '..', '..' );
			// Absolute path to "esnext" build of project.
			const esnextBuildPath = path.join( projectRoot, config.BUILD_DIR, 'esnext' );
			// Absolute path to documentation sources.
			const absoluteDocsSourcePath = path.join( projectRoot, config.DOCUMENTATION.SOURCE_DIR );

			const builderConfig = {
				name: 'CKEditor5 Documentation',
				disqusUrl: 'demo-test-pomek',
				rootDirectory: absoluteDocsSourcePath + path.sep,
				destinationDirectory: path.join( projectRoot, config.DOCUMENTATION.DESTINATION_DIR ),
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

		collectFiles( sectionConfigKey ) {
			return collectFiles( config, sectionConfigKey, false )
				.pipe( utils.noop( ( file ) => {
					gutil.log( `Processing '${ gutil.colors.cyan( file.path ) }'...` );
				} ) )
				.pipe( rename( ( file ) => {
					const dirFrags = file.dirname.split( path.sep );
					const packageName = dirFrags[ 0 ].replace( /ckeditor5-/, '' );

					if ( !dirFrags[ 0 ].match( /^ckeditor5-/ ) ) {
						throw new Error( 'Path should start with directory with prefix "ckeditor5-".' );
					}

					const newDirFrags = [
						config.DOCUMENTATION[sectionConfigKey].DIRECTORY,
						packageName
					];

					file.dirname = path.join.apply( null, newDirFrags.concat( dirFrags.slice( 3 ) ) );
				} ) )
				.pipe( gulp.dest( config.DOCUMENTATION.SOURCE_DIR ) );
		},

		register() {
			gulp.task( 'docs', [ 'docs:collect:guides', 'docs:collect:samples', 'build:js:esnext' ], tasks.buildDocs );

			gulp.task( 'docs:collect:guides', [ 'docs:clean:guides' ], () => {
				return tasks.collectFiles( 'GUIDES' );
			} );

			gulp.task( 'docs:collect:samples', [ 'docs:clean:samples' ], () => {
				return tasks.collectFiles( 'SAMPLES' );
			} );

			gulp.task( 'docs:clean:guides', ( cb ) => {
				const guidePath = path.join( config.DOCUMENTATION.SOURCE_DIR, config.DOCUMENTATION.GUIDES.DIRECTORY );
				fs.remove( guidePath, cb );
			} );

			gulp.task( 'docs:clean:samples', ( cb ) => {
				const samplePath = path.join( config.DOCUMENTATION.SOURCE_DIR, config.DOCUMENTATION.SAMPLES.DIRECTORY );

				fs.remove( samplePath, cb );
			} );

			gulp.task( 'docs:clean', ( cb ) => {
				fs.remove( config.DOCUMENTATION.SOURCE_DIR, cb );
			} );
		}
	};

	return tasks;
};
