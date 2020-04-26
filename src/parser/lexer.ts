import { Token, TokenType, Location } from './types/tokens';
import { Register, assemblyRegisters } from './types/registers';
import { Directive, directives } from './types/directives';
import { Instruction, instructions } from './instructions';

export class Lexer {
    tokens: Token[];
    line: number;
    column: number;
    current: number;

    constructor(private source: string) {
        this.tokens = [];
        this.line = 0;
        this.column = 0;
        this.current = 0;
    }

    /**
     * The main method of this class - tokenize the source file
     */
    scan(): Token[] {
        while (!this.isAtEnd()) {
            this.scanToken();
        }
        return this.tokens;
    }

    private scanToken() {
        const char = this.peek();
        switch (char) {
            // Simple operators
            case '+': this.addTokenOperator(TokenType.Plus); break;
            case '-': this.addTokenOperator(TokenType.Minus); break;
            case '/': this.addTokenOperator(TokenType.Slash); break;
            case '*': this.addTokenOperator(TokenType.Star); break;
            case '#': this.addTokenOperator(TokenType.Hash); break;
            case '@': this.addTokenOperator(TokenType.At); break;
            case ',': this.addTokenOperator(TokenType.Comma); break;
            case '=': this.addTokenOperator(TokenType.Equals); break;
            // Comment
            case '.': this.skipComment(); break;
            // Whitespace
            case '\n':
                this.addTokenOperator(TokenType.NewLine);
                break;
            case ' ':
            case '\r':
            case '\t':
                break;

            // Other cases
            default:
                if (this.isDigit(char)) {
                    this.parseNumber();
                } else if (this.isAlpha(char)) {
                    this.parseString();
                }
                break;
        }
        this.advance();
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length
    }

    private peek(): string {
        return this.source[this.current];
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        else return this.source[this.current + 1];
    }

    private advance(): string {
        const char = this.source[this.current];
        this.current++;
        this.column++;
        if (char === '\n') {
            this.line++;
            this.column = 0;
        }
        return char;
    }

    private addTokenOperator(type: TokenType) {
        const lexeme = this.source[this.current];
        const location = new Location(this.line, this.column, this.column);
        this.addToken({ type, lexeme, value: null, location });
    }

    private addToken(token: Token) {
        this.tokens.push(token);
    }

    private isDigit(char: string, radix: number = 10): boolean {
        return !isNaN(parseInt(char, radix));
    }

    private isAlpha(char: string) {
        const code = char.charCodeAt(0);
        return (code > 64 && code < 91 // upper alpha (A-Z)
            || code > 96 && code < 123 // lower alpha (a-z)
            || code === 95 // underscore (_)
        );
    }

    private isAlphaNumeric(char: string) {
        return this.isAlpha(char) || this.isDigit(char);
    }

    private skipComment() {
        while (!this.isAtEnd() && this.peekNext() !== '\n') {
            this.advance();
        }
    }

    private parseNumber() {
        const startCur = this.current;
        const startCol = this.column;

        let value: number;
        let radix = 10;
        // Handle hex and binary formats
        if (this.peek() === '0' && ['b', 'x'].includes(this.peekNext())) {
            // Consume 0 and get the letter
            const letter = this.advance();
            radix = letter === 'b' ? 2 : 16;
            // Consume the letter
            this.advance();
        }

        // Build the number
        let str = '';
        while (!this.isAtEnd() && this.isDigit(this.peekNext(), radix)) {
            str += this.advance();
        }
        str += this.peek();
        value = parseInt(str, radix);

        // Create the token
        const token = {
            type: TokenType.Literal,
            lexeme: this.source.substring(startCur, this.current + 1),
            value,
            location: new Location(this.line, startCol, this.column),
        }

        // And add it
        this.addToken(token);
    }

    private parseString() {
        const startCur = this.current;
        const startCol = this.column;

        // Get the whole string
        let str = '';
        while (!this.isAtEnd() && this.isAlphaNumeric(this.peekNext())) {
            str += this.advance();
        }
        str += this.peek();

        // Special case; X || C literal
        if (['X', 'C'].includes(str) && this.peekNext() === '\'') {
            this.parseQuoteLiteral();
            return;
        }

        const location = new Location(this.line, startCol, this.column);

        const instr = this.matchInstructions(str);
        if (instr) {
            this.addToken({ type: TokenType.Mnemonic, lexeme: str, value: instr, location });
            return;
        }

        const dir = this.matchDirectives(str);
        if (dir) {
            this.addToken({ type: TokenType.Directive, lexeme: str, value: dir, location });
            return;
        }

        const reg = this.matchRegs(str);
        if (reg) {
            this.addToken({ type: TokenType.Register, lexeme: str, value: reg, location });
            return;
        }

        // If nothing matched, it is a symbol!
        this.addToken({ type: TokenType.Symbol, lexeme: str, value: str, location });
    }

    private parseQuoteLiteral() {
        const startCur = this.current;
        const startCol = this.column;

        const mode = this.peek();

        // Consume first letter and '
        this.advance();
        this.advance();

        // Parse the quote content
        let str = '';
        while (!this.isAtEnd() && this.peek() !== '\'') {
            str += this.advance();
        }

        // Get the location and lexeme
        const location = new Location(this.line, startCol, this.column);
        const lexeme = this.source.substring(startCur, this.current + 1);

        // Create the token
        let type = null;
        let value = null;
        if (mode === 'C') {
            type = TokenType.ByteLiteral;
            value = [];
            for (let i = 0; i < str.length; i++) {
                value.push(str.charCodeAt(i));
            }
        } else if (mode === 'X') {
            type = TokenType.Literal;
            value = parseInt(str, 16);
        } else {
            console.log(`Unknown mode ${mode} at ${this.line}:${startCol}.`);
            return;
        }

        const token: Token = { type, lexeme, value, location };
        this.addToken(token);
    }

    private matchRegs(str: string): Register {
        return assemblyRegisters.find(reg => reg.label === str);
    }

    private matchDirectives(str: string): Directive {
        return directives.find(dir => dir.label === str);
    }

    private matchInstructions(str: string): Instruction {
        return instructions.find(instr => instr.mnemonic === str);
    }


}