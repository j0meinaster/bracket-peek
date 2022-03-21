const vscode = require('vscode');
const log = require('../utils/log');
const { CLOSURES, getEnabledClosures }= require('../utils/closures');
const findBracketPairs = require('./brackets');
const findTagPairs = require('./tags');
const findRubyPairs = require('./ruby');

module.exports = () => {
  let pairs = [];

  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor || !activeEditor.document) return pairs;

  if (getEnabledClosures().includes(CLOSURES.PARENTHESES)) {
    let parenthesesPairs = findBracketPairs(CLOSURES.PARENTHESES);
    log(`Found ${parenthesesPairs.length} parentheses pairs! ()`, parenthesesPairs);
    pairs = pairs.concat(parenthesesPairs);
  }
    
  if (getEnabledClosures().includes(CLOSURES.CURLY_BRACKET)) {
    let curlyBracketPairs = findBracketPairs(CLOSURES.CURLY_BRACKET);
    log(`Found ${curlyBracketPairs.length} curly bracket pairs! {}`, curlyBracketPairs);
    pairs = pairs.concat(curlyBracketPairs);
  }

  if (getEnabledClosures().includes(CLOSURES.SQUARE_BRACKET)) {
    let squareBracketPairs = findBracketPairs(CLOSURES.SQUARE_BRACKET);
    log(`Found ${squareBracketPairs.length} square bracket pairs! []`, squareBracketPairs);
    pairs = pairs.concat(squareBracketPairs);
  }
  
  if (getEnabledClosures().includes(CLOSURES.TAG)) {
    let tagPairs = findTagPairs();
    log(`Found ${tagPairs.length}  tag pairs!`, tagPairs);
    pairs = pairs.concat(tagPairs);
  } 

  if (activeEditor.document && activeEditor.document.languageId == 'ruby') {
    let rubyPairs = findRubyPairs();
    log(`Found ${rubyPairs.length}  ruby pairs!`, rubyPairs);
    pairs = pairs.concat(rubyPairs);
  }

  // Remove pairs where opening and closing line are the same => there will never be a preview for them
  pairs = pairs.filter(pair => {
    return pair.openingLineIndex != pair.closingLineIndex;
  });

  log(`Removed single line pairs!`, pairs);
  
  return pairs;
}