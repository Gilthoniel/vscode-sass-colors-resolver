const { workspace, CompletionItem, CompletionItemKind } = require('vscode');
const fs = require('fs');

const FileParser = require('./file-parser');

class CompletionProvider {
  provideCompletionItems(document) {
    const parsing = FileParser.parse(document);
    const promises = parsing.imports.map(this.resolveVariables);

    return Promise.all(promises).then(results => Object.assign(...results)).then(
      (mapping) => Object.keys(mapping).map(key => new ColorCompletionItem(
        key,
        mapping[key]
      ))
    );
  }

  resolveCompletionItem(item) {
    item.resolve();
    return item;
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

class ColorCompletionItem extends CompletionItem {
  constructor(key, color) {
    const label = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
    super(label, CompletionItemKind.Color);

    this.filterText = key;
    this.insertText = key;
    this.sortText = key;
    this.color = color;
  }

  resolve() {
    this.detail = this.filterText;
  }
}

module.exports = CompletionProvider;
