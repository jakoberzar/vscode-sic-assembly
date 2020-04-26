import { Stmt } from '../types/statement';
import { Opcode } from '../types/opcode';
import { Directive } from '../types/directives';
import { Label } from '../types/label';

export class LabelAnalysis {
    stmts: Stmt[];

    opcodeStmts: Stmt[];
    dirStmts: Stmt[];
    labelDefStmts: Stmt[]; // opcode + dir
    labelDefMap: Map<string, Stmt>;

    constructor(stmts: Stmt[]) {
        this.stmts = stmts;
        this.opcodeStmts = [];
        this.dirStmts = [];
        this.labelDefStmts = [];
        this.labelDefMap = new Map();
        this.findDefStmts();
    }

    private findDefStmts() {
        this.labelDefStmts = this.stmts.filter(stmt => stmt.label);
        this.labelDefStmts.forEach(stmt => {
            if (stmt.op instanceof Opcode) {
                this.opcodeStmts.push(stmt);
            } else if (stmt.op instanceof Directive) {
                this.dirStmts.push(stmt);
            }
            this.labelDefMap.set(stmt.label.label, stmt);
        });
    }

    get opcodeLabels() {
        return this.opcodeStmts.map(stmt => stmt.label.label);
    }

    get dirLabels() {
        return this.dirStmts.map(stmt => stmt.label.label);
    }

}