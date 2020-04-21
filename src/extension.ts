'use strict';

import { ExtensionContext, FormattingOptions, languages, Position, Range, TextDocument, TextEdit, TextLine, window } from 'vscode';
import { documentFormatter } from './document-formatter';

export function activate(context: ExtensionContext) {
    languages.registerDocumentFormattingEditProvider('sic', documentFormatter);
}
