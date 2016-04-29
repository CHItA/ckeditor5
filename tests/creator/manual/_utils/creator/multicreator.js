/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import StandardCreator from '/ckeditor5/creator/standardcreator.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import Editable from '/ckeditor5/editable.js';

import { createEditableUI, createEditorUI } from '/ckeditor5/ui/creator-utils.js';

import BoxedEditorUI from '/tests/ckeditor5/_utils/ui/boxededitorui/boxededitorui.js';
import BoxedEditorUIView from '/tests/ckeditor5/_utils/ui/boxededitorui/boxededitoruiview.js';
import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import InlineEditableUIView from '/tests/ckeditor5/_utils/ui/editableui/inline/inlineeditableuiview.js';
import Model from '/ckeditor5/ui/model.js';
import Toolbar from '/ckeditor5/ui/bindings/toolbar.js';
import ToolbarView from '/ckeditor5/ui/toolbar/toolbarview.js';
import { imitateFeatures, imitateDestroyFeatures } from '../imitatefeatures.js';

export default class MultiCreator extends StandardCreator {
	constructor( editor ) {
		super( editor, new HtmlDataProcessor() );

		// Engine.
		this._createEditables();

		// UI.
		createEditorUI( editor, BoxedEditorUI, BoxedEditorUIView );

		// Data controller mock.
		this._mockDataController();
	}

	create() {
		const editor = this.editor;

		// Features mock.
		imitateFeatures( editor );

		// UI.
		this._createToolbar();

		for ( let editable of editor.editables ) {
			editor.ui.add( 'editable', createEditableUI( editor, editable, EditableUI, InlineEditableUIView ) );
		}

		editor.elements.forEach( ( element ) => {
			this._replaceElement( element, null );
		} );

		// Init.
		return super.create()
			.then( () => editor.ui.init() )
			// We'll be able to do that much earlier once the loading will be done to the document model,
			// rather than straight to the editable.
			.then( () => this.loadDataFromEditorElements() );
	}

	destroy() {
		imitateDestroyFeatures();

		this.updateEditorElements();

		super.destroy();

		this.editor.ui.destroy();
	}

	_createEditables() {
		const editor = this.editor;

		editor.elements.forEach( ( editorElement, editableName ) => {
			const editable = new Editable( editor, editableName );

			editor.editables.add( editable );
			editor.document.createRoot( editableName, '$root' );
		} );
	}

	_createToolbar() {
		if ( !this.editor.config.toolbar ) {
			return;
		}

		const editor = this.editor;
		const toolbarModel = new Model();
		const toolbar = new Toolbar( toolbarModel, new ToolbarView( toolbarModel, editor.locale ), editor );

		toolbar.addButtons( editor.config.toolbar );

		this.editor.ui.add( 'top', toolbar );
	}

	_mockDataController() {
		const editor = this.editor;

		editor.data.get = ( rootName ) => {
			return editor.editables.get( rootName ).domElement.innerHTML + `<p>getData( '${ rootName }' )</p>`;
		};

		this.editor.data.set = ( rootName, data ) => {
			editor.editables.get( rootName ).domElement.innerHTML = data + `<p>setData( '${ rootName }' )</p>`;
		};
	}
}
