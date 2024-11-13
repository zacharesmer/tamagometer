import { exportForTesting, TamaBits, TamaLetter, TamaName } from "../model"
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

test("flipBitAt flips the right bits", () => {
    
})