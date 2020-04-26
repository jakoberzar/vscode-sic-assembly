import { Location } from './tokens';

export class OperandExpr {
    location: Location
    constructor(location) {
        this.location = location;
    }

    toString(): string {
        return '<expr>';
    }
}