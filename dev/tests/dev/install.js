/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

const chai = require( 'chai' );
const sinon = require( 'sinon' );
const git = require( '../../utils/git' );
const tools = require( '../../utils/tools' );
const installTask = require( '../../tasks/dev/tasks/install' );
const expect = chai.expect;
const path = require( 'path' );

describe( 'dev-install', () => {
	const moduleName = 'ckeditor5-core';
	const repositoryUrl = 'git@github.com:ckeditor/ckeditor5-core';
	const ckeditor5Path = '/path/to/ckeditor';
	const workspacePath = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspacePath );
	const spies = {};

	beforeEach( () => {
		spies.parseUrl = sinon.spy( git, 'parseRepositoryUrl' );
		spies.isDirectory = sinon.stub( tools, 'isDirectory' );
		spies.cloneRepository = sinon.stub( git, 'cloneRepository' );
		spies.linkDirectories = sinon.stub( tools, 'linkDirectories' );
		spies.updateJSON = sinon.stub( tools, 'updateJSONFile' );
		spies.npmInstall = sinon.stub( tools, 'npmInstall' );
		spies.checkout = sinon.stub( git, 'checkout' );
		spies.getGitUrlFromNpm = sinon.stub( tools, 'getGitUrlFromNpm' );
		spies.readPackageName = sinon.stub( tools, 'readPackageName' );
	} );

	afterEach( () => {
		Object.keys( spies ).forEach( ( spy ) => spies[ spy ].restore() );
	} );

	it( 'should use GitHub URL', () => {
		spies.isDirectory.onFirstCall().returns( false );
		spies.isDirectory.onSecondCall().returns( false );
		spies.isDirectory.onThirdCall().returns( true );

		installTask( ckeditor5Path, workspacePath, repositoryUrl );

		sinon.assert.calledTwice( spies.isDirectory );
		sinon.assert.calledOnce( spies.parseUrl );
		sinon.assert.calledWithExactly( spies.parseUrl, repositoryUrl );

		const urlInfo = spies.parseUrl.firstCall.returnValue;
		const repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		sinon.assert.calledWithExactly( spies.isDirectory.secondCall, repositoryPath );
		sinon.assert.calledOnce( spies.cloneRepository );
		sinon.assert.calledWithExactly( spies.cloneRepository, urlInfo, workspaceAbsolutePath );
		sinon.assert.calledOnce( spies.checkout );
		sinon.assert.calledWithExactly( spies.checkout, repositoryPath, urlInfo.branch );

		sinon.assert.calledOnce( spies.npmInstall );
		sinon.assert.calledWithExactly( spies.npmInstall, repositoryPath );

		const linkPath = path.join( ckeditor5Path, 'node_modules', urlInfo.name );

		sinon.assert.calledOnce( spies.linkDirectories );
		sinon.assert.calledWithExactly( spies.linkDirectories, repositoryPath, linkPath );

		const packageJsonPath = path.join( ckeditor5Path, 'package.json' );

		sinon.assert.calledOnce( spies.updateJSON );
		expect( spies.updateJSON.firstCall.args[ 0 ] ).to.equal( packageJsonPath );
		const updateFn = spies.updateJSON.firstCall.args[ 1 ];
		const json = updateFn( {} );
		expect( json.dependencies ).to.be.a( 'object' );
		expect( json.dependencies[ urlInfo.name ] ).to.equal( repositoryUrl );
	} );

	it( 'should use npm module name', () => {
		spies.isDirectory.onFirstCall().returns( false );
		spies.isDirectory.onSecondCall().returns( true );
		spies.getGitUrlFromNpm.returns( repositoryUrl );

		installTask( ckeditor5Path, workspacePath, moduleName );

		sinon.assert.calledTwice( spies.isDirectory );
		sinon.assert.calledTwice( spies.parseUrl );
		sinon.assert.calledWithExactly( spies.parseUrl.firstCall, moduleName );
		expect( spies.parseUrl.firstCall.returnValue ).to.equal( null );
		sinon.assert.calledOnce( spies.getGitUrlFromNpm );
		sinon.assert.calledWithExactly( spies.getGitUrlFromNpm, moduleName );
		sinon.assert.calledWithExactly( spies.parseUrl.secondCall, repositoryUrl );
		const urlInfo = spies.parseUrl.secondCall.returnValue;
		const repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		sinon.assert.calledWithExactly( spies.isDirectory.secondCall, repositoryPath );
		sinon.assert.notCalled( spies.cloneRepository );
		sinon.assert.calledOnce( spies.checkout );
		sinon.assert.calledWithExactly( spies.checkout, repositoryPath, urlInfo.branch );

		sinon.assert.calledOnce( spies.npmInstall );
		sinon.assert.calledWithExactly( spies.npmInstall, repositoryPath );

		const linkPath = path.join( ckeditor5Path, 'node_modules', urlInfo.name );

		sinon.assert.calledOnce( spies.linkDirectories );
		sinon.assert.calledWithExactly( spies.linkDirectories, repositoryPath, linkPath );

		const packageJsonPath = path.join( ckeditor5Path, 'package.json' );

		sinon.assert.calledOnce( spies.updateJSON );
		expect( spies.updateJSON.firstCall.args[ 0 ] ).to.equal( packageJsonPath );
		const updateFn = spies.updateJSON.firstCall.args[ 1 ];
		const json = updateFn( {} );
		expect( json.dependencies ).to.be.a( 'object' );
		expect( json.dependencies[ urlInfo.name ] ).to.equal( repositoryUrl );
	} );

	it( 'should use local relative path', () => {
		spies.isDirectory.onFirstCall().returns( true );
		spies.isDirectory.onSecondCall().returns( true );
		spies.readPackageName.returns( moduleName );

		installTask( ckeditor5Path, workspacePath, '../ckeditor5-core' );

		sinon.assert.calledTwice( spies.isDirectory );
		sinon.assert.calledOnce( spies.readPackageName );
	} );

	it( 'should use local absolute path if provided', () => {
		spies.isDirectory.onFirstCall().returns( true );
		spies.isDirectory.onSecondCall().returns( true );
		spies.readPackageName.returns( moduleName );

		installTask( ckeditor5Path, workspacePath, '/ckeditor5-core' );

		sinon.assert.calledTwice( spies.isDirectory );
		sinon.assert.calledOnce( spies.readPackageName );
	} );

	it( 'should throw an exception when invalid name is provided', () => {
		spies.isDirectory.onFirstCall().returns( false );
		spies.isDirectory.onSecondCall().returns( true );

		expect( () => {
			installTask( ckeditor5Path, workspacePath, moduleName );
		} ).to.throw();

		sinon.assert.calledOnce( spies.parseUrl );
		sinon.assert.calledWithExactly( spies.parseUrl.firstCall, moduleName );
		expect( spies.parseUrl.firstCall.returnValue ).to.equal( null );
	} );

	it( 'should throw an exception when package.json is not present', () => {
		spies.isDirectory.onFirstCall().returns( true );
		spies.isDirectory.onSecondCall().returns( true );
		spies.readPackageName.returns( null );

		expect( () => {
			installTask( ckeditor5Path, workspacePath, moduleName );
		} ).to.throw();

		sinon.assert.calledOnce( spies.parseUrl );
		sinon.assert.calledWithExactly( spies.parseUrl.firstCall, moduleName );
		expect( spies.parseUrl.firstCall.returnValue ).to.equal( null );
	} );
} );
