const vscode = require('vscode');

module.exports = () => {
  let bracketPairs = [];

  const activeEditor = vscode.window.activeTextEditor;
  const editorText = activeEditor.document.getText();

  // Find each line with an opening bracket
  const regExBracket = /.*{/gm;
  let match;
  while (match = regExBracket.exec(editorText)) { // For each opening bracket

    let openingLineText = match[0]; // '  function example() {'
    const openingIndex = match.index + openingLineText.length - 1;
    let openingLineIndex = activeEditor.document.positionAt(openingIndex).line;


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
    const closingPosition = activeEditor.document.positionAt(closingIndex);

    const closingLineIndex = closingPosition.line
    const closingOffset = closingPosition.character; // Offset in line

    // Add pair
    bracketPairs.push({
      openingLineIndex,
      openingLineText,
      closingLineIndex,
      closingOffset
    });
  }

  return bracketPairs;
};

function findClosingBracket(editorText, index) {
  // If index given is invalid and is  
  // not an opening bracket.  
  if (editorText[index] !== '{') {
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