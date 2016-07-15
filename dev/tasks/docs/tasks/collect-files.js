/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const gulpWatch = require( 'gulp-watch' );
const gutil = require( 'gulp-util' );
const rename = require( 'gulp-rename' );
const merge = require( 'merge-stream' );
const path = require( 'path' );
const utils = require( '../../build/utils' );

/**
 * Collects all documentation files from CKEditor5 modules.
 * These files are just copied to particular directory.
 *
 * @returns {void}
 */
module.exports = ( config, sectionName, extensions ) => {
	const args = utils.parseArguments();

	const streams = utils.getPackages( config.ROOT_DIR )
		.map( ( dirPath ) => {
			const glob = path.join( dirPath, 'docs', sectionName, '**', `*.@(${ extensions.join( '|' )})` );

			// Use parent as a base so we get paths starting with 'ckeditor5-*/docs/*' in the stream.
			const baseDir = path.parse( dirPath ).dir;
			const opts = { base: baseDir, nodir: true };

			return gulp.src( glob, opts )
				.pipe( args.watch ? gulpWatch( glob, opts ) : utils.noop() )
				.pipe( rename( ( file ) => {
					const dirFrags = file.dirname.split( path.sep );
					const packageName = dirFrags[ 0 ].replace( /ckeditor5-/, '' );

					file.dirname = path.join( sectionName, packageName );
				} ) );
		} );

	// todo: stream below should be returned from this module
	// but when it is, --watch option blocks all flow (see line 35)

	merge.apply( null, streams )
		.pipe( utils.noop( ( file ) => {
			gutil.log( `Processing '${ gutil.colors.cyan( file.path ) }'...` );
		} ) )
		.pipe( gulp.dest( config.DOCUMENTATION_SOURCE_DIR ) );
};
