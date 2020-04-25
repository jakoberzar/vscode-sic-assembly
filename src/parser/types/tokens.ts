export class Location {
    line: number;
    startCol: number;
    endCol: number;

    constructor(line: number, startCol: number, endCol: number) {
        this.line = line;
        this.startCol = startCol;
        this.endCol = endCol;
    }
}

export enum TokenType {
    Symbol,
    Directive,
    Register,
    Mnemonic,
    Literal,
    ByteLiteral,

    // Operators
    Plus,
    Minus,
    Slash,
    Star,
    Hash,
    At,
    Comma,
    Equals,

    // Whitespace
    NewLine,
}

export interface Token {
    type: TokenType,
    lexeme: string,
    value: any,
    location: Location,
}