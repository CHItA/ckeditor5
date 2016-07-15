/* jshint node: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	BUILD_DIR: 'build',
	BUNDLE_DIR: 'bundle',
	WORKSPACE_DIR: '..',

	DOCUMENTATION: {
		SOURCE_DIR: '.docs',
		DESTINATION_DIR: 'build/docs',
		SAMPLES: {
			EXTENSIONS: [ 'md', 'html', 'js' ],
			DIRECTORY: 'samples'
		},
		GUIDES: {
			EXTENSIONS: [ 'md' ],
			DIRECTORY: 'guides'
		}
	},

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

require( './dev/tasks/build/tasks' )( config ).register();
require( './dev/tasks/bundle/tasks' )( config ).register();
require( './dev/tasks/dev/tasks' )( config ).register();
require( './dev/tasks/lint/tasks' )( config ).register();
require( './dev/tasks/test/tasks' )( config ).register();
require( './dev/tasks/docs/tasks' )( config ).register();
require( './dev/tasks/exec/tasks' )( config ).register();

gulp.task( 'default', [ 'build' ] );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
