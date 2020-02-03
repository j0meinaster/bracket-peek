
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

## Release Notes

#### 1.1.0
- Support markup based languages by looking up tags: *.html, *.xml
#### 1.0.5
- Support *.java *.php *.c *cs *.cpp *.m *.h files
- Improve hover functionality to find closing bracket in whole hovered line
#### 1.0.4
- Support *.dart files
#### 1.0.3 / 1.0.2
- Updated logo with icon
#### 1.0.1
- Rename display name to "Bracket Peek"
#### 1.0.0
- Initial release of bracket-peek


## Known Issues

- Preview is not intended correctly if the formatter uses tab indents instead of space indents
- Closing and opening brackets may not be matched correctly if brackets are used in strings or comments