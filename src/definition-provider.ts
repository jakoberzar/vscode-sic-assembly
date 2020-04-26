import { DefinitionProvider, TextDocument, Position, CancellationToken, Location } from 'vscode';
import { Location as tkLocation, Token } from './parser/types/tokens';
import { Lexer } from './parser/lexer';
import { Stmt } from './parser/types/statement';
import { Parser } from './parser/parser';
import { LabelAnalysis } from './parser/analysis/labels';

export class SicDefinitionProvider implements DefinitionProvider {
    public provideDefinition(document: TextDocument, position: Position, cancelToken: CancellationToken): Thenable<Location> {
        return new Promise((resolve, reject) => {
            const tokens = this.lex(document.getText());
            const stmts = this.parse(tokens);

            const lineTokens = tokens.filter(token => token.location.line === position.line);
            const curToken = lineTokens.find(token => (
                token.location.startCol <= position.character
                && token.location.endCol + 1 >= position.character // add one additional column to right
            ));

            const labelMap = this.getLabelDefMap(stmts);
            if (curToken && labelMap.has(curToken.value)) {
                const defStmt = labelMap.get(curToken.value);
                const defLoc = defStmt.label.location;
                const defPos = new Position(defLoc.line, defLoc.startCol);
                const loc = new Location(document.uri, defPos);
                resolve(loc);
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