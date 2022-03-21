const vscode = require('vscode');
const log = require('../utils/log');
const config = require('../config');
const { clearDecorations, setDecorations } = require('./decorations');
const createPreviewAtTop = require('./top');
const createPreviewInLine = require('./in-line');
const createPreviewAsHover = require('./hover');

module.exports = (pairs, hoveredClosingPosition, selectedClosingPosition) => {

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor || !activeEditor.document) return;

  // Decide if hovered closing bracket/tag or selected closing bracket/tag preview 
  let closingPosition = hoveredClosingPosition; // Hover is more important then current selection
  if (!closingPosition) closingPosition = selectedClosingPosition; // Show current selection
  if (!closingPosition) return clearDecorations(); // => If no closing bracket/tag is active clear

  // Find pair depending on position of closing bracket/tag
  const pair = pairs.find(
    pair => pair.closingLineIndex == closingPosition.line && pair.closingOffset == closingPosition.character);

  if (!pair) return clearDecorations(); // No match => clear

  log(`Found opening =>  ${pair.openingLineIndex + 1}: ${pair.openingLineText}`, pair);

  // First completely visible line in editor
  const firstVisibleLine = activeEditor.visibleRanges[0].start.line;

  // If opening bracket/tag is already visible no need to show preview
  const openingIsVisible = firstVisibleLine <= pair.openingLineIndex;
  if (openingIsVisible && !config.previewAlways) {
    log('Opening bracket/tag line is visible');
    clearDecorations();
    return;
  }

  // Closing bracket/tag is no longer visible after scrolling down
  const closingIsVisible = firstVisibleLine > pair.closingLineIndex;
  if (closingIsVisible) {
    log(`Closing bracket/tag line is no longer visible`);
    clearDecorations(); // => Clear decoration since none of the brackets/tags is in view port
    return;
  }

  let preview = null;
  if (config.previewAtTop) preview = createPreviewAtTop(pair);
  else if (config.previewInLine) preview = createPreviewInLine(pair);
  else if (config.previewAsHover) preview = createPreviewAsHover(pair);


  if (!preview || (!preview.decorations && !preview.hover)) {
    clearDecorations();
    return;
  }

  if (preview.decorations) {
    setDecorations(preview.decorations);
  }

  return preview;
}

