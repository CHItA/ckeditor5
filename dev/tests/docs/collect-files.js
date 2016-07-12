/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const fs = require( 'fs-extra' );
const glob = require( 'glob' );
const utils = require( '../../tasks/build/utils' );

describe( 'Collect-files', () => {
	const collectFiles = require( '../../tasks/docs/tasks/collect-files' );
	const config = {
		ROOT_DIR: '.',
		DOCUMENTATION_SOURCE_DIR: '.docs'
	};
	let sandbox,
		getPackagesStub,
		globSyncStub,
		copySyncStub;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
		copySyncStub = sandbox.stub( fs, 'copySync' );

		getPackagesStub = sandbox.stub( utils, 'getPackages', () => {
			return [
				'/cksource/ckeditor5-enter',
				'/cksource/ckeditor5-ui',
			];
		} );

		globSyncStub = sandbox.stub( glob, 'sync' )
			.onFirstCall().returns( [
				'/cksource/ckeditor5-enter/docs/amazing-feature.html',
				'/cksource/ckeditor5-enter/docs/amazing-feature.js'
			] )
			.onSecondCall().returns( [
				'/cksource/ckeditor5-ui/docs/bold-icon.md',
				'/cksource/ckeditor5-ui/docs/italic-icon.md'
			] );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'copies matched files into single directory', () => {
		collectFiles( config, 'testSection', [ 'html', 'js' ] );

		expect( getPackagesStub.calledOnce ).to.equal( true );
		expect( getPackagesStub.firstCall.args[ 0 ] ).to.equal( '.' );
		expect( copySyncStub.callCount ).to.equal( 4 );
		expect( copySyncStub.getCall( 0 ).args[ 0 ] ).to.equal( '/cksource/ckeditor5-enter/docs/amazing-feature.html' );
		expect( copySyncStub.getCall( 0 ).args[ 1 ] ).to.equal( '.docs/testSection/enter/amazing-feature.html' );
		expect( copySyncStub.getCall( 1 ).args[ 0 ] ).to.equal( '/cksource/ckeditor5-enter/docs/amazing-feature.js' );
		expect( copySyncStub.getCall( 1 ).args[ 1 ] ).to.equal( '.docs/testSection/enter/amazing-feature.js' );
		expect( copySyncStub.getCall( 2 ).args[ 0 ] ).to.equal( '/cksource/ckeditor5-ui/docs/bold-icon.md' );
		expect( copySyncStub.getCall( 2 ).args[ 1 ] ).to.equal( '.docs/testSection/ui/bold-icon.md' );
		expect( copySyncStub.getCall( 3 ).args[ 0 ] ).to.equal( '/cksource/ckeditor5-ui/docs/italic-icon.md' );
		expect( copySyncStub.getCall( 3 ).args[ 1 ] ).to.equal( '.docs/testSection/ui/italic-icon.md' );
	} );
} );
