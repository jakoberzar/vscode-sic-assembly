'use strict';

import { ExtensionContext, languages } from 'vscode';
import { documentFormatter } from './document-formatter';
import { SicCompletionItemProvider } from './completion-provider';
import { SicDefinitionProvider } from './definition-provider';
import { SicDocumentSymbolProvider } from './document-symbol-provider';

export function activate(context: ExtensionContext) {
    const providerFormatting = languages.registerDocumentFormattingEditProvider('sic', documentFormatter);
    const providerCompletion = languages.registerCompletionItemProvider('sic', new SicCompletionItemProvider(), '\t ');
    const providerDefinition = languages.registerDefinitionProvider('sic', new SicDefinitionProvider());
    const providerDocumentSymbols = languages.registerDocumentSymbolProvider('sic', new SicDocumentSymbolProvider());
    context.subscriptions.push(providerFormatting, providerCompletion, providerDefinition, providerDocumentSymbols);
}
