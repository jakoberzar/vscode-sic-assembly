import { Instruction } from '../instructions';
import { Location } from './tokens';

export class Opcode {
    instr: Instruction;
    location: Location;
    constructor(instr: Instruction, location: Location) {
        this.instr = instr;
        this.location = location;
    }

    requiresOperands(): boolean {
        return this.instr.operands !== null;
    }

    toString(): string {
        return this.instr.mnemonic;
    }
}