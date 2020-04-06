const vscode = require('vscode');

module.exports = pair => {
  let contentText =
`${'```'}
${pair.openingLineIndex + 1}: ${pair.openingLineText.trim()}
${'```'}`; // Keep formatting

  const hover = new vscode.Hover(new vscode.MarkdownString(contentText));

  return {
    hover
  };
}