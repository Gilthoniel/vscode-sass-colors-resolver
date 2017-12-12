const vscode = require('vscode');

const DocumentColorProvider = require('./document-color-provider');
const CompletionProvider = require('./completion-provider');

function activate() {
    const provider = new DocumentColorProvider();

    vscode.languages.registerColorProvider('scss', provider);
    vscode.languages.registerCompletionItemProvider('scss', new CompletionProvider(), ['$']);
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
