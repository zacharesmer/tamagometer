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

// test("flipBitAt flips the right bits", () => {

// })

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