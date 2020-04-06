const vscode = require('vscode');
var isColor = require('is-color');

const LOCATION_TOP = 'Editor top';
const LOCATION_IN_LINE = 'In line';
const LOCATION_HOVER = 'Hover';

const TRIGGER_ONSELECT_AND_ONHOVER = 'On select and on hover';
const TRIGGER_ONSELECT = 'On select';
const TRIGGER_ONHOVER = 'On hover';

const COLOR_DEFAULT = 'Theme default';
const COLOR_DARK_THEME = '#5f5f5f';
const COLOR_LIGHT_THEME = 'rgba(0,0,0,.3)';

/*
 * Only have one instance and apply config changes directly to it
 *
 * config : {
 *  previewAtTop        : boolean,
 *  previewInLine       : boolean,
 *  previewAsHover      : boolean,
 *  previewOnSelect     : boolean,
 *  previewOnHover      : boolean,
 *  previewAlways       : boolean,
 *  previewItalic       : boolean,
 *  previewLightColor   : string,
 *  previewDarkColor    : string,
 * }
 */
const config = {};

function load() {
  
  // previewLocation
  const location = vscode.workspace.getConfiguration('bracket-peek').previewLocation;
  config.previewAtTop = location == LOCATION_TOP;
  config.previewInLine = location == LOCATION_IN_LINE;
  config.previewAsHover = location == LOCATION_HOVER;
  
  // previewTrigger
  config.previewOnSelect = vscode.workspace.getConfiguration('bracket-peek').previewTrigger == TRIGGER_ONSELECT
  || vscode.workspace.getConfiguration('bracket-peek').previewTrigger == TRIGGER_ONSELECT_AND_ONHOVER;
  
  config.previewOnHover = vscode.workspace.getConfiguration('bracket-peek').previewTrigger == TRIGGER_ONHOVER
  || vscode.workspace.getConfiguration('bracket-peek').previewTrigger == TRIGGER_ONSELECT_AND_ONHOVER;
  
  // previewAlways
  config.previewAlways = vscode.workspace.getConfiguration('bracket-peek').previewAlways;
  
  // previewItalic
  config.previewItalic = vscode.workspace.getConfiguration('bracket-peek').previewItalic;
  
  // previewColor
  const previewColor = vscode.workspace.getConfiguration('bracket-peek').previewColor;
  if (previewColor && previewColor !== COLOR_DEFAULT && isColor(previewColor)) {
    config.previewLightColor = previewColor;
    config.previewDarkColor = previewColor;
  } else {
    config.previewLightColor = COLOR_LIGHT_THEME;
    config.previewDarkColor = COLOR_DARK_THEME;
  }
}

load();

config.init = (context) => {
  
  // Listen for changes
  vscode.workspace.onDidChangeConfiguration((cfg) => {
    if (cfg.affectsConfiguration('bracket-peek')) {
      load();
    }
  }, null, context.subscriptions);
};

module.exports = config;

