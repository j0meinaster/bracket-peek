
# Bracket Peek

This extensions helps you to view the line of code containing an opening curly bracket when inspecting the matching closing bracket.
If the line of code, containing the opening bracket, is not visible in the current view port, a preview is displayed in the first line of the editor.

Now works with \<tags\> as well.

## Features
Works on:
- selecting text with closing bracket / tag
- moving carret to or near closing bracket / tag
- hovering over or near to closing bracket / tag

![](https://raw.githubusercontent.com/j0meinaster/bracket-peek/master/preview.gif)


Works with any programming language containing curly brackets '{ ... }'
- Javascript    *.js
- Typescript    *.ts
- Sass          *.scss
- Css           *.css
- JSON          *.json
- Dart          *.dart
- Java          *.java
- Php           *.php
- C, C#, C++, Objective-C, Objective C++   *.c *cs *.cpp *.m* *.h

Works with any markup based language containing tags'\<tag\>...\</tag\>'
- Html          *.html
- Xml           *.xml

Please note that the according language support extension needs to be installed as well.

## Known Issues

- Preview is not intended correctly if the formatter uses tab indents instead of space indents
- Closing and opening brackets may not be matched correctly if brackets are used in strings or comments