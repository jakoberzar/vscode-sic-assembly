import { Location } from './tokens';

export class Directive {
    label: string;
    location: Location;
    constructor(label: string, location: Location = null) {
        this.label = label;
        this.location = location;
    }

    requiresOperands(): boolean {
        return this.label !== 'LTORG';
    }

    toString(): string {
        return this.label;
    }
}

function getDirectives(): Directive[] {
    return [
        new Directive('BYTE'),
        new Directive('WORD'),
        new Directive('RESB'),
        new Directive('RESW'),
        new Directive('EQU'),
        new Directive('START'),
        new Directive('END'),
        new Directive('LTORG'),
        new Directive('EXTDEF'),
        new Directive('EXTREF'),
    ]
}

export const directives = getDirectives();