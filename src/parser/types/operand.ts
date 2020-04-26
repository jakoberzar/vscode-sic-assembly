import { Label } from './label';
import { Literal } from './literal';
import { ByteLiteral } from './byteliteral';
import { RegisterParser } from './register-parser';
import { Location } from './tokens';
import { OperandExpr } from './operand-expr';

export class Operand {
    value: Label|Literal|ByteLiteral|RegisterParser|OperandExpr;
    location: Location;
    constructor(val: any, location: Location) {
        this.value = val;
        this.location = location;
    }

    toString(): string {
        return this.value.toString();
    }
}