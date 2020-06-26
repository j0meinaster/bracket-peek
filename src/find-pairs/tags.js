const vscode = require('vscode');

module.exports = () => {
  let tagPairs = [];

  const activeEditor = vscode.window.activeTextEditor;
  const editorText = activeEditor.document.getText();


  // regex + tag open + any Letter or Number + (space + any char + tag close) or ( just tag close) 
  // - matches if tag has or has not attributes
  const regExTag = /<[a-zA-Z0-9]+( .*>|>)/g;
  while (match = regExTag.exec(editorText)) { // For each opening tag

    const openingLineText = match[0]; // '<div class="example" >' or '<div>'
    const tag = (/<[a-zA-Z0-9]+( |>)/).exec(match[0])[0]; // '<div ' or <div>
    const tagName = tag.substring(1, tag.length - 1); // 'div'
    const openingIndex = match.index + openingLineText.lastIndexOf(tag);
    let openingLineIndex = activeEditor.document.positionAt(openingIndex + 1).line;

    // Closing tag line e.g.: '}'
    const closingIndex = findClosingTag(editorText, tagName, openingIndex);

    if (!closingIndex) continue;

    // All lines from document start to (including) closing tag
    const closingPosition = activeEditor.document.positionAt(closingIndex);

    const closingLineIndex = closingPosition.line;
    const closingOffset = closingPosition.character; // Offset in line

    // Add pair
    tagPairs.push({
      openingLineIndex,
      openingLineText,
      closingLineIndex,
      closingOffset
    });
  }

  return tagPairs;
}

function findClosingTag(editorText, tagName, index) {

  tagName = tagName.trim(); // '</div'

  // Find initial and nested opening tags
  const openingTag1Search = `<${tagName} `; // '</div '
  const openingTag2Search = `<${tagName}>`; // '</div '

  // Different formats to find the beginning of the correct and nested closing tags
  const closingTag1Search = `</${tagName} `; // '</div '
  const closingTag2Search = `</${tagName}>`; // '</div>'

  // Check if whole text starts at index 
  isTextAtIndex = (search, index) => {
    return editorText.substring(index, Math.min(index + search.length, editorText.length)) === search;
  }

  // If index given is invalid and is not the opening tag.
  if (!isTextAtIndex(openingTag1Search, index) && !isTextAtIndex(openingTag2Search, index)) {
    return -1;
  }

  // Count depth of nesting => amount of same opened tags. Starts with initial tag
  depth = 0;

  while (index < editorText.length) {

    if (editorText[index] !== '<') { // No chance for open or close Tag => continue
      index++;

    } else if (isTextAtIndex(openingTag1Search, index) || isTextAtIndex(openingTag2Search, index)) { // Check opening tag starts at index
      depth++; // Add opening tag to stack (starts with initial tag)
      index += tagName.length + 2; //<tagname> => tag length + 2

    } else if (isTextAtIndex(closingTag1Search, index) || isTextAtIndex(closingTag2Search, index)) { // Check closing tag starts at index
      depth--; // Remove last opening tag from stack

      if (depth === 0) { // If depth level is 0 all tags are closed now we found the correct closing tag
        return index;
      }
      index += closingTag1Search.length;
    } else {
      index++; // Just one '<' of a different tag type or '<' in content / attribute
    }
  }
  return -1;
}