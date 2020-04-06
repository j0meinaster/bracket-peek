const vscode = require('vscode');
const config = require('../config');
const log = require('../utils/log');

// Unicode whitespace
const unicodeWhitespace = String.fromCodePoint(0x00a0);

module.exports = pair => {
  let decorations = null;

  const activeEditor = vscode.window.activeTextEditor;
  const firstVisibleLine = activeEditor.visibleRanges[0].start.line;

  // First visible line is closing bracket/tag => preview would flicker over closing bracket/tag don't show it
  // If preview on closing line, there will be no flicker when inspecting the first visible line
  const closingIsFirstVisible = firstVisibleLine == pair.closingLineIndex;
  if (closingIsFirstVisible) {
    log(`Closing bracket/tag line is first visible`);
    return null;
  }


  // If preview always => add decoration even if line is already visible but at opening line
  if (config.previewAlways && firstVisibleLine < pair.openingLineIndex) {
    const text = getOpeningTextWithWhitespaces(pair, false);
    const position = new vscode.Position(pair.openingLineIndex);

    decorations = [
      { text, position }
    ];

  } else {
    // Not visible preview at top
    // Sometimes there is a half visible line above the complete visible line
    // => add an empty text decoration here to push the original text of this line out of the screen
    
    const text = getOpeningTextWithWhitespaces(pair, true);
    
    let emptyText = Array(text.length).fill(unicodeWhitespace).join(''); // Unicode whitespace

    const emptyPosition = new vscode.Position(Math.max(0, firstVisibleLine - 1));
    const position = new vscode.Position(Math.max(1, firstVisibleLine));

    decorations = [
      { text: emptyText, position: emptyPosition }, // Empty line decoration
      { text, position }, // Preview content line decoration
    ];
  }

  return {
    decorations
  };
}


function getOpeningTextWithWhitespaces(pair, showLineNumber = true) {
  
  // Preview text => original line + line number
  let text = pair.openingLineText;
  if (showLineNumber) text = `${text} :${pair.openingLineIndex + 1}`;

  // Add 200 space afterwards to push the text in this line out of screen
  // SIDE EFFECT:  Forces the horizontal scrollbar to show up.
  text += Array(200).fill(' ').join('');

  // Replace whitespace indents with unicode white spaces =>  Otherwise they are not shown and the text is not indented to the correct position
  text = text.replace(/ /g, unicodeWhitespace);

  // TODO:  Handle tab indents, since unicode tabs are not working
  // Replace tab with 2 whitespaces for now => has no effect?
  text = text.replace(/\t/g, unicodeWhitespace + unicodeWhitespace);
 
  return text;
}