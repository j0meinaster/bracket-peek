const vscode = require('vscode');
const { regexIndexOfClosing, regexLastIndexOfClosing } = require('./indexOf');
const { getEnabledClosings } = require('../utils/closures');

module.exports = pos => {
  const activeEditor = vscode.window.activeTextEditor;

  const posBefore = new vscode.Position(pos.line, Math.max(0, pos.character - 1));

  // Search bracket near carret first
  if (editorHasClosingAt(pos) || editorHasClosingAt(pos)) { // Closing bracket / tag after carret
    return pos;

  } else if (editorHasClosingAt(posBefore) || editorHasClosingAt(posBefore)) { // Closing bracket / tag before carret
    return posBefore;

  } else { // Search for next (preferred) or previous bracket in line
    const lineText = activeEditor.document.lineAt(pos.line).text;
    const nextText = lineText.substring(pos.character);
    const previousText = lineText.substring(0, Math.max(pos.character, 0));

    const nextIndex = regexIndexOfClosing(nextText); // First index of closing e.g.: '</'
    const previousIndex = regexLastIndexOfClosing(previousText); // Last index of closing e.g.: '}'

    if (nextIndex != -1) {
      return new vscode.Position(pos.line, pos.character + nextIndex);

    } else if (previousIndex != -1) {
      return new vscode.Position(pos.line, previousIndex);
    }
  }
}

function editorHasClosingAt(position) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) return false;

  const lineText = activeEditor.document.lineAt(position.line).text;
  const textStart = position.character;

  const foundClosing = getEnabledClosings().find(closingText => {
    const textEnd = Math.min(position.character + closingText.length, lineText.length);
    return lineText.substring(textStart, textEnd) == closingText;
  });

  return !!foundClosing;
}
