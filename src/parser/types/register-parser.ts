import { Register } from './registers';
import { Location } from './tokens';

export class RegisterParser {
    reg: Register;
    location: Location;
    constructor(reg: Register, location: Location) {
        this.reg = reg;
        this.location = location;
    }
}