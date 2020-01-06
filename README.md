# bracket-peek

This extensions helps you to view the line of code containing an opening curly bracket when inspecting the matching closing bracket.
If the line of code, containing the opening bracket, is not visible in the current view port, a preview is displayed in the first line of the editor.

## Features
Works on:
- selecting closing bracket
- moving carret to closing bracket
- hovering closing bracket

![](preview.gif)


Works with any file type containing curly brackets '{ ... }'_
- Javascript    *.js
- Typescript    *.ts
- Sass          *.scss
- Css           *.css
- JSON          *.json

## Release Notes

### 1.0.0

Initial release of bracket-peek

## Known Issues

- Preview is not intended correctly if the formatter uses tab indents instead of space indents
- Closing and opening brackets may not be matched correctly if brackets are used in strings or comments