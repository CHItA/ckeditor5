/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const git = require( '../../../utils/git' );

/**
 * Pushes changes of current branch in repository to default origin.
 *
 * Example:
 *
 *		gulp exec --task git-push
 *
 * @param {String} workdir
 */
module.exports = function executeGitPush( workdir ) {
	git.push( workdir );
};
