import { TextDocument, Position, CancellationToken, Location, ReferenceProvider } from 'vscode';
import { Location as tkLocation, Token } from './parser/types/tokens';
import { Lexer } from './parser/lexer';
import { Stmt } from './parser/types/statement';
import { Parser } from './parser/parser';
import { LabelAnalysis } from './parser/analysis/labels';

export class SicReferenceProvider implements ReferenceProvider {
    public provideReferences(document: TextDocument, position: Position, options: { includeDeclaration: boolean}, cancelToken: CancellationToken): Thenable<Location[]> {
        return new Promise((resolve, reject) => {
            const tokens = this.lex(document.getText());
            const stmts = this.parse(tokens);

            const lineTokens = tokens.filter(token => token.location.line === position.line);
            const curToken = lineTokens.find(token => (
                token.location.startCol <= position.character
                && token.location.endCol + 1 >= position.character // add one additional column to right
            ));

            const analysis = new LabelAnalysis(stmts);
            const defStmtMap = analysis.labelDefMap;
            const useLocMap = analysis.labelUseLocs;

            const locs = [];
            if (curToken) {
                if (useLocMap.has(curToken.value)) {
                    const useLocs = useLocMap.get(curToken.value);
                    for (const tkLoc of useLocs) {
                        const pos = new Position(tkLoc.line, tkLoc.startCol);
                        locs.push(new Location(document.uri, pos));
                    }
                }

                if (options.includeDeclaration) {
                    const defStmt = defStmtMap.get(curToken.value);
                    const defLoc = defStmt.label.location;
                    const defPos = new Position(defLoc.line, defLoc.startCol);
                    locs.push(new Location(document.uri, defPos));
                }
            }

            resolve(locs);
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

}