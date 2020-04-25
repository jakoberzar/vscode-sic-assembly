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
}