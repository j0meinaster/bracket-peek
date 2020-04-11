// This extension is inspired and based on scss-scope-helper => https://github.com/ffpetrovic/scss-scope-helper/

const vscode = require('vscode');
const config = require('./config');
const log = require('./utils/log');
const findPairs = require('./find-pairs');
const _triggerPreview = require('./preview/trigger');
const { clearDecorations } = require('./preview/decorations');
const findClosestClosingInLine = require('./utils/closest-closing');
const { regexLastIndexOf } = require('./utils/indexOf');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	log('bracket-peek activated');

	config.init(context);
	
	let activeEditor = vscode.window.activeTextEditor;

	// Cached bracket / tag  pairs in active editor
	/*
	[{
		openingLineIndex,
		openingLineText,
		closingLineIndex,
		closingOffset,
	}]
	*/
	let pairs = [];

	let selectedClosingPosition = null;
	let hoveredClosingPosition = null;
	
	let pairFindTimeout;
	let scrollTimeout;

	// Text selected or carret moved
	vscode.window.onDidChangeTextEditorSelection(e => {
		hoveredClosingPosition = null; // Clear hover
		selectedClosingPosition = null; // Clear current selection

		if (e.selections.length !== 1) return clearDecorations(); // Invalid selection for bracket/tag preview

		if (!config.previewOnSelect) return clearDecorations();
			
		const selection = e.selections[0];
		const text = activeEditor.document.getText(selection); // Text of selection range
		
		if (text.length > 0) { // Selection is range
			const selectedLines = text.split('\n');

			// Search for closing bracket/tag in any line of selection, starting from the back
			for (let i = selectedLines.length - 1; i >= 0 && !selectedClosingPosition; i--){
				const lineText = selectedLines[i];
				
				const closingIndex = regexLastIndexOf(lineText, /}|<\//gm); // First index of '}' or '</'
				if (closingIndex != -1) {
					const closingLine = selection.start.line + i;
					const closingCharacter = i == 0 ? selection.start.character + closingIndex : closingIndex;
					selectedClosingPosition = new vscode.Position(closingLine, closingCharacter);
				}
			}
			
		} else { // Selection is carret => search for bracket/tag in line
			selectedClosingPosition = findClosestClosingInLine(selection.start);
		}

		triggerPreview();
	
	}, null, context.subscriptions);
	
	vscode.languages.registerHoverProvider('*', {
		provideHover(document, position, token) {
			token.onCancellationRequested(() => {
				log('CANCEL');
				triggerPreview();
			});

			if (!config.previewOnHover) return;

			hoveredClosingPosition = findClosestClosingInLine(position);
			
			const preview = triggerPreview();
			
			if (config.previewAsHover && preview.hover)
				return preview.hover;
		}
	});

	// Update decoration on scroll
	vscode.window.onDidChangeTextEditorVisibleRanges(e => {
		clearDecorations(); // Clear decoration while scrolling because decoration also scrolls
		hoveredClosingPosition = null; // Clear hover
		
		// If selection is active maybe update decoration line or hide it if scrolled in view port => use timeout to avoid flickering
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(triggerPreview, 300);

	}, null, context.subscriptions);

	// On editor change
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) triggerFindPairs();

	}, null, context.subscriptions);

	// On text change
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) triggerFindPairs();
	}, null, context.subscriptions);

	// On startup
	if (activeEditor) {
		triggerFindPairs();
	}


	function triggerFindPairs() {
		clearTimeout(pairFindTimeout);
		pairFindTimeout = setTimeout(() => {
			pairs = findPairs()
			triggerPreview();
		}, 500);
	}

	function triggerPreview() {
		// Clear or create preview depending on hovered or selected position
		return _triggerPreview(pairs, hoveredClosingPosition, selectedClosingPosition);
	}
}


// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}