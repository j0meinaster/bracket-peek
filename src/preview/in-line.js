const vscode = require('vscode');

module.exports = pair => {

  const activeEditor = vscode.window.activeTextEditor;

  // Preview text => original line + line number
  let text = `${pair.openingLineIndex + 1}:  ${pair.openingLineText}`;

  const offset = activeEditor.document.lineAt(pair.closingLineIndex).text.length + 1;
  const position = new vscode.Position(pair.closingLineIndex, offset);

  return {
    decorations: [
      { text, position }
    ]
  };
}