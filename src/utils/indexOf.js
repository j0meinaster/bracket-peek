const { getEnabledClosingsRegex } = require('./closures');

module.exports = {
  
  regexIndexOfClosing: (string) => {
    const regex = getEnabledClosingsRegex();
    var match = string.match(regex);
    return match ? string.indexOf(match[0]) : -1;
  },
  
  regexLastIndexOfClosing: (string) => {
    const regex = getEnabledClosingsRegex();
    var match = string.match(regex);
    return match ? string.lastIndexOf(match[match.length - 1]) : -1;
  }
}