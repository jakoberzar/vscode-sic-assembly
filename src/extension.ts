'use strict';

import { ExtensionContext, FormattingOptions, languages, Position, Range, TextDocument, TextEdit, TextLine, window } from 'vscode';
import { documentFormatter } from './document-formatter';
import { SicCompletionItemProvider } from './completion-provider';

export function activate(context: ExtensionContext) {
    languages.registerDocumentFormattingEditProvider('sic', documentFormatter);
    languages.registerCompletionItemProvider('sic', new SicCompletionItemProvider(), '\t ')
}
