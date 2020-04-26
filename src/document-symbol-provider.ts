import { DocumentSymbolProvider, TextDocument, CancellationToken, SymbolInformation, SymbolKind, Position, Location } from 'vscode';
import { Token } from './parser/types/tokens';
import { Lexer } from './parser/lexer';
import { Stmt } from './parser/types/statement';
import { Parser } from './parser/parser';
import { LabelAnalysis } from './parser/analysis/labels';
import { Opcode } from './parser/types/opcode';

export class SicDocumentSymbolProvider implements DocumentSymbolProvider {
    public provideDocumentSymbols(document: TextDocument, cancelToken: CancellationToken): Thenable<SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            const stmts = this.parse(this.lex(document.getText()));

            const defStmts = this.getLabelStmts(stmts);

            const symbols = defStmts.map(stmt => {
                const name = stmt.label.label;
                const kind = stmt.op instanceof Opcode ?  SymbolKind.Method : SymbolKind.Variable;
                const position = new Position(stmt.label.location.line, stmt.label.location.startCol);
                const location = new Location(document.uri, position);
                const info = new SymbolInformation(name, kind, '', location);
                return info;
            })

            resolve(symbols);
        });
    }


    lex(source: string): Token[] {
        const lexer = new Lexer(source);
        return lexer.scan();
    }

    parse(tokens: Token[]): Stmt[] {
        const parser = new Parser(tokens);
        return parser.parse();
    }

    getLabelStmts(stmts: Stmt[]): Stmt[] {
        const analysis = new LabelAnalysis(stmts);
        return analysis.labelDefStmts;
    }
}