/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const path = require( 'path' );
const Vinyl = require( 'vinyl' );

describe( 'build-utils', () => {
	const utils = require( '../../tasks/docs/utils' );
	const buildUtils = require( '../../tasks/build/utils' );
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'renameDocumentationFiles', () => {
		const config = {
			DOCUMENTATION: {
				GUIDES: {
					DIRECTORY: 'guides'
				}
			}
		};

		it( 'should move guide files to correct directories', ( done ) => {
			const rename = utils.renameDocumentationFiles( config, 'GUIDES' );

			rename.pipe(
				buildUtils.noop( ( data ) => {
					expect( data.path ).to.equal( path.normalize( 'guides/basic-styles/strong.md' ) );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: './',
				path: path.normalize( 'ckeditor5-basic-styles/docs/guides/strong.md' ),
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should move guide files to correct directories with nested path', ( done ) => {
			const rename = utils.renameDocumentationFiles( config, 'GUIDES' );

			rename.pipe(
				buildUtils.noop( ( data ) => {
					expect( data.path ).to.equal( path.normalize( 'guides/basic-styles/strong.md' ) );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: './',
				path: path.normalize( 'ckeditor5-basic-styles/docs/guides/strong.md' ),
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should throw error when wrong path provided 1', () => {
			const rename = utils.renameDocumentationFiles( config, 'GUIDES' );

			expect( () => {
				rename.write( new Vinyl( {
					cwd: './',
					path: 'plugin/src/file.js',
					contents: new Buffer( '' )
				} ) );
			} ).to.throw( Error );
		} );
	} );
} );
