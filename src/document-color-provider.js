const { workspace, ColorInformation, ColorPresentation, Range } = require('vscode');
const fs = require('fs');
const has = require('has');

const FileParser = require('./file-parser');

class DocumentColorProvider {
  provideColorPresentations({ red, green, blue, alpha }) {
    return [
      new ColorPresentation(`rgba(${red}, ${green}, ${blue}, ${alpha})`),
    ];
  }

  provideDocumentColors(document) {
    const result = FileParser.parse(document, true);
    const promises = result.imports.map(this.resolveVariables);
    const currentDocMapping = result.colors.reduce((map, color) => {
      map[color.key] = color.value;
      return map;
    }, {});
      
    return Promise.all(promises).then(results => Object.assign(...results, currentDocMapping)).then(
      (map) => result.variables
        .filter(v => has(map, v.key))
        .map(v => {
          const start = document.positionAt(v.index);
          const end = document.positionAt(v.index + v.length);
          return new ColorInformation(new Range(start, end), map[v.key]);
        }),
      console.err
    );
  }

  resolveVariables(uri) {
    const pattern = '**/' + uri.replace(/^((.{1,2})?\/)/, '');

    return workspace.findFiles(pattern).then((files) => files.reduce((map, file) => {
      const content = fs.readFileSync(file.path);
      const result = FileParser.parseString(content, file.path);

      result.colors.forEach((v) => map[v.key] = v.value);
      return map;
    }, {}));
  }
}

module.exports = DocumentColorProvider;
