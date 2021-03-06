/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';

const obj = {
	method() {}
};
const origMethod = obj.method;
let spy;

testUtils.createSinonSandbox();

describe( 'testUtils.createSinonSandbox()', () => {
	it( 'creates a sandbox', () => {
		expect( testUtils.sinon ).to.be.an( 'object' );
		expect( testUtils.sinon ).to.have.property( 'spy' );
	} );

	// This test is needed for the following one.
	it( 'really works', () => {
		spy = testUtils.sinon.spy( obj, 'method' );

		expect( obj ).to.have.property( 'method', spy );
	} );

	it( 'restores spies after each test', () => {
		obj.method();

		sinon.assert.notCalled( spy );
		expect( obj ).to.have.property( 'method', origMethod );
	} );
} );
