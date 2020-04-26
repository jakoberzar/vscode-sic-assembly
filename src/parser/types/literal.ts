import { Location } from './tokens';

export class Literal {
    value: number;
    location: Location;
    constructor(value, location: Location) {
        this.value = value;
    }

    toString(): string {
        return '0x' + this.value.toString(16).toUpperCase();
    }
}