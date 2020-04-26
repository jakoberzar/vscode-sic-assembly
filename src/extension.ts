'use strict';

import { ExtensionContext, languages } from 'vscode';
import { documentFormatter } from './document-formatter';
import { SicCompletionItemProvider } from './completion-provider';
import { SicDefinitionProvider } from './definition-provider';
import { SicDocumentSymbolProvider } from './document-symbol-provider';
import { SicReferenceProvider } from './reference-provider';
import { SicHoverProvider } from './hover-provider';

export function activate(context: ExtensionContext) {
    const providerFormatting = languages.registerDocumentFormattingEditProvider('sic', documentFormatter);
    const providerCompletion = languages.registerCompletionItemProvider('sic', new SicCompletionItemProvider(), '\t ');
    const providerDefinition = languages.registerDefinitionProvider('sic', new SicDefinitionProvider());
    const providerDocumentSymbols = languages.registerDocumentSymbolProvider('sic', new SicDocumentSymbolProvider());
    const providerReference = languages.registerReferenceProvider('sic', new SicReferenceProvider());
    const providerHover = languages.registerHoverProvider('sic', new SicHoverProvider());

    context.subscriptions.push(
        providerFormatting,
        providerCompletion,
        providerDefinition,
        providerDocumentSymbols,
        providerReference,
        providerHover
    );
}
