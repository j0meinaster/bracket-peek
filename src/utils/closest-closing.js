const vscode = require('vscode');
const { regexIndexOf, regexLastIndexOf } = require('./indexOf');

module.exports = pos => {
  const activeEditor = vscode.window.activeTextEditor;

  const posBefore = new vscode.Position(pos.line, Math.max(0, pos.character - 1));

  // Search bracket near carret first
  if (editorHasTextAt('}', pos) || editorHasTextAt('</', pos)) { // Closing bracket / tag after carret
    return pos;

  } else if (editorHasTextAt('}', posBefore) || editorHasTextAt('</', posBefore)) { // Closing bracket / tag before carret
    return posBefore;

  } else { // Search for next (preferred) or previous bracket in line
    const lineText = activeEditor.document.lineAt(pos.line).text;
    const nextText = lineText.substring(pos.character);
    const previousText = lineText.substring(0, Math.max(pos.character, 0));

    const nextIndex = regexIndexOf(nextText, /}|<\//gm); // First index of '}' or '</'
    const previousIndex = regexLastIndexOf(previousText, /}|<\//gm); // Last index of '}' or '</'

    if (nextIndex != -1) {
      return new vscode.Position(pos.line, pos.character + nextIndex);

    } else if (previousIndex != -1) {
      return new vscode.Position(pos.line, previousIndex);
    }
  }
}

function editorHasTextAt(text, position) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) return false;

  const lineText = activeEditor.document.lineAt(position.line).text;
  const textStart = position.character;
  const textEnd = Math.min(position.character + text.length, lineText.length);

  return lineText.substring(textStart, textEnd) == text;
}
