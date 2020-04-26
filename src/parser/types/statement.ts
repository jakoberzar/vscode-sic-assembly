import { Label } from './label';
import { Opcode } from './opcode';
import { Directive } from './directives';
import { Operand } from './operand';

export class Stmt {
    label: Label;
    op: Opcode|Directive;
    operands: Operand[];

    constructor(label: Label, op: Opcode|Directive, operands: Operand[]) {
        this.label = label;
        this.op = op;
        this.operands = operands;
    }

    toString(): string {
        let str = '';
        if (this.label) {
            str += this.label.toString() + '\t';
        }

        str += this.op.toString();

        if (this.op.requiresOperands()) {
            str += '\t' + this.operands.map(op => op.toString()).join(', ');
        }

        return str;
    }
}