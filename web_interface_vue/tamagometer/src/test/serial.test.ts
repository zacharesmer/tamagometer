import { expect, test } from '@jest/globals'
import { matchCommandString, matchTimedOutString } from '../matchers';

// Test: If I send partial chunks of a valid message, then they are detected/matched correctly
test('matchCommandString matches valid message split into chunks', () => {
    const valid_messages = [
        { chunks: ["[PICO]0000111000000000110111100101101000110010100", "010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000001110001010001100110[END]"], bitstring: "0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000001110001010001100110" }
    ]
    for (let m of valid_messages) {
        let commandMatched: { matchingChars: number, commandSoFar: string[] }
        commandMatched = { matchingChars: 0, commandSoFar: [] }
        let commandComplete = false;
        for (let chunk of m.chunks) {
            ({ complete: commandComplete, commandMatched } = matchCommandString(commandMatched, chunk))
            if (commandComplete) {
                break
            }
        }
        expect(commandComplete).toBe(true)
        expect(commandMatched.commandSoFar.join("")).toBe(m.bitstring)
    }
})

test('matchTimedOutString matches the timed out string split into chunks', () => {
    const valid_messages = [
        ["[PICO]time", "d out[END]"]
    ]
    for (let m of valid_messages) {
        let timedOutMatched: { complete: boolean, matchingChars: number }
        timedOutMatched = { complete: false, matchingChars: 0 }
        for (let chunk of m) {
            timedOutMatched = matchTimedOutString(timedOutMatched.matchingChars, chunk)
            if (timedOutMatched.complete) {
                break
            }
        }
        expect(timedOutMatched.complete).toBe(true)
    }
})

// Test: If I send the timeout string, matchTimedOutString returns true
test('matchTimedOutString matches the timed out string', () => {
    const timedOutString = "[PICO]timed out[END]"
    const timedOutMatched = matchTimedOutString(0, timedOutString)
    expect(timedOutMatched.complete).toBe(true)
})

// Test: If I send the timeout string, matchCommandString returns false
test("matchCommandString doesn't match the timedout string", () => {
    const timedOutString = "[PICO]timed out[END]"
    const commandMatched = matchCommandString({ matchingChars: 0, commandSoFar: [] }, timedOutString)
    expect(commandMatched).toMatchObject({ complete: false, commandMatched: { matchingChars: 0, commandSoFar: [] } })
})

// Test: If I send a valid command string, matchCommandString returns true
test('matchCommandString matches a valid command', () => {
    const timedOutString = "[PICO]0000111000000001110111100101101000110010100010001000100010001000100010001000100000000000011001000010001100000000000001100000000000000000000000000000101010111000[END]"
    const commandMatched = matchCommandString({ matchingChars: 0, commandSoFar: [] }, timedOutString)
    expect(commandMatched).toMatchObject({
        complete: true, commandMatched: {
            matchingChars: 171, commandSoFar: ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '1', '1', '1', '1', '0', '0', '1', '0', '1', '1', '0', '1', '0', '0', '0', '1', '1', '0', '0', '1', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '0', '0', '1', '0', '0', '0', '0', '1', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '1', '0', '1', '0', '1', '1', '1', '0', '0', '0']
        }
    })
})

// Test: If I send a valid command string, matchTimedOutString returns false
test("matchTimedOutString doesn't match a valid command string", () => {
    const timedOutString = "[PICO]0000111000000001110111100101101000110010100010001000100010001000100010001000100000000000011001000010001100000000000001100000000000000000000000000000101010111000[END]"
    const timedOutMatched = matchTimedOutString(0, timedOutString)
    expect(timedOutMatched.complete).toBe(false)
})

// Test: If I send partial strings and then a complete valid string, the matchers match only the complete string

// if I send the timedout string and then a command... ??? what should happen? WIll this ever occur in nature? 
// The individual functions should still match I suppose, then I can sort out the conflict where they're called


// Test: If I send some other random things both matchers return false
test("matchTimedOutString and matchCommandString don't match things that aren't that", () => {
    const invalidStrings = [
        "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. ",
        "[PICO]]0000111000000001110111100101101000110010100010001000100010001000100010001000100000000000011001000010001100000000000001100000000000000000000000000000101010111000[END]",
        "timed out",
        "[PICO]0000111000000001110111100101101000110010100010001000100010001000100010001000100000000000011001000010001100000000000001100000000000000000000000000000101010111000[END",
        "[PICO ]timed out[END]"
    ]
    for (let m of invalidStrings) {
        // let commandMatched: { matchingChars: number, commandSoFar: string[] }
        // commandMatched = { matchingChars: 0, commandSoFar: [] }
        let commandMatched = matchCommandString({ matchingChars: 0, commandSoFar: [] }, m)
        expect(commandMatched.complete).toBe(false)

        let timedOutMatched = matchTimedOutString(0, m)
        expect(timedOutMatched.complete).toBe(false)

    }
})