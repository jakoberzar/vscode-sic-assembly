import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionTriggerKind, CompletionItemKind, SnippetString } from 'vscode';
import { instructions } from './parser/instructions';
import { Lexer } from './parser/lexer';
import { Token, TokenType } from './parser/types/tokens';
import { Parser } from './parser/parser';
import { Stmt } from './parser/types/statement';
import { LabelAnalysis } from './parser/analysis/labels';
import { assemblyRegisters } from './parser/types/registers';

export class SicCompletionItemProvider implements CompletionItemProvider {
    instructionSuggestions: CompletionItem[];
    oneRegisterSuggestions: CompletionItem[];
    twoRegisterSuggestions: CompletionItem[];
    mnemonics: string[];

    constructor() {
        this.initSuggestions();
        this.mnemonics = instructions.map(instr => instr.mnemonic);
    }

    initSuggestions() {
        this.instructionSuggestions = instructions.map(instr => {
            const item = new CompletionItem(instr.mnemonic);
            item.documentation = instr.effect;
            item.commitCharacters = ['\t'];
            item.kind = CompletionItemKind.Method;
            item.insertText = `${instr.mnemonic}\t`;
            if (instr.operands) {
                item.label = instr.mnemonic + ' ' + instr.operands;
                item.detail = instr.mnemonic + ' ' + instr.operands;
                item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions for operands' };
            }
            return item;
        });

        this.oneRegisterSuggestions = assemblyRegisters.map(reg => {
            return new CompletionItem(reg.label, CompletionItemKind.Keyword);
        });

        this.twoRegisterSuggestions = assemblyRegisters.map(reg => {
            const item = new CompletionItem(reg.label, CompletionItemKind.Constant);
            item.insertText = `${reg.label}, `;
            item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions for operands' };
            return item;
        })
    }

    provideCompletionItems(document: TextDocument, position: Position) {
        const line = document.lineAt(position);
        // Old instr found
        // const words = this.splitByWhitespace(line.text);
        // const instrFoundOld = words.find(word => this.mnemonics.includes(word));

        // New instr found
        const tokens = this.lex(document.getText());
        const lineTokens = tokens.filter(token => token.location.line === position.line + 1);
        const instrFound = lineTokens.find(token => token.type === TokenType.Mnemonic);

        // Get labels
        const stmts = this.parse(tokens);
        const labels = this.getLabels(stmts);

        // Check if instructions suggestions should be shown
        const tillPosition = line.text.substring(0, position.character);
        const rightAfterInstr = instrFound && tillPosition.endsWith(instrFound.lexeme);

        let suggestions = [];
        if (instrFound && !rightAfterInstr) {
            const operandSignature = instrFound.value.operands;
            if (operandSignature === 'm') {
                suggestions = this.getLabelSuggestions(labels.data, 'data');
            } else if (operandSignature === 't') {
                suggestions = this.getLabelSuggestions(labels.code, 'code');
            } else if (operandSignature === 'r1') {
                suggestions = this.oneRegisterSuggestions;
            } else if (operandSignature === 'r1, r2') {
                const afterComma = lineTokens.some(token => token.type === TokenType.Comma);
                if (afterComma) {
                    suggestions = this.oneRegisterSuggestions;
                } else {
                    suggestions = this.twoRegisterSuggestions;
                }
            } else if (operandSignature === 'r1, n') {
                const afterComma = lineTokens.some(token => token.type === TokenType.Comma);
                if (!afterComma) {
                    suggestions = this.oneRegisterSuggestions;
                }
            }
        } else {
            suggestions = this.instructionSuggestions;
        }

        return suggestions;
    }

    splitByWhitespace(str: string): string[] {
        const s = str.split(' ').map(word => word.trim().split('\t'));
        const finalWords = [];
        for (const words of s) {
            const trimmed = words.map(word => word.trim()).filter(word => word.length > 0);
            for (const word of trimmed) {
                finalWords.push(word);
            }
        }
        return finalWords;
    }

    lex(source: string): Token[] {
        const lexer = new Lexer(source);
        return lexer.scan();
    }

    parse(tokens: Token[]): Stmt[] {
        const parser = new Parser(tokens);
        return parser.parse();
    }

    getLabels(stmts: Stmt[]) {
        const analysis = new LabelAnalysis(stmts);
        return {
            code: analysis.opcodeLabels,
            data: analysis.dirLabels,
        };
    }

    getLabelSuggestions(labels: string[], type: string): CompletionItem[] {
        return labels.map(label => this.generateLabelSuggestion(label, type))
    }

    generateLabelSuggestion(label: string, type: string): CompletionItem {
        const item = new CompletionItem(label);
        item.kind = (type === 'code') ? CompletionItemKind.Method : CompletionItemKind.Variable;
        return item;
    }
}