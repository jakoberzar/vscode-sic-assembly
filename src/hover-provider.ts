import { TextDocument, Position, CancellationToken, Location, HoverProvider, Hover, MarkdownString, Range } from 'vscode';
import { Location as tkLocation, Token, TokenType } from './parser/types/tokens';
import { Lexer } from './parser/lexer';
import { Stmt } from './parser/types/statement';
import { Parser } from './parser/parser';
import { LabelAnalysis } from './parser/analysis/labels';
import { Instruction, Format } from './parser/instructions';

export class SicHoverProvider implements HoverProvider {
    public provideHover(document: TextDocument, position: Position, cancelToken: CancellationToken): Thenable<Hover> {
        return new Promise((resolve, reject) => {
            const tokens = this.lex(document.getText());
            const stmts = this.parse(tokens);

            const lineTokens = tokens.filter(token => token.location.line === position.line);
            const curToken = lineTokens.find(token => (
                token.location.startCol <= position.character
                && token.location.endCol + 1 >= position.character // add one additional column to right
            ));

            if (!curToken) {
                resolve();
                return;
            }

            const tkLoc = curToken.location;
            const range = new Range(new Position(tkLoc.line, tkLoc.startCol), new Position(tkLoc.line, tkLoc.endCol + 1));
            if (curToken.type === TokenType.Mnemonic) {
                // Return mnemonic hover
                const inst = curToken.value as Instruction;
                const format = inst.format < Format.ThreeFour ? inst.format.toString() : '3/4';
                const operands = (inst.operands ? `\t${inst.operands}` : '');
                const doc = new MarkdownString(
                    inst.mnemonic + operands + `\n\n` +
                    `----\n\n` +
                    `*(Format ${format})*\n\n` +
                    `**${inst.effect}**\n`
                );
                const hover = new Hover(doc, range);
                resolve(hover);
            } else if (curToken.type === TokenType.Symbol) {
                // Return symbol hover
                const labelMap = this.getLabelDefMap(stmts);
                if (curToken && labelMap.has(curToken.value)) {
                    const defStmt = labelMap.get(curToken.value);
                    const hover = new Hover({ language: 'sic', value: defStmt.toString()}, range);
                    resolve(hover);
                }
            }

            resolve();
        })
    }

    lex(source: string): Token[] {
        const lexer = new Lexer(source);
        return lexer.scan();
    }

    parse(tokens: Token[]): Stmt[] {
        const parser = new Parser(tokens);
        return parser.parse();
    }

    getLabelDefMap(stmts: Stmt[]): Map<string, Stmt> {
        const analysis = new LabelAnalysis(stmts);
        return analysis.labelDefMap;
    }

}