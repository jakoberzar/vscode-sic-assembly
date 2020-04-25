import { Location } from './tokens';

export class ByteLiteral {
    value: string;
    location: Location;
    constructor(value: string, location: Location) {
        this.value = value;
        this.location = location;
    }
}