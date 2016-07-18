/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it */

const sinon = require( 'sinon' );
const tools = require( '../../utils/tools' );
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
const path = require( 'path' );

describe( 'dev-relink', () => {
	const task = require( '../../tasks/dev/tasks/relink' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const modulesPath = path.join( ckeditor5Path, 'node_modules' );
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	it( 'should link dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' ).returns( dirs );
		const linkStub = sinon.stub( tools, 'linkDirectories' );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		task( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		linkStub.restore();

		sinon.assert.calledTwice( linkStub );
		sinon.assert.calledWithExactly( linkStub.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ), path.join( modulesPath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( linkStub.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ), path.join( modulesPath, dirs[ 1 ] ) );
	} );

	it( 'should not link when no dependencies are found', () => {
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' );
		const linkStub = sinon.stub( tools, 'linkDirectories' );
		const json = {
			dependencies: {
				'other-plugin': '1.2.3'
			}
		};

		task( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		linkStub.restore();

		sinon.assert.notCalled( linkStub );
	} );

	it( 'should not link when no plugins in dev mode', () => {
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' ).returns( [] );
		const linkStub = sinon.stub( tools, 'linkDirectories' );
		const json = {
			dependencies: {
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		task( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		linkStub.restore();

		sinon.assert.notCalled( linkStub );
	} );

	it( 'should write error message when linking is unsuccessful', () => {
		const dirs = [ 'ckeditor5-core' ];
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' ).returns( dirs );
		const error = new Error( 'Error message.' );
		const linkStub = sinon.stub( tools, 'linkDirectories' ).throws( error );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};
		const writeErrorSpy = sinon.spy();
		const log = require( '../../utils/log' );
		log.configure( () => {}, writeErrorSpy );

		task( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		linkStub.restore();

		sinon.assert.calledOnce( linkStub );
		sinon.assert.calledOnce( writeErrorSpy );
		sinon.assert.calledWithExactly( writeErrorSpy, error );
	} );
} );
