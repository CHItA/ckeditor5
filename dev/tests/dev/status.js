/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it */

const sinon = require( 'sinon' );
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
const git = require( '../../utils/git' );
const path = require( 'path' );
const chai = require( 'chai' );
const expect = chai.expect;
const gulp = require( 'gulp' );

describe( 'dev-status', () => {
	const statusTask = require( '../../tasks/dev/tasks/status' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	it( 'should show status of dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' ).returns( dirs );
		const statusStub = sinon.stub( git, 'getStatus' );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		statusTask( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.calledTwice( statusStub );
		sinon.assert.calledWithExactly( statusStub.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( statusStub.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
	} );

	it( 'should not get status when no dependencies are found', () => {
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' );
		const statusStub = sinon.stub( git, 'getStatus' );
		const json = {
			dependencies: {
				'other-plugin': '1.2.3'
			}
		};

		statusTask( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.notCalled( statusStub );
	} );

	it( 'should not get status when no plugins in dev mode', () => {
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' ).returns( [] );
		const statusStub = sinon.stub( git, 'getStatus' );
		const json = {
			dependencies: {
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		statusTask( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.notCalled( statusStub );
	} );

	it( 'should write error message when getStatus is unsuccessful', () => {
		const dirs = [ 'ckeditor5-core' ];
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const getDirectoriesStub = sinon.stub( ckeditor5Dirs, 'getDirectories' ).returns( dirs );
		const error = new Error( 'Error message.' );
		const statusStub = sinon.stub( git, 'getStatus' ).throws( error );
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

		statusTask( ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.calledOnce( statusStub );
		sinon.assert.calledOnce( writeErrorSpy );
		sinon.assert.calledWithExactly( writeErrorSpy, error );
	} );
} );

describe( 'gulp task status', () => {
	const tasks = gulp.tasks;

	it( 'should be available', () => {
		expect( tasks ).to.have.property( 'status' );
		expect( tasks.status.fn ).to.be.a( 'function' );
	} );

	it( 'should have an alias', () => {
		expect( tasks ).to.have.property( 'st' );
		expect( tasks.st.fn ).to.be.a( 'function' );

		expect( tasks.st.fn ).to.equal( tasks.status.fn );
	} );
} );
