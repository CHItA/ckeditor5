/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const gulpWatch = require( 'gulp-watch' );
const merge = require( 'merge-stream' );
const path = require( 'path' );
const utils = require( '../../build/utils' );

/**
 * Collects all documentation files from CKEditor5 modules. These files are returned as Stream.
 *
 * @param {Object} config
 * @param {string} sectionConfigKey Name of key from `config` which represents section
 * which should be parsed.
 * @param {boolean} watch Whether to watch the files.
 * @returns {Stream}
 */
module.exports = ( config, sectionConfigKey, watch ) => {
	const extensions = config.DOCUMENTATION[ sectionConfigKey ].EXTENSIONS;
	const directory = config.DOCUMENTATION[ sectionConfigKey ].DIRECTORY;

	if ( !extensions || !directory ) {
		throw new Error( `Config contains invalid value of "EXTENSIONS" or "DIRECTORY" value for key "${ sectionConfigKey }".` );
	}

	const streams = utils.getPackages( config.ROOT_DIR )
		.map( ( dirPath ) => {
			// Use parent as a base so we get paths starting with 'ckeditor5-*/docs/*' in the stream.
			const baseDir = path.parse( dirPath ).dir;
			const opts = { base: baseDir, nodir: true };
			const glob = path.join( dirPath, 'docs', directory, '**', `*.@(${ extensions.join( '|' )})` );

			return gulp.src( glob, opts )
				.pipe( watch ? gulpWatch( glob, opts ) : utils.noop() );
		} );

	return merge.apply( null, streams );
};
