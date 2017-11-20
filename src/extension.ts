'use strict';

import { ExtensionContext, FormattingOptions, languages, Position, Range, TextDocument, TextEdit, TextLine, window } from 'vscode';
import * as XRegExp from 'xregexp';

/* (label? mnemonic operands?)? comment? */
const re = XRegExp.build('^(({{label}})?\\s+({{mnemonic}})(\\s({{operands}}))?)?\\s*?({{comment}})?$', {
    label: /\w+?/,
    mnemonic: /\+?(ADD|ADDF|ADDR|AND|CLEAR|COMP|COMPF|COMPR|DIV|DIVF|DIVR|FIX|FLOAT|HIO|J|JEQ|JGT|JLT|JSUB|LDA|LDB|LDCH|LDF|LDL|LDS|LDT|LDX|LPS|MUL|MULF|MULR|NORM|OR|RD|RMO|RSUB|SHIFTL|SHIFTR|SIO|SSK|STA|STB|STCH|STF|STI|STL|STS|STSW|STT|STX|SUB|SUBF|SUBR|SVC|TD|TIO|TIX|TIXR|WD|BYTE|WORD|FLOT|RESB|RESW|RESF|BASE|NOBASE|EQU|EXTDEF|EXTREF|LTORG|CSECT|USE|START|END|ORG)/,
    operands: /.+?/,
    comment: /\..*?/,
});

export function activate(context: ExtensionContext) {

    languages.registerDocumentFormattingEditProvider('sic', {
        provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions): TextEdit[] {

            let longestLabel = 0;
            const linesInfo: LineInfo[] = [];

            const changes: TextEdit[] = [];

            for (let i = 0; i < document.lineCount; i++) {

                const line = document.lineAt(i);
                const firstChar = line.text[line.firstNonWhitespaceCharacterIndex];

                if (line.isEmptyOrWhitespace) {
                    /* Clear empty lines */
                    changes.push(TextEdit.delete(line.range));

                } else {

                    let lineInfo: LineInfo;

                    try {
                        lineInfo = getLineInfo(document, i);
                    } catch (error) {
                        window.showErrorMessage(error.message);
                        return;
                    }

                    linesInfo.push(lineInfo);

                    if (lineInfo && lineInfo.label && lineInfo.label.len > longestLabel) {
                        longestLabel = lineInfo.label.len;
                    }
                }
            }

            const tabCount = Math.floor(longestLabel / options.tabSize) + 1;

            linesInfo.forEach((line, i) => {
                const lineNo = line.lineRef.lineNumber;
                if (line.label) {
                    /* Lines with labels */
                    const mnemonicStart = line.lineRef.text.indexOf(line.mnemonic.text);
                    const currentIndent = lineRange(lineNo, line.label.len, mnemonicStart);

                    const inTabCount = tabCount - Math.floor(line.label.len / options.tabSize);

                    changes.push(TextEdit.replace(currentIndent, '\t'.repeat(inTabCount)));

                } else if (!line.label && !line.mnemonic && !line.operands) {
                    /* Comment only: match indentation with the following line. */
                    const currentIndent = getIndentRange(line.lineRef);

                    if (linesInfo[i + 1] && linesInfo[i + 1].lineRef.lineNumber === lineNo + 1) {
                        /* Next line is not empty */
                        const nextLine = linesInfo[i + 1];
                        if (nextLine.label) {
                            /* Delete indentation */
                            changes.push(TextEdit.delete(currentIndent));
                        } else if (nextLine.mnemonic) {
                            /* Match indentation */
                            const edit = TextEdit.replace(getIndentRange(line.lineRef), '\t'.repeat(tabCount));
                            changes.push(edit);
                        }
                    }

                } else {
                    const currentIndent = lineRange(lineNo, 0, line.lineRef.firstNonWhitespaceCharacterIndex);
                    changes.push(TextEdit.replace(currentIndent, '\t'.repeat(tabCount)));
                }
            });

            return changes;
        },
    });
}

interface LineInfo {
    lineRef: TextLine;
    label: TokenInfo | null;
    mnemonic: TokenInfo | null;
    operands: TokenInfo | null;
    comment: TokenInfo | null;
}

interface TokenInfo {
    text: string;
    len: number;
}

function getLineInfo(document: TextDocument, lineNo: number): LineInfo {

    const line = document.lineAt(lineNo);
    const match = XRegExp.exec(line.text, re);

    if (match) {
        return {
            lineRef: line,
            label: matchToTokenInfo(match.label),
            mnemonic: matchToTokenInfo(match.mnemonic),
            operands: matchToTokenInfo(match.operands),
            comment: matchToTokenInfo(match.comment),
        };
    } else {
        throw Error('Wrong syntax at line ' + (line.lineNumber + 1));
    }
}

function matchToTokenInfo(s: string): TokenInfo | null {
    if (s) {
        return { text: s, len: s.length };
    } else {
        return null;
    }
}

/**
 * Returns the Range of current indentation for a TextLine [0, line.firstNonWhitespaceCharacterIndex)
 * @param line
 */
function getIndentRange(line: TextLine): Range {
    return line.range.with({ end: new Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex) });
}

function lineRange(line: number, start: number, end: number): Range {
    return new Range(new Position(line, start), new Position(line, end));
}
