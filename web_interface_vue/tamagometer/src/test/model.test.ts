import { exportForTesting, TamaBits, TamaLetter, TamaName, TamaMessage } from "../model"
import { expect, test } from '@jest/globals'

test('TamaBits getBitstring() returns the same string used to construct it', () => {
    const bitstrings = ["00000001", "10000001", "00000000", "101010101010101010"]
    for (const b of bitstrings) {
        expect(new TamaBits(b).getBitstring()).toBe(b)
    }
})

test("TamaLetter throws an error if initialized with a bitstring that's not 8 characters", () => {
    const bitstrings = ["0", "1111111", "111100001", ""]
    for (const b of bitstrings) {
        expect(() => { new TamaLetter(b) }).toThrow(Error)
    }
})

test("TamaName getBitstring() returns the same string used to construct it", () => {
    const bitstrings = ["0001100100000000000000100000011110000001", "1000100010001000100010001000100010001000", "0000000000000000000000000000000000000000"];
    for (const b of bitstrings) {
        expect(new TamaName(b).getBitstring()).toBe(b)
    }
})

test("TamaMessage getBitstring() returns the same string used to construct it", () => {
    const bitstrings = ["0000111000000000101111110010001000110000000110010000000000000010000001111000000100000011000000000010000000000000000001100000000000000000000000000001111000001001",
        "0000111000000001110111100101101000110010100010001000100010001000100010001000100000000000011001000010001100000000000001100000000000000000000000000001111011001100",
        "0000111000001000101111110010001000110000000110010000000000000010000001111000000100000011000000000000000000000000000000000000000000000000000000000000000011001101",
        "0000111000001001110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101100"
    ]
    for (const b of bitstrings) {
        expect(new TamaMessage(b).getBitstring()).toBe(b)
    }
})

test("After updating a bitstring, differs and differsAt correctly report where it's changed", () => {
    const testCase = {initial: "00001110", updated: "10001100", differsAtIndex: [true, false, false, false, false, false, true, false]}
    let bits = new TamaBits(null)
    bits.update(testCase.initial, true)
    bits.update(testCase.updated)
    expect(bits.differs()).toBe(true)
    for (let i=0; i< testCase.initial.length; i++) {
        expect(bits.differsAt(i)).toBe(testCase.differsAtIndex[i])
    }
})

test("differs and differsAt are false if bitstring is not updated", () => {
    const bitstring = "10101010"
    let bits = new TamaBits(bitstring)
    expect(bits.differs()).toBe(false)
    for (let i=0; i<bitstring.length; i++){
        expect(bits.differsAt(i)).toBe(false)
    }
})