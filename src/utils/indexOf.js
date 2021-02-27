const { getEnabledClosingsRegex } = require('./closures');

module.exports = {
  
  regexIndexOfClosing: (string, activeEditor) => {
    const regex = getEnabledClosingsRegex(activeEditor);
    var match = string.match(regex);
    return match ? string.indexOf(match[0]) : -1;
  },
  
  regexLastIndexOfClosing: (string, activeEditor) => {
    const regex = getEnabledClosingsRegex(activeEditor);
    var match = string.match(regex);
    return match ? string.lastIndexOf(match[match.length - 1]) : -1;
  }
}