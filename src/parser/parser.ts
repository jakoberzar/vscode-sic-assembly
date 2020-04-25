import { Token, TokenType } from './types/tokens';
import { Stmt } from './types/statement';
import { Label } from './types/label';
import { Opcode } from './types/opcode';
import { Directive } from './types/directives';
import { Operand } from './types/operand';
import { Literal } from './types/literal';
import { ByteLiteral } from './types/byteliteral';
import { RegisterParser } from './types/register-parser';
import { ErrorStmt } from './types/error-statement';

export class Parser {
    current: number;
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.current = 0;
        this.tokens = tokens;
    }

    parse(): Stmt[] {
        // Skip starting new lines
        while (!this.isAtEnd() && this.match(TokenType.NewLine)) {
            this.advance();
        }
        return this.parseStmts();
    }

    isAtEnd(): boolean {
        return this.current >= this.tokens.length;
    }

    peek(): Token {
        return this.tokens[this.current];
    }

    advance() {
        const token = this.tokens[this.current];
        this.current++;
        return token;
    }

    match(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        else return this.peek().type === type;
    }

    parseStmts(): Stmt[] {
        let stmts = [];
        const first = this.parseStmt();
        stmts.push(first);
        if (this.match(TokenType.NewLine)) {
            while (this.match(TokenType.NewLine)) {
                this.advance();
            }
            if (!this.isAtEnd()) {
                const nextStmts = this.parseStmts();
                stmts = stmts.concat(nextStmts);
            }
        }
        return stmts;
    }

    parseStmt(): Stmt {
        let label = null;
        if (this.match(TokenType.Symbol)) {
            label = this.parseLabel();
        }

        if (this.match(TokenType.NewLine)) {
            this.advance();
        }

        const opdir = this.parseOpDir();

        const operands = this.parseOperands();

        let stmt = null;
        if (opdir === null || operands === null) {
            stmt = new ErrorStmt(label, opdir, operands);
        } else {
            stmt = new Stmt(label, opdir, operands);
        }

        // Get to next new line to sync (if in error state)
        while (!this.isAtEnd() && !(this.match(TokenType.NewLine))) {
            this.advance();
        }

        return stmt;
    }

    parseLabel(): Label {
        const token = this.advance();
        return new Label(token.value, token.location);
    }

    parseOpDir(): Opcode|Directive {
        let opdir = null;
        if (this.match(TokenType.Plus)) {
            this.advance();
            opdir = this.parseMnemonic();
        } else if (this.match(TokenType.Mnemonic)) {
            opdir = this.parseMnemonic();
        } else if (this.match(TokenType.Directive)) {
            opdir = this.parseDirective();
        }

        return opdir
    }

    parseMnemonic(): Opcode {
        const token = this.advance();
        const opcode = new Opcode(token.value, token.location);
        return opcode;
    }

    parseDirective(): Directive {
        const token = this.advance();
        const dir = new Directive(token.value.label, token.location);
        return dir;
    }

    parseOperands(): Operand[] {
        if (this.match(TokenType.At) || this.match(TokenType.Hash) || this.match(TokenType.Equals)) {
            this.advance();
        }

        const operands = [];
        const firstOperand = this.parseOperand();
        if (firstOperand === null) {
            return null;
        } else {
            operands.push(firstOperand);
        }

        if (this.match(TokenType.Comma)) {
            this.advance();
            const secondOperand = this.parseOperand();
            if (secondOperand === null) {
                return operands;
            } else {
                operands.push(secondOperand);
            }
        }

        return operands;
    }

    parseOperand(): Operand {
        let val = null;
        if (this.match(TokenType.Symbol)) {
            val = this.parseLabel();
        } else if (this.match(TokenType.Literal)) {
            val = this.parseLiteral();
        } else if (this.match(TokenType.ByteLiteral)) {
            val = this.parseByteLiteral();
        } else if (this.match(TokenType.Register)) {
            val = this.parseRegister();
        }

        let operand = null;
        if (val) {
            operand = new Operand(val, val.location);
        }

        return operand;
    }

    parseLiteral(): Literal {
        const token = this.advance();
        const literal = new Literal(token.value, token.location);
        return literal;
    }

    parseByteLiteral(): ByteLiteral {
        const token = this.advance();
        const byteLiteral = new ByteLiteral(token.value, token.location);
        return byteLiteral;
    }

    parseRegister(): RegisterParser {
        const token = this.advance();
        const register = new RegisterParser(token.value, token.location);
        return register;
    }

}