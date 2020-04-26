import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionTriggerKind, CompletionItemKind, SnippetString } from 'vscode';
import { instructions } from './parser/instructions';
import { Lexer } from './parser/lexer';
import { Token, TokenType } from './parser/types/tokens';
import { Parser } from './parser/parser';
import { Stmt } from './parser/types/statement';
import { LabelAnalysis } from './parser/analysis/labels';
import { assemblyRegisters, relativeRegisters } from './parser/types/registers';
import { directives } from './parser/types/directives';

export class SicCompletionItemProvider implements CompletionItemProvider {
    instructionSuggestions: CompletionItem[];
    directiveSuggestions: CompletionItem[];
    instrDirSuggestions: CompletionItem[];
    oneRegisterSuggestions: CompletionItem[];
    twoRegisterSuggestions: CompletionItem[];
    relativeRegisterSuggestions: CompletionItem[];
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

        this.directiveSuggestions = directives.map(dir => {
            return new CompletionItem(dir.label, CompletionItemKind.Keyword);
        })

        this.instrDirSuggestions = this.instructionSuggestions.concat(this.directiveSuggestions);

        this.oneRegisterSuggestions = assemblyRegisters.map(reg => {
            return new CompletionItem(reg.label, CompletionItemKind.Constant);
        });

        this.twoRegisterSuggestions = assemblyRegisters.map(reg => {
            const item = new CompletionItem(reg.label, CompletionItemKind.Constant);
            item.insertText = `${reg.label}, `;
            item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions for operands' };
            return item;
        })

        this.relativeRegisterSuggestions = relativeRegisters.map(reg => {
            return new CompletionItem(reg.label, CompletionItemKind.Constant);
        });
    }

    provideCompletionItems(document: TextDocument, position: Position) {
        const line = document.lineAt(position);
        // Old instr found
        // const words = this.splitByWhitespace(line.text);
        // const instrFoundOld = words.find(word => this.mnemonics.includes(word));

        const lineParsed = this.parse(this.lex(line.text));
        console.log('line parsed', lineParsed);

        // New instr found
        const tokens = this.lex(document.getText());
        const lineTokens = tokens.filter(token => token.location.line === position.line);
        const instrFound = lineTokens.find(token => token.type === TokenType.Mnemonic);
        const dirFound = lineTokens.find(token => token.type === TokenType.Directive);

        // Get labels
        const stmts = this.parse(tokens);
        const labels = this.getLabels(stmts);

        // Check if instructions suggestions should be shown
        const tillPosition = line.text.substring(0, position.character);
        const rightAfterInstr = instrFound && tillPosition.endsWith(instrFound.lexeme);
        const rightAfterDir = dirFound && tillPosition.endsWith(dirFound.lexeme);

        let suggestions = [];
        if (instrFound && !rightAfterInstr) {
            const operandSignature = instrFound.value.operands;
            const afterComma = lineTokens.some(token => token.type === TokenType.Comma);
            if (operandSignature === 'm') {
                suggestions = (afterComma
                    ? this.relativeRegisterSuggestions
                    : this.getLabelSuggestions(labels.data, 'data')
                );
            } else if (operandSignature === 't') {
                suggestions = this.getLabelSuggestions(labels.code, 'code');
            } else if (operandSignature === 'r1') {
                suggestions = this.oneRegisterSuggestions;
            } else if (operandSignature === 'r1, r2') {
                suggestions = afterComma ? this.oneRegisterSuggestions : this.twoRegisterSuggestions;
            } else if (operandSignature === 'r1, n') {
                if (!afterComma) {
                    suggestions = this.oneRegisterSuggestions;
                }
            }
        } else if (dirFound && !rightAfterDir) {
            suggestions = [];
        } else {
            suggestions = this.instrDirSuggestions;
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