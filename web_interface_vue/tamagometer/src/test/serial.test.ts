import { expect, test } from '@jest/globals'
import { exportForTesting } from '../serial';


// Test: If I send partial chunks of a valid message, then they are detected/matched correctly
test('matchCommandString matches valid messages split into chunks', () => {
    let valid_messages = [
        { chunks: ["[PICO]0000111000000000110111100101101000110010100", "010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000001110001010001100110[END]"], bitstring: "0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000001110001010001100110" }
    ]
    for (let m of valid_messages) {
        let commandMatched: { matchingChars: number, commandSoFar: string[] }
        commandMatched = { matchingChars: 0, commandSoFar: [] }
        let commandComplete = false;
        for (let chunk of m.chunks) {
            ({ complete: commandComplete, commandMatched } = exportForTesting.matchCommandString(commandMatched, chunk))
            if (commandComplete) {
                break
            }
        }
        expect(commandComplete).toBe(true)
        expect(commandMatched.commandSoFar.join("")).toBe(m.bitstring)
    }
})

// Test: If I send the timeout string, matchTimedOutString returns true
test('matchTimedOutString matches the timed out string', () => {
    throw Error("this test hasn't been written yet")
})

// Test: If I send the timeout string, matchCommandString returns false
test("matchCommandString doesn't match the timedout string", () => {
    throw Error("this test hasn't been written yet")

})

// Test: If I send a valid command string, matchCommandString returns true
test('matchCommandString matches a valid command', () => {
    throw Error("this test hasn't been written yet")

})

// Test: If I send a valid command string, matchTimedOutString returns false
test("matchTimedOutString doesn't match a valid command string", () => {
    throw Error("this test hasn't been written yet")

})

// Test: If I send partial strings and then a complete valid string, the matchers match only the complete string

// if I send the timedout string and then a command... ??? what should happen? WIll this ever occur in nature? 
// The individual functions should still match I suppose, then I can sort out the conflict where they're called


// Test: If I send some other random things both matchers return false
test("matchTimedOutString and matchCommandString don't match things that aren't that", () => {
    throw Error("this test hasn't been written yet")

})