module.exports = {
  
  regexIndexOf: (string, regex) => {
    var match = string.match(regex);
    return match ? string.indexOf(match[0]) : -1;
  },

  regexLastIndexOf: (string, regex) => {
    var match = string.match(regex);
    return match ? string.lastIndexOf(match[match.length - 1]) : -1;
  }
}