/* jshint node: true */

'use strict';

const gulp = require( 'gulp' );

const fs = require( 'fs' );
const json = JSON.parse( fs.readFileSync( './package.json' ) );

// Check if gulp file is run in dev environment. It will be false when this repository is included as dependency of other project.
const isDev = !json._id;

const config = {
	ROOT_DIR: '.',
	PACKAGES_DIR: isDev ? '.' : '../..',
	BUILD_DIR: isDev ? 'build' : '../../build',
	BUNDLE_DIR: isDev ? 'bundle' : '../../bundle',
	WORKSPACE_DIR: '..',

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

require( './dev/tasks/build/tasks' )( config ).register();
require( './dev/tasks/bundle/tasks' )( config );

if ( isDev ) {
	require( './dev/tasks/dev/tasks' )( config ).register();
	require( './dev/tasks/lint/tasks' )( config ).register();
	require( './dev/tasks/test/tasks' )( config ).register();
	require( './dev/tasks/docs/tasks' )( config ).register();

	gulp.task( 'pre-commit', [ 'lint-staged' ] );
}

gulp.task( 'default', [ 'build' ] );
