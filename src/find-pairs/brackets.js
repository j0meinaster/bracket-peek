const vscode = require('vscode');

module.exports = (bracketType) => {
  let bracketPairs = [];

  if (!bracketType) return bracketPairs;

  const activeEditor = vscode.window.activeTextEditor;
  const editorText = activeEditor.document.getText();

  // Find each line with an opening bracket => e.g. /.*{/gm
  const regExBracket = new RegExp(`(.${bracketType.openingRegex}!)*${bracketType.openingRegex}`, 'g');
  let match;
  while (match = regExBracket.exec(editorText)) { // For each opening bracket

    let openingText = match[0]; // '  function example() {'
    const openingIndex = match.index + openingText.length - 1;
    let openingLineIndex = activeEditor.document.positionAt(openingIndex).line;
    let openingLineText = activeEditor.document.lineAt(openingLineIndex).text;

    // Closing bracket line e.g.: '}'
    const closingIndex = findClosingBracket(bracketType, editorText, openingIndex);

    if (!closingIndex) continue;

    // All lines from document start to (including) closing bracket
    // closingIndex + 1 => to include bracket if it is on a new line
    const closingPosition = activeEditor.document.positionAt(closingIndex);

    const closingLineIndex = closingPosition.line
    const closingOffset = closingPosition.character; // Offset in line


    // If a code formatter is used to put opening bracket on a new line, show previous line as preview
    // 
    // 	function(x, y) // <= Expected preview
    // 	{
    if (openingLineText.trim() == bracketType.opening && openingLineIndex > 0) {
      openingLineIndex = openingLineIndex - 1;
      openingLineText = activeEditor.document.lineAt(openingLineIndex).text;;
    }

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

function findClosingBracket(bracketType, editorText, index) {
  // If index given is invalid and is  
  // not an opening bracket.  
  if (editorText[index] !== bracketType.opening) {
    return -1;
  }

  // Count depth of nesting => amount of same opened tags. Starts with initial bracket
  let depth = 0;

  // Traverse through string starting from given index.  
  for (; index < editorText.length; index++) {
    if (editorText[index] === bracketType.opening) { // If current character is an opening bracket => nested =>  increase depth.  
      depth++;
    } else if (editorText[index] === bracketType.closing) { // If current character is a closing  bracket => decrease depth
      depth--;
      if (depth === 0) {  // If depth level is 0 all brackets are closed now we found the correct closing bracket
        return index;
      }
    }
  }
  return -1;
}