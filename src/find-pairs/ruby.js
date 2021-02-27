const vscode = require('vscode');
const { RUBY_OPENINGS, RUBY_CLOSINGS } = require('../utils/closures');


// ^( )*(if|unless|.+step)( .*)? =>
// => 
// ^ => line start
// ( )* => any space indent
// (if|unless|.+step) => match reserved words 
// ( .*)?  => any leading space + word or nothing
//
// Only lines where the reserved opening is the first word are interpreted as block
// so we can skip single line controls (where always word come beforehand), like: 
//    "return true if arr.empty? && n == 0"  => no end  == no block
const openingRegexPattern = `(^|\r\n|\r|\n)( )*(${RUBY_OPENINGS.join('|')})( |\r\n|\r|\n)`;

// Closing
// Same as opening, but leading words are allowed to match inline controls, like:
// 'while x < 5 do x+=1 end'
const closingRegexPattern = `(^|\r\n|\r|\n)(.* )?(${RUBY_CLOSINGS.join('|')})( |\r\n|\r|\n)`;

module.exports = () => {
  let rubyPairs = [];

  const activeEditor = vscode.window.activeTextEditor;
  const editorText = activeEditor.document.getText();

  const openingRegex = new RegExp(openingRegexPattern, 'gm');
  while (match = openingRegex.exec(editorText)) { // For each opening tag

    const openingLineText = match[0]; // '  def sum_eq_n?(arr, n)'
    let openingWord = new RegExp(`( )*(${RUBY_OPENINGS.join('|')})( |\r\n|\r|\n)`).exec(match[0])[0]; // '  def'
    const openingEndIndex = match.index + openingWord.length;
    let openingLineIndex = activeEditor.document.positionAt(openingEndIndex).line;

    // display whole line
    const displayText = activeEditor.document.lineAt(openingLineIndex).text;

    // Closing tag line e.g.: 'end'
    const closingIndex = findClosingIndex(editorText, openingEndIndex);

    if (!closingIndex) continue;

    // All lines from document start to (including) closing tag
    const closingPosition = activeEditor.document.positionAt(closingIndex);

    const closingLineIndex = closingPosition.line;
    const closingOffset = closingPosition.character; // Offset in line

    // Add pair
    rubyPairs.push({
      openingLineIndex,
      openingLineText: displayText,
      closingLineIndex,
      closingOffset
    });
  }

  return rubyPairs;
}

function findClosingIndex(editorText, index) {

  const searchText = editorText.substring(index);

  const closingRegex = new RegExp(closingRegexPattern, 'gm');
  const openingRegex = new RegExp(openingRegexPattern, 'gm');

  let currClosingMatch = closingRegex.exec(searchText);
  let currOpeningMatch = openingRegex.exec(searchText);

  let closingMatch = null;
  let depth = 0;

  while (!closingMatch) {

    if (!currClosingMatch) return null; // no more closings => can't be found
    
    if (currOpeningMatch && currOpeningMatch.index < currClosingMatch.index) { // Found opening
      depth++; // Enter depth
      currOpeningMatch = openingRegex.exec(searchText);
    } else if (depth > 0) {
      depth--; // go to next closing
      currClosingMatch = closingRegex.exec(searchText);
    } else {
      closingMatch = currClosingMatch; // Found searched closing
    }
  }

  const closingString = new RegExp(`(^| |\r\n|\r|\n)(${RUBY_CLOSINGS.join('|')})`).exec(closingMatch[0])[0]; // '  end'
  const closingEndIndex = index + closingMatch.index + closingMatch[0].length - closingString.trim().length - 1;

  return closingEndIndex;

}