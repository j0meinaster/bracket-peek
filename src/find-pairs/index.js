const vscode = require('vscode');
const log = require('../utils/log');
const findBracketPairs = require('./brackets');
const findTagPairs = require('./tags');

module.exports = () => {
  let pairs = [];

  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) return pairs;

  let bracketPairs = findBracketPairs();
  log(`Found ${bracketPairs.length}  bracket pairs!`, bracketPairs);

  let tagPairs = findTagPairs();
  log(`Found ${tagPairs.length}  tag pairs!`, tagPairs);

  pairs = [].concat(bracketPairs).concat(tagPairs);

  // Remove pairs where opening and closing line are the same => there will never be a preview for them
  pairs = pairs.filter(pair => {
    return pair.openingLineIndex != pair.closingLineIndex;
  });

  log(`Removed single line pairs!`, pairs);
  
  return pairs;
}