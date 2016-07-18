/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const rename = require( 'gulp-rename' );

const utils = {
	/**
	 * @param {Object} config
	 * @param {String} sectionConfigKey
	 * @returns {Stream}
	 */
	renameDocumentationFiles( config, sectionConfigKey ) {
		return rename( ( file ) => {
			const dirFrags = file.dirname.split( path.sep );
			const packageName = dirFrags[ 0 ].replace( /ckeditor5-/, '' );

			if ( !dirFrags[ 0 ].match( /^ckeditor5-/ ) ) {
				throw new Error( 'Path should start with directory with prefix "ckeditor5-".' );
			}

			const newDirFrags = [
				config.DOCUMENTATION[ sectionConfigKey ].DIRECTORY,
				packageName
			];

			file.dirname = path.join.apply( null, newDirFrags.concat( dirFrags.slice( 3 ) ) );
		} );
	}
};

module.exports = utils;
