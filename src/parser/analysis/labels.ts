import { Stmt } from '../types/statement';
import { Opcode } from '../types/opcode';
import { Directive } from '../types/directives';
import { Label } from '../types/label';
import { Location } from '../types/tokens';

export class LabelAnalysis {
    stmts: Stmt[];

    opcodeStmts: Stmt[];
    dirStmts: Stmt[];
    labelDefStmts: Stmt[]; // opcode + dir
    labelDefMap: Map<string, Stmt>;
    labelUseLocs: Map<string, Location[]>;

    constructor(stmts: Stmt[]) {
        this.stmts = stmts;
        this.opcodeStmts = [];
        this.dirStmts = [];
        this.labelDefStmts = [];
        this.labelDefMap = new Map();
        this.labelUseLocs = new Map();
        this.findDefStmts();
        this.findUseStmts();
    }

    private findDefStmts() {
        this.labelDefStmts = this.stmts.filter(stmt => stmt.label);
        this.labelDefStmts.forEach(stmt => {
            if (stmt.op instanceof Opcode) {
                this.opcodeStmts.push(stmt);
            } else if (stmt.op instanceof Directive) {
                this.dirStmts.push(stmt);
            }

            // Add to maps
            const name = stmt.label.label;
            this.labelDefMap.set(name, stmt);
        });
    }

    private findUseStmts() {
        const labelUseStmts = this.stmts.filter(stmt => {
            return stmt.operands && stmt.operands.some(op => op.value instanceof Label)
        }).forEach(stmt => {
            const label = stmt.operands.find(op => op.value instanceof Label).value as Label;
            const name = label.label;
            const location = label.location;
            if (this.labelUseLocs.has(name)) {
                this.labelUseLocs.get(name).push(location);
            } else {
                this.labelUseLocs.set(name, [location]);
            }
        })
    }

    get opcodeLabels() {
        return this.opcodeStmts.map(stmt => stmt.label.label);
    }

    get dirLabels() {
        return this.dirStmts.map(stmt => stmt.label.label);
    }

}