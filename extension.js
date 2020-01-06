// This extension is inspired and based on scss-scope-helper => https://github.com/ffpetrovic/scss-scope-helper/


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('bracket-preview activated');
	
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
	
	
	// Cached bracket pairs in active editor
	/*
	[{
		openingBracketLineIndex,
		openingBracketLineText,
		closingBracketLineIndex,
		closingBracketOffset
	}]
	*/
	let bracketPairs = [];
	
	let selectedClosingBracketPosition = null;
	let hoveredClosingBracketPosition = null;
	
	let bracketPairFindTimeout;
	let scrollTimeout;

	// Text selected or carret moved
	vscode.window.onDidChangeTextEditorSelection(e => {
		hoveredClosingBracketPosition = null; // Clear hover
		selectedClosingBracketPosition = null; // Clear current selection

		if (e.selections.length !== 1) return clearDecorations(); // Invalid selection for bracket preview

		const selection = e.selections[0];
		const text = activeEditor.document.getText(selection); // Text of selection range
		
		if (text.length > 0) { // Selection is range
			const selectedLines = text.split('\n');

			// Search for closing bracket in any line of selection, starting from the back
			for (let i = selectedLines.length - 1; i >= 0 && !selectedClosingBracketPosition; i--){
				const lineText = selectedLines[i];
				const closingBracketIndex = lineText.lastIndexOf('}');
				if (closingBracketIndex != -1) {
					const closingBracketLine = selection.start.line + i;
					const closingBracketCharacter = i == 0 ? selection.start.character + closingBracketIndex : closingBracketIndex;
					selectedClosingBracketPosition = new vscode.Position(closingBracketLine, closingBracketCharacter);
				}
			}
			
		} else { // Selection is carret => search for bracket in line
			const posAfterCarret = selection.start;
			const posBeforeCarret = new vscode.Position(posAfterCarret.line, Math.max(0, selection.start.character - 1));
			
			// Search bracket near carret first
			if (editorCharAt(posAfterCarret) == '}') { // Closing bracket after carret
				selectedClosingBracketPosition = posAfterCarret; 
			
			} else if (editorCharAt(posBeforeCarret) == '}') { // Closing bracket before carret
				selectedClosingBracketPosition = posBeforeCarret; 
		
			} else { // Search for next (preferred) or previous bracket in line
				const lineText = activeEditor.document.lineAt(selection.start.line).text;
				const nextBracketIndex = lineText.substring(selection.start.character).indexOf('}');
				const previousBracketIndex = lineText.substring(0, Math.max(selection.start.character - 1, 0)).lastIndexOf('}');
				
				if (nextBracketIndex != -1) {
					selectedClosingBracketPosition = new vscode.Position(selection.start.line, selection.start.character + nextBracketIndex);
				
				} else if (previousBracketIndex != -1) {
					selectedClosingBracketPosition = new vscode.Position(selection.start.line, previousBracketIndex);
				}
			}
		}

		triggerOpeningBracketPreview();
	
	}, null, context.subscriptions);
	
	vscode.languages.registerHoverProvider('*', {
		provideHover(document, position, token) {
			const hoveredChar = editorCharAt(position);

			token.onCancellationRequested(() => {
				console.log('CANCEL');
				triggerOpeningBracketPreview();
			});

			if (hoveredChar == '}') hoveredClosingBracketPosition = position;
			else hoveredClosingBracketPosition = null;

			triggerOpeningBracketPreview();
		}
	});
	
	// Update decoration on scroll
	vscode.window.onDidChangeTextEditorVisibleRanges(e => {
		clearDecorations(); // Clear decoration while scrolling because decoration also scrolls
		hoveredClosingBracketPosition = null; // Clear hover
		
		// If selection is active maybe update decoration line or hide it if scrolled in view port => use timeout to avoid flickering
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(triggerOpeningBracketPreview, 300);

	}, null, context.subscriptions);


	function triggerOpeningBracketPreview() {

		// Decide if hovered closing bracket or selected closing bracket preview 
		let closingBracketPosition = hoveredClosingBracketPosition; // Hover is more important then current selection
		if (!closingBracketPosition) closingBracketPosition = selectedClosingBracketPosition; // Show current selection
		if (!closingBracketPosition) return clearDecorations(); // => If no closing bracket is active clear

		if (!bracketPairs) findBracketPairs(); // Pairs not loaded yet => Do now
		if (!bracketPairs) return clearDecorations(); // Pairs can't be loaded right now =>  clear

		// Find pair depending on position of closing bracket
		const bracketPair = bracketPairs.find(
			pair => pair.closingBracketLineIndex == closingBracketPosition.line && pair.closingBracketOffset == closingBracketPosition.character);

		if (!bracketPair) return clearDecorations(); // No match => clear

		console.log(`Hovered '}' =>  ${bracketPair.openingBracketLineIndex + 1}: ${bracketPair.openingBracketLineText}`, bracketPair);

		// First completely visible line in editor
		const firstVisibleLine = activeEditor.visibleRanges[0].start.line;

		// If opening bracket is already visible no need to show preview
		const openingBracketIsVisible = firstVisibleLine <= bracketPair.openingBracketLineIndex;
		if (openingBracketIsVisible) {
			console.log('Opening bracket line is visible');
			clearDecorations();
			return; 
		}
			
		// First visible line is closing bracket => preview would flicker over closing bracket don't show it
		const closingBracketIsFirstVisible = firstVisibleLine == bracketPair.closingBracketLineIndex;
		if (closingBracketIsFirstVisible) {
			console.log(`Closing bracket line is first visible`);
			clearDecorations(); // => Clear decoration to keep closing bracket visible
			return;
		}
		
		// Closing bracket is no longer visible after scrolling down
		const closingBracketIsVisible = firstVisibleLine > bracketPair.closingBracketLineIndex;
		if (closingBracketIsVisible) {
			console.log(`Closing bracket line is no longer visible`);
			clearDecorations(); // => Clear decoration since none of the brackets is in view port
			return;
		}

		// Preview text => original line + line number
		let contentText = `${bracketPair.openingBracketLineText}  :${bracketPair.openingBracketLineIndex + 1}`;

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

	function triggerFindBracketPairs() {
		clearTimeout(bracketPairFindTimeout);
		bracketPairFindTimeout = setTimeout(findBracketPairs, 500);
	}

	function findBracketPairs() {
		
		bracketPairs = [];

		if (!activeEditor) {
			console.log('bracket-preview: no active editor!')
			return;
		}

		const editorText = activeEditor.document.getText();
		
		// Find each line with an opening bracket
		const regEx = /(.*{$)/gm;
		let match;
		while (match = regEx.exec(editorText)) { // For each opening bracket '{'
			
			// Opening bracket line e.g.: 'function example() {'
			const openingBracketLineText = match[0];
			const openingBracketIndex = match.index + openingBracketLineText.length;
			const openingBracketLineIndex = editorText.substring(0, openingBracketIndex).split('\n').length - 1;

			// Closing bracket line e.g.: '}'
			const closingBracketIndex = findClosingBracket(editorText, match.index + match[0].length - 1); 

			if (!closingBracketIndex) continue;
			
			// All lines from document start to (including) closing bracket
			// closingBracketIndex + 1 => to include bracket if it is on a new line
			const linesToClosingBracket = editorText.substring(0, closingBracketIndex + 1).split('\n');

			const closingBracketLineIndex = linesToClosingBracket.length - 1;
			const closingBracketOffset = linesToClosingBracket[linesToClosingBracket.length - 1].length - 1; // Offset in line
	
			// Cache pairs
			bracketPairs.push({
				openingBracketLineIndex,
				openingBracketLineText,
				closingBracketLineIndex,
				closingBracketOffset
			});
		} 

		console.log(`Found ${bracketPairs.length}  bracket pairs!`, bracketPairs);

		triggerOpeningBracketPreview();
	}

	function clearDecorations() {
		if (activeEditor && decorations) {
			console.log('clear decorations');
			activeEditor.setDecorations(decorationType, []);
			decorations = null;
		}
	}

	function editorCharAt(position) {
		if (!activeEditor) return null;
		return activeEditor.document.lineAt(position.line).text.charAt(position.character);
	}

	// On startup
	if (activeEditor) {
		triggerFindBracketPairs();
	}

	// On editor change
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) triggerFindBracketPairs();
	
	}, null, context.subscriptions);
	
	// On text change
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) triggerFindBracketPairs();
	}, null, context.subscriptions);

}

// this method is called when your extension is deactivated
function deactivate() { }


// https://www.geeksforgeeks.org/find-index-closing-bracket-given-opening-bracket-expression/
function findClosingBracket(expression, index) {
	let i;

	// If index given is invalid and is  
	// not an opening bracket.  
	if (expression[index] !== '{') {
		// console.log(expression + ", " + index + ": -1\n");  
		return -1;
	}

	// Stack to store opening brackets.  
	let st = [];

	// Traverse through string starting from  
	// given index.  
	for (i = index; i < expression.length; i++) {

		// If current character is an  
		// opening bracket push it in stack.  
		if (expression[i] === '{') {
			st.push(expression[i]);
		} // If current character is a closing  
		// bracket, pop from stack. If stack  
		// is empty, then this closing  
		// bracket is required bracket.  
		else if (expression[i] === '}') {
			st.pop();
			if (st.length === 0) {
				return i;
			}
		}
	}
}

module.exports = {
	activate,
	deactivate
}