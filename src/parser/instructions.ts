export enum Format {
    One,
    Two,
    ThreeFour,
}

export interface Instruction {
    mnemonic: string;
    operands: string;
    effect: string;
    format: Format;
}

function createFormat1Instrs(): Instruction[] {
    const format1 = [
        { mnemonic: 'FIX', effect: 'A <- (F) [convert to integer]' },
        { mnemonic: 'FLOAT', effect: 'F <- (A) [convert to floating]' },
        { mnemonic: 'HIO', effect: 'Halt I/O channel number (A)' },
        { mnemonic: 'NORM', effect: 'F <- (F) [normalized]' },
        { mnemonic: 'SIO', effect: 'Start I/O channel number (A); address of channel program is given by (S)' },
        { mnemonic: 'TIO', effect: 'Test I/O channel number (A)' },
    ].map(instr => {
        // Append format and operands
        return {
            ...instr,
            operands: null,
            format: Format.One,
        };
    });

    return format1;
}

function createFormat2Instrs(): Instruction[] {
    const format2 = [
        { mnemonic: 'ADDR', operands: 'r1, r2', effect: 'r2 <- (r2) + (r1)' },
        { mnemonic: 'CLEAR', operands: 'r1', effect: 'r1 <- 0' },
        { mnemonic: 'COMPR', operands: 'r1, r2', effect: '(r1) : (r2)' },
        { mnemonic: 'DIVR', operands: 'r1, r2', effect: 'r2 <- (r2) / (r1)' },
        { mnemonic: 'MULR', operands: 'r1, r2', effect: 'r2 <- (r2) * (r1)' },
        { mnemonic: 'RMO', operands: 'r1, r2', effect: 'r2 <- (r1)' },
        { mnemonic: 'SHIFTL', operands: 'r1, n', effect: 'r1 <- (r1); left circular shift n bits.' },
        { mnemonic: 'SHIFTR', operands: 'r1, n', effect: 'r1 <- (r1); right shift n bits, with vacated bit positions set equal to leftmost bit of (r1).' },
        { mnemonic: 'SUBR', operands: 'r1, r2', effect: 'r2 <- (r2) - (r1)' },
        { mnemonic: 'SVC', operands: 'n', effect: 'Generate SVC interrupt.' },
        { mnemonic: 'TIXR', operands: 'r1', effect: 'X <- (X) + 1; (X) : (r1)' },
    ].map(instr => {
        // Append format
        return {
            ...instr,
            format: Format.Two,
        };
    });

    return format2;
}

function createFormat3Instrs(): Instruction[] {
    const arithmeticLogic = [
        { mnemonic: 'ADD', operands: 'm', effect: 'A <- (A) + (m..m+2)' },
        { mnemonic: 'AND', operands: 'm', effect: 'A <- (A) & (m..m+2)' },
        { mnemonic: 'DIV', operands: 'm', effect: 'A <- (A) / (m..m+2)' },
        { mnemonic: 'MUL', operands: 'm', effect: 'A <- (A) * (m..m+2)' },
        { mnemonic: 'OR', operands: 'm', effect: 'A <- (A) | (m..m+2)' },
        { mnemonic: 'SUB', operands: 'm', effect: 'A <- (A) - (m..m+2)' },
    ];

    const loadStore = [
        { mnemonic: 'LDA', operands: 'm', effect: 'A <- (m..m+2)' },
        { mnemonic: 'LDB', operands: 'm', effect: 'B <- (m..m+2)' },
        { mnemonic: 'LDCH', operands: 'm', effect: 'A[rightmost byte] <- (m)' },
        { mnemonic: 'LDL', operands: 'm', effect: 'L <- (m..m+2)' },
        { mnemonic: 'LDS', operands: 'm', effect: 'S <- (m..m+2)' },
        { mnemonic: 'LDT', operands: 'm', effect: 'T <- (m..m+2)' },
        { mnemonic: 'LDX', operands: 'm', effect: 'X <- (m..m+2)' },
        { mnemonic: 'STA', operands: 'm', effect: '(m..m+2) <- (A)' },
        { mnemonic: 'STB', operands: 'm', effect: '(m..m+2) <- (B)' },
        { mnemonic: 'STCH', operands: 'm', effect: 'm <- (A)[rightmost byte]' },
        { mnemonic: 'STL', operands: 'm', effect: '(m..m+2) <- (L)' },
        { mnemonic: 'STS', operands: 'm', effect: '(m..m+2) <- (S)' },
        { mnemonic: 'STSW', operands: 'm', effect: '(m..m+2) <- (SW)' },
        { mnemonic: 'STT', operands: 'm', effect: '(m..m+2) <- (T)' },
        { mnemonic: 'STX', operands: 'm', effect: '(m..m+2) <- (X)' },
    ];

    const control = [
        { mnemonic: 'COMP', operands: 'm', effect: '(A) : (m..m+2)' },
        { mnemonic: 'J', operands: 't', effect: 'PC <- t' },
        { mnemonic: 'JEQ', operands: 't', effect: 'PC <- t if CC set to =' },
        { mnemonic: 'JGT', operands: 't', effect: 'PC <- t if CC set to >' },
        { mnemonic: 'JLT', operands: 't', effect: 'PC <- t if CC set to <' },
        { mnemonic: 'JSUB', operands: 't', effect: 'L <- (PC); PC <- t' },
        { mnemonic: 'RSUB', operands: null, effect: 'PC <- (L)' },
        { mnemonic: 'TIX', operands: 'm', effect: 'X <- (X) + 1; (X) : (m..m+2)' },
    ];

    const floating = [
        { mnemonic: 'ADDF', operands: 'm', effect: 'F <- (F) + (m..m+5)' },
        { mnemonic: 'COMPF', operands: 'm', effect: '(F) : (m..m+5)' },
        { mnemonic: 'DIVF', operands: 'm', effect: 'F <- (F) / (m..m+5)' },
        { mnemonic: 'LDF', operands: 'm', effect: 'F <- (m..m+5)' },
        { mnemonic: 'MULF', operands: 'm', effect: 'F <- (F) * (m..m+5)' },
        { mnemonic: 'STF', operands: 'm', effect: '(m..m+5) <- (F)' },
        { mnemonic: 'SUBF', operands: 'm', effect: 'F <- (F) - (m..m+5)' },
    ];

    const other = [
        { mnemonic: 'LPS', operands: 'm', effect: 'Load processor status from information beginning at address m' },
        { mnemonic: 'RD', operands: 'm', effect: 'A[rightmost byte] <- data from device specified by (m)' },
        { mnemonic: 'SSK', operands: 'm', effect: 'Protection key for address m <- (A)' },
        { mnemonic: 'STI', operands: 'm', effect: 'Interval timer value <- (m..m+2)' },
        { mnemonic: 'TD', operands: 'm', effect: 'Test device specified by (m)' },
        { mnemonic: 'WD', operands: 'm', effect: 'Device specified by (m) <- (A)[rightmost byte]' },
    ];

    const format3 = [
        ...arithmeticLogic,
        ...loadStore,
        ...control,
        ...floating,
        ...other,
    ].map(instr => {
        // Append format
        return {
            ...instr,
            format: Format.ThreeFour,
        };
    });

    console.log(format3);

    return format3;
}

function createInstructions(): Instruction[] {
    return [
        ...createFormat1Instrs(),
        ...createFormat2Instrs(),
        ...createFormat3Instrs(),
    ];
}

export const instructions = createInstructions();
