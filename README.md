
# Bracket Peek

This extensions helps you to view the line of code containing an opening curly bracket when inspecting the matching closing bracket.
If the line of code, containing the opening bracket, is not visible in the current view port, a preview is displayed in the first line of the editor.

Now works with \<tags\> as well.

## Features
Works on:
- selecting text with closing bracket / tag
- moving carret to or near closing bracket / tag
- hovering over or near to closing bracket / tag

![](https://raw.githubusercontent.com/j0meinaster/bracket-peek/master/assets/preview.gif)


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

## Customization

Check bracket peek settings in visual studio code.

### Preview Location

#### Editor Top (default)
Show the content of the opening line at the first visible line of the editor.

<img src="https://raw.githubusercontent.com/j0meinaster/bracket-peek/master/assets/top.png" width="400" >

Known Issues:
- Pushes the content of the first visible lines away, which forces a horizontal scrollbar. This is intended and won't / can't be fixed.

#### In Line
Show the content of the opening line after the closing bracket / tag.

<img src="https://raw.githubusercontent.com/j0meinaster/bracket-peek/master/assets/inline.png" width="400" >

#### Hover
Show the content of the opening line as a tooltip when hovering a closing bracket / tag. 
Does not work when selecting code.

<img src="https://raw.githubusercontent.com/j0meinaster/bracket-peek/master/assets/hover.png" width="400" >

### Preview Always (default: false)
If true, always show the preview. Otherwise only show the preview, if the opening line is currently not visible.

<img src="https://raw.githubusercontent.com/j0meinaster/bracket-peek/master/assets/always.png" width="400" >

### Preview Color (default: Theme default)
CSS color attribute to change the preview text color. Does not work in combination with location 'Hover'.

### Preview Italic
Display the preview text in italic font style. Does not work in combination with location 'Hover'.

### Preview Trigger
Decide if the preview should be displayed on hover or when selecting code (cursor, range of text). 

## Known Issues

- Preview is not intended correctly if the formatter uses tab indents instead of space indents
- Closing and opening brackets may not be matched correctly if brackets are used in strings or comments