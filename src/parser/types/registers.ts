export enum Registers {
    A,
    X,
    L,
    S,
    T,
    B,
    SW,
    F,
    PC
}

export interface Register {
    type: Registers,
    label: string,
}

/**
 * Registers that can appear in an assembly file
 */
function getAssemblyRegisters(): Register[] {
    return [
        { type: Registers.A, label: 'A' },
        { type: Registers.X, label: 'X' },
        { type: Registers.L, label: 'L' },
        { type: Registers.S, label: 'S' },
        { type: Registers.T, label: 'T' },
        { type: Registers.B, label: 'B' },
        { type: Registers.F, label: 'F' },
    ]
}

function getRelativeRegisters(): Register[] {
    return [
        { type: Registers.X, label: 'X' },
        { type: Registers.B, label: 'B' },
    ];
}

export const assemblyRegisters = getAssemblyRegisters();
export const relativeRegisters = getRelativeRegisters();