import { Location } from './tokens';

export class Literal {
    value: number;
    location: Location;
    constructor(value, location: Location) {
        this.value = value;
    }
}