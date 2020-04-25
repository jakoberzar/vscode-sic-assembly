import { Stmt } from '../types/statement';
import { Opcode } from '../types/opcode';
import { Directive } from '../types/directives';

export class LabelAnalysis {
    stmts: Stmt[];

    opcodeStmts: Stmt[];
    dirStmts: Stmt[];

    constructor(stmts: Stmt[]) {
        this.stmts = stmts;
        this.opcodeStmts = [];
        this.dirStmts = [];
        this.findStmts();
    }

    private findStmts() {
        this.stmts
            .filter(stmt => stmt.label)
            .forEach(stmt => {
                if (stmt.op instanceof Opcode) {
                    this.opcodeStmts.push(stmt);
                } else if (stmt.op instanceof Directive) {
                    this.dirStmts.push(stmt);
                }
            });
    }

    get opcodeLabels() {
        return this.opcodeStmts.map(stmt => stmt.label.label);
    }

    get dirLabels() {
        return this.dirStmts.map(stmt => stmt.label.label);
    }

}