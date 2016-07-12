/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs-extra' );
const path = require( 'path' );
const glob = require( 'glob' );
const utils = require( '../../build/utils' );

const detailsRegexp = /ckeditor5-([A-Z0-9-]+)/i;

/**
 * Collects all documentation files from CKEditor5 modules.
 * These files are just copied to particular directory.
 *
 * All FileSystem functions are running as synchronous.
 */
module.exports = ( config, sectionName, extensions ) => {
	const docPaths = utils.getPackages( config.ROOT_DIR )
		.map( ( row ) => {
			return path.join( row, 'docs', sectionName, '**', `*.@(${ extensions.join( '|' )})` );
		} );

	for ( const singlePath of docPaths ) {
		for ( const sourcePath of glob.sync( singlePath ) ) {
			const packageName = detailsRegexp.exec( sourcePath )[ 1 ];
			const fileName = path.basename( sourcePath );
			const copyNewPath = path.join( config.DOCUMENTATION_SOURCE_DIR, sectionName, packageName, fileName );

			fs.copySync( sourcePath, copyNewPath );
		}
	}
};
