import { Location } from './tokens';

export class Label {
    label: string;
    location: Location;
    constructor(label: string, location: Location) {
        this.label = label;
        this.location = location;
    }
}