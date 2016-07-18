/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const git = require( '../../../utils/git' );
const tools = require( '../../../utils/tools' );
const path = require( 'path' );
const log = require( '../../../utils/log' );

/**
 * This tasks install specified package in development mode. It can be executed by typing:
 * 		grunt dev-install --package <git_hub_url|npm_name|path_on_disk>
 *
 *
 * It performs following steps:
 * 1. If GitHub URL is provided - clones the repository.
 * 2. If NPM module name is provided - gets GitHub URL from NPM and clones the repository.
 * 3. If path on disk is provided - it is used directly.
 * 4. Runs `npm install` in package repository.
 * 5. Links package directory into `ckeditor5/node_modules/`.
 * 6. Adds dependency to `ckeditor5/package.json`.
 *
 * @param {String} ckeditor5Path Absolute path to `ckeditor5` repository.
 * @param {String} workspaceRoot Relative path to workspace root directory.
 * @param {String} name Name of the NPM package or GitHub URL.
 */
module.exports = ( ckeditor5Path, workspaceRoot, name ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	let repositoryPath;
	let dependency;
	let urlInfo;

	// First check if name is local path to repository.
	repositoryPath = path.isAbsolute( name ) ? name : path.resolve( name );

	if ( tools.isDirectory( repositoryPath ) ) {
		const packageName = tools.readPackageName( repositoryPath );

		if ( packageName ) {
			log.out( `Plugin located at ${ repositoryPath }.` );
			urlInfo = {
				name: packageName
			};

			dependency = repositoryPath;
		}
	}

	// Check if name is repository URL.
	if ( !urlInfo ) {
		urlInfo = git.parseRepositoryUrl( name );
		dependency = name;
	}

	// Check if name is NPM package.
	if ( !urlInfo ) {
		log.out( `Not a GitHub URL. Trying to get GitHub URL from NPM package...` );
		const url = tools.getGitUrlFromNpm( name );

		if ( url ) {
			urlInfo = git.parseRepositoryUrl( url );
			dependency  = url;
		}
	}

	if ( urlInfo ) {
		repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		if ( tools.isDirectory( repositoryPath ) ) {
			log.out( `Directory ${ repositoryPath } already exists.` );
		} else {
			log.out( `Cloning ${ urlInfo.name } into ${ repositoryPath }...` );
			git.cloneRepository( urlInfo, workspaceAbsolutePath );
		}

		// Checkout to specified branch if one is provided.
		if ( urlInfo.branch ) {
			log.out( `Checking ${ urlInfo.name } to ${ urlInfo.branch }...` );
			git.checkout( repositoryPath, urlInfo.branch );
		}

		// Run `npm install` in new repository.
		log.out( `Running "npm install" in ${ urlInfo.name }...` );
		tools.npmInstall( repositoryPath );

		const linkPath = path.join( ckeditor5Path, 'node_modules', urlInfo.name );

		log.out( `Linking ${ linkPath } to ${ repositoryPath }...` );
		tools.linkDirectories( repositoryPath, linkPath );

		log.out( `Adding ${ urlInfo.name } dependency to CKEditor5 package.json...` );
		tools.updateJSONFile( path.join( ckeditor5Path, 'package.json' ), ( json ) => {
			json.dependencies = json.dependencies || {};
			json.dependencies[ urlInfo.name ] = dependency;
			json.dependencies = tools.sortObject( json.dependencies );

			return json;
		} );
	} else {
		throw new Error( 'Please provide valid GitHub URL, NPM module name or path.' );
	}
};
