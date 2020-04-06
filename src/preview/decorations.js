const vscode = require('vscode');
const config = require('../config');
const log = require('../utils/log');

module.exports = {
  clearDecorations,
  setDecorations
}

// Required decoration type
// Don't add any styles here, because it affects other decorations / code lenses e.g. gitlens
// Style => color, font style is directly added to decoration
let decorationType = vscode.window.createTextEditorDecorationType({});

function clearDecorations() {
  const activeEditor = vscode.window.activeTextEditor;
  
  if (!activeEditor) return;

  log('clear decorations');
  activeEditor.setDecorations(decorationType, []);
}

function setDecorations(decorations) {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) return;

  decorations = decorations.map(decoration => {
    return {
      range: new vscode.Range(decoration.position, decoration.position),
      renderOptions: {
        before: { // Use before instead of after to avoid collision with git-lens
          contentText: decoration.text,
          margin: config.previewInLine ? '0 0 0 3em': '0',
          fontStyle: config.previewItalic ? 'italic' : 'normal',
        },
        light: {
          before: { 
            color: config.previewLightColor
          }
        },
        dark: {
          before: {
            color: config.previewDarkColor
          },
        },
        textDecoration: "white-space: pre;",
      }
    }
  });

  // Apply decorations
  activeEditor.setDecorations(decorationType, decorations);
}