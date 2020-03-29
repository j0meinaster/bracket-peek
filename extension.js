// This extension is inspired and based on scss-scope-helper => https://github.com/ffpetrovic/scss-scope-helper/


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let logging = false;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	logging = vscode.workspace.getConfiguration('bracket-peek').debugMode;
	if (logging) { console.log('bracket-peek activated'); }
	
	// Decoration styles
	const decorationType = vscode.window.createTextEditorDecorationType({
		light: {
			after: {
				color: 'rgba(0,0,0,.3)'
			}
		},
		dark: {
			after: {
				color: '#5f5f5f',
			},
		},
		textDecoration: "white-space: pre;"
	});
	
	let activeEditor = vscode.window.activeTextEditor;
	let decorations = null;

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

	vscode.workspace.onDidChangeConfiguration((cfg) =>
	{
		if (cfg.affectsConfiguration('bracket-peek.debugMode')) {
			logging = vscode.workspace.getConfiguration('bracket-peek').debugMode;
		}
	}, null, context.subscriptions);

	// Text selected or carret moved
	vscode.window.onDidChangeTextEditorSelection(e => {
		hoveredClosingPosition = null; // Clear hover
		selectedClosingPosition = null; // Clear current selection

		if (e.selections.length !== 1) return clearDecorations(); // Invalid selection for bracket/tag preview

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
				if (logging) { console.log('CANCEL'); }
				triggerPreview();
			});

			hoveredClosingPosition = findClosestClosingInLine(position);

			triggerPreview();
		}
	});

	function findClosestClosingInLine(pos) {
		const posBefore = new vscode.Position(pos.line, Math.max(0, pos.character - 1));

		// Search bracket near carret first
		if (editorHasTextAt('}', pos) || editorHasTextAt('</', pos)) { // Closing bracket / tag after carret
			return pos;

		} else if (editorHasTextAt('}', posBefore) || editorHasTextAt('</', posBefore)) { // Closing bracket / tag before carret
			return posBefore;

		} else { // Search for next (preferred) or previous bracket in line
			const lineText = activeEditor.document.lineAt(pos.line).text;
			const nextText = lineText.substring(pos.character);
			const previousText = lineText.substring(0, Math.max(pos.character - 1, 0));

			const nextIndex = regexIndexOf(nextText, /}|<\//gm); // First index of '}' or '</'
			const previousIndex = regexLastIndexOf(previousText, /}|<\//gm); // Last index of '}' or '</'

			if (nextIndex != -1) {
				return new vscode.Position(pos.line, pos.character + nextIndex);

			} else if (previousIndex != -1) {
				return new vscode.Position(pos.line, previousIndex);
			}
		}
	}
	
	// Update decoration on scroll
	vscode.window.onDidChangeTextEditorVisibleRanges(e => {
		clearDecorations(); // Clear decoration while scrolling because decoration also scrolls
		hoveredClosingPosition = null; // Clear hover
		
		// If selection is active maybe update decoration line or hide it if scrolled in view port => use timeout to avoid flickering
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(triggerPreview, 300);

	}, null, context.subscriptions);

	// On startup
	if (activeEditor) {
		triggerFindPairs();
	}

	// On editor change
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) triggerFindPairs();

	}, null, context.subscriptions);

	// On text change
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) triggerFindPairs();
	}, null, context.subscriptions);


	function triggerPreview() {

		// Decide if hovered closing bracket/tag or selected closing bracket/tag preview 
		let closingPosition = hoveredClosingPosition; // Hover is more important then current selection
		if (!closingPosition) closingPosition = selectedClosingPosition; // Show current selection
		if (!closingPosition) return clearDecorations(); // => If no closing bracket/tag is active clear

		// Find pair depending on position of closing bracket/tag
		const pair = pairs.find(
			pair => pair.closingLineIndex == closingPosition.line && pair.closingOffset == closingPosition.character);

		if (!pair) return clearDecorations(); // No match => clear

		if (logging) { console.log(`Found opening =>  ${pair.openingLineText + 1}: ${pair.openingLineText}`, pair); }

		// First completely visible line in editor
		const firstVisibleLine = activeEditor.visibleRanges[0].start.line;

		// If opening bracket/tag is already visible no need to show preview
		const openingIsVisible = firstVisibleLine <= pair.openingLineIndex;
		if (openingIsVisible) {
			if (logging) { console.log('Opening bracket/tag line is visible'); }
			clearDecorations();
			return; 
		}
			
		// First visible line is closing bracket/tag => preview would flicker over closing bracket/tag don't show it
		const closingIsFirstVisible = firstVisibleLine == pair.closingLineIndex;
		if (closingIsFirstVisible) {
			if (logging) { console.log(`Closing bracket/tag line is first visible`); }
			clearDecorations(); // => Clear decoration to keep closing bracket/tag visible
			return;
		}
		
		// Closing bracket/tag is no longer visible after scrolling down
		const closingIsVisible = firstVisibleLine > pair.closingLineIndex;
		if (closingIsVisible) {
			if (logging) { console.log(`Closing bracket/tag line is no longer visible`); }
			clearDecorations(); // => Clear decoration since none of the brackets/tags is in view port
			return;
		}

		// Preview text => original line + line number
		let contentText = `${pair.openingLineText}  :${pair.openingLineIndex + 1}`;

		// Replace whitespace indents with unicode white spaces =>  Otherwise they are not shown and the text is not indented to the correct position
		contentText = contentText.replace(/ /g, String.fromCodePoint(0x00a0));  // Unicode whitespace
		
		// TODO:  Handle tab indents, since unicode tabs are not working
		// Replace tab with 2 whitespaces for now => has no effect?
		contentText = contentText.replace(/\t/g, `${String.fromCodePoint(0x00a0)}${String.fromCodePoint(0x00a0)}`);

		// Add 200 Unicode Whitespaces afterwards to push the text in this line out of screen 
		contentText += Array(200).fill(String.fromCodePoint(0x00a0)).join(''); // Unicode whitespace

		// Sometimes there is a half visible line above the complete visible line
		// => add an empty text decoration here to push the original text of this line out of the screen
		let emptyText = Array(contentText.length).fill(String.fromCodePoint(0x00a0)).join(''); // Unicode whitespace

		const preContentPos = new vscode.Position(Math.max(0, firstVisibleLine - 1));
		const contentPos = new vscode.Position(Math.max(1, firstVisibleLine));

		decorations = [{ // Empty line decoration
			range: new vscode.Range(preContentPos, preContentPos),
			renderOptions: {
				after: {
					contentText: emptyText,
				},
			}
		},
		{ // Preview content line decoration
			range: new vscode.Range(contentPos, contentPos),
			renderOptions: {
				after: {
					contentText: contentText,
				},
			}
		}];

		// Apply decorations
		activeEditor.setDecorations(decorationType, decorations);
	}

	function triggerFindPairs() {
		clearTimeout(pairFindTimeout);
		pairFindTimeout = setTimeout(findPairs, 500);
	}

	function findPairs() {
		
		pairs = [];
		
		if (!activeEditor) {
			if (logging) { console.log('bracket-peek: no active editor!') }
			return;
		}
		
		let bracketPairs = findBracketPairs();
		if (logging) { console.log(`Found ${bracketPairs.length}  bracket pairs!`, bracketPairs); }

		let tagPairs = findTagPairs();
		if (logging) { console.log(`Found ${tagPairs.length}  tag pairs!`, tagPairs); }
		
		pairs = [].concat(bracketPairs).concat(tagPairs);

		
		// Remove pairs where opening and closing line are the same => there will never be a preview for them
		pairs = pairs.filter(pair => {
			return pair.openingLineIndex != pair.closingLineIndex;
		});

		if (logging) { console.log(`Removed single line pairs!`, pairs); }
		
		
		triggerPreview();
	}
	
	function findBracketPairs() {
		let bracketPairs = [];

		const editorText = activeEditor.document.getText();
		
		// Find each line with an opening bracket
		const regExBracket = /.*{/gm;
		let match;
		while (match = regExBracket.exec(editorText)) { // For each opening bracket

			let openingLineText = match[0]; // '  function example() {'
			const openingIndex = match.index + openingLineText.length - 1;
			let openingLineIndex = editorText.substring(0, openingIndex + 1).split('\n').length - 1;


			// If a code formatter is used to put opening bracket on a new line, show previous line as preview
			// 
			// 	function(x, y) // <= Expected preview
			// 	{
			if (openingLineText.trim() == '{' && openingLineIndex > 0) {
				openingLineIndex = openingLineIndex - 1;
				openingLineText = activeEditor.document.lineAt(openingLineIndex).text;
			}

			// Closing bracket line e.g.: '}'
			const closingIndex = findClosingBracket(editorText, openingIndex);

			if (!closingIndex) continue;

			// All lines from document start to (including) closing bracket
			// closingIndex + 1 => to include bracket if it is on a new line
			const linesToClosing = editorText.substring(0, closingIndex + 1).split('\n');

			const closingLineIndex = linesToClosing.length - 1;
			const closingOffset = linesToClosing[linesToClosing.length - 1].length - 1; // Offset in line

			// Add pair
			bracketPairs.push({
				openingLineIndex,
				openingLineText,
				closingLineIndex,
				closingOffset
			});
		} 

		return bracketPairs;
	}

	function findTagPairs() {
		let tagPairs = [];
		
		const editorText = activeEditor.document.getText();

		const regExTag = /.*<[a-zA-Z0-9]* .*>?/gm;
		while (match = regExTag.exec(editorText)) { // For each opening tag

			const openingLineText = match[0]; // '   <div class="example" > 
			const tag = (/<[a-zA-Z0-9]* /).exec(match[0])[0].trim(); // '<div'
			const tagName = tag.substring(1, tag.length); // 'div'
			const openingIndex = match.index + openingLineText.lastIndexOf(tag);
			const openingLineIndex = editorText.substring(0, openingIndex + 1).split('\n').length - 1;

			// Closing tag line e.g.: '}'
			const closingIndex = findClosingTag(editorText, tagName, openingIndex);

			if (!closingIndex) continue;

			// All lines from document start to (including) closing bracket
			// closingIndex + 1 => to include bracket if it is on a new line
			const linesToClosing = editorText.substring(0, closingIndex + 1).split('\n');

			const closingLineIndex = linesToClosing.length - 1;
			const closingOffset = linesToClosing[linesToClosing.length - 1].length - 1; // Offset in line

			// Add pair
			tagPairs.push({
				openingLineIndex,
				openingLineText,
				closingLineIndex,
				closingOffset
			});
		}
		
		return tagPairs;
	}

	function findClosingBracket(editorText, index) {
		// If index given is invalid and is  
		// not an opening bracket.  
		if (editorText[index] !== '{') {
			// if (logging) { console.log(editorText + ", " + index + ": -1\n"); }
			return -1;
		}

		// Count depth of nesting => amount of same opened tags. Starts with initial bracket
		let depth = 0;

		// Traverse through string starting from given index.  
		for (; index < editorText.length; index++) {
			if (editorText[index] === '{') { // If current character is an opening bracket => nested =>  increase depth.  
				depth++;
			} else if (editorText[index] === '}') { // If current character is a closing  bracket => decrease depth
				depth--;
				if (depth === 0) {  // If depth level is 0 all brackets are closed now we found the correct closing bracket
					return index;
				}
			}
		}
		return -1;
	}

	function findClosingTag(editorText, tagName, index) {

		tagName = tagName.trim(); // '</div'

		// Find initial and nested opening tags
		const openingTagSearch = `<${tagName} `; // '</div '

		// Different formats to find the beginning of the correct and nested closing tags
		const closingTag1Search = `</${tagName} `; // '</div '
		const closingTag2Search = `</${tagName}>`; // '</div>'

		// Check if whole text starts at index 
		isTextAtIndex = (search, index) => {
			return editorText.substring(index, Math.min(index + search.length, editorText.length)) === search;
		}

		// If index given is invalid and is not the opening tag.
		if (!isTextAtIndex(openingTagSearch, index)) {
			return -1;
		}

		// Count depth of nesting => amount of same opened tags. Starts with initial tag
		depth = 0;

		while (index < editorText.length) {

			if (editorText[index] !== '<') { // No chance for open or close Tag => continue
				index++;

			} else if (isTextAtIndex(openingTagSearch, index)) { // Check opening tag starts at index
				depth++; // Add opening tag to stack (starts with initial tag)
				index += openingTagSearch.length;

			} else if (isTextAtIndex(closingTag1Search, index) || isTextAtIndex(closingTag2Search, index)) { // Check closing tag starts at index
				depth--; // Remove last opening tag from stack

				if (depth === 0) { // If depth level is 0 all tags are closed now we found the correct closing tag
					return index;
				}
				index += closingTag1Search.length;
			} else {
				index++; // Just one '<' of a different tag type or '<' in content / attribute
			}
		}
		return -1;
	}

	function clearDecorations() {
		if (activeEditor && decorations) {
			if (logging) { console.log('clear decorations'); }
			activeEditor.setDecorations(decorationType, []);
			decorations = null;
		}
	}

	function editorHasTextAt(text, position) {
		if (!activeEditor) return null;
		const lineText = activeEditor.document.lineAt(position.line).text;
		const textStart = position.character;
		const textEnd = Math.min(position.character + text.length, lineText.length);

		return lineText.substring(textStart, textEnd) == text;
	}

	function regexIndexOf(string ,regex) {
		var match = string.match(regex);
		return match ? string.indexOf(match[0]) : -1;
	}
	
	function regexLastIndexOf(string, regex) {
		var match = string.match(regex);
		return match ? string.lastIndexOf(match[match.length - 1]) : -1;
	}
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}