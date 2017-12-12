const parser = require('color-parse');
const { Color } = require('vscode');

const IMPORT_REGEX = /@import\s+"([^"]+)"/g;
const COLOR_VARIABLE_REGEX = /(\$[^:]+):\s*(#[0-9a-fA-F]{3,6}|rgba?\(\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[0-9\.]+)?\))/g;
const VARIABLE_REGEX = /\$[^;]+/g;

class FileParser {
  constructor() {
    this.cache = {};
  }

  has(document) {
    const { fileName } = document;

    return this.cache[fileName];
  }

  parse(document, force = false) {
    if (this.has(document) && !force) {
      return this.has(document);
    }

    const text = document.getText();
    return this.parseString(text, document.fileName);
  }

  parseString(text, path) {
    const result = { imports: [], colors: [], variables: [] };
    
        let match;
        while (match = IMPORT_REGEX.exec(text)) {
          result.imports.push(match[1]);
        }

        while(match = COLOR_VARIABLE_REGEX.exec(text)) {
          const color = parser(match[2]);

          result.colors.push({
            key: match[1],
            value: new Color(...color.values, color.alpha),
            index: match.index,
            length: match[0].length,
          });
        }

        while(match = VARIABLE_REGEX.exec(text)) {
          result.variables.push({
            key: match[0],
            index: match.index,
            length: match[0].length,
          });
        }
    
        this.cache[path] = result;
        return result;
  }
}

module.exports = new FileParser();
