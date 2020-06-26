const config = require('../config');

const CLOSURES = {
  PARENTHESES: { opening: '(', closing: ')', openingRegex: '\\(', closingRegex: '\\)'  },
  CURLY_BRACKET: { opening: '{', closing: '}', openingRegex: '{', closingRegex: '}' },
  SQUARE_BRACKET: { opening: '[', closing: ']', openingRegex: '\\[', closingRegex: '\\]' },
  TAG: { opening: '<', closing: '</', openingRegex: '<', closingRegex: '<\/' }
}

function getEnabledClosures() {
  let closures = [];
  if (config.previewParentheses) closures.push(CLOSURES.PARENTHESES);
  if (config.previewCurlyBrackets) closures.push(CLOSURES.CURLY_BRACKET);
  if (config.previewSquareBrackets) closures.push(CLOSURES.SQUARE_BRACKET);
  if (config.previewTags) closures.push(CLOSURES.TAG);
  return closures;
}

function getEnabledClosings() {
  return getEnabledClosures().map(closure => closure.closing);
}

function getEnabledClosingsRegex() {
  
  // \)|}|]|<\/
  let regexString = getEnabledClosures()
    .map(closure => closure.closingRegex)
    .join('|');
  
  return new RegExp(regexString, 'g');
}


module.exports = {
  CLOSURES,
  getEnabledClosures,
  getEnabledClosings,
  getEnabledClosingsRegex
}