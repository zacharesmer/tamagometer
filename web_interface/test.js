import { exportedForTesting, TamaMessage } from "./model.js";

function tamaLetterGetBitstringReturnsSameAsUsedToConstruct() {
    const bitstrings = ["00000001", "10000001", "00000000"]
    for (let i = 0; i < bitstrings.length; i++) {
        let b = bitstrings[i];
        let t = new exportedForTesting.TamaLetter(b);
        let result = t.getBitstring();
        if (result != b) {
            throw Error(`Bitstrings don't match. Expected ${b}, got ${result}`);
        }
    }
    console.log("tamaLetterGetBitstringReturnsSameAsUsedToConstruct passed")
}

function tamaNameGetBitstringReturnsSameAsUsedToConstruct() {
    const bitstrings = ["0001100100000000000000100000011110000001", "1000100010001000100010001000100010001000", "0000000000000000000000000000000000000000"];
    for (let i = 0; i < bitstrings.length; i++) {
        let b = bitstrings[i];
        let t = new exportedForTesting.TamaName(b);
        let result = t.getBitstring();
        if (result != b) {
            throw Error(`Bitstrings don't match.\nExpected: ${b}\ngot:      ${result}`)
        }
    }
    console.log("tamaNameGetBitstringReturnsSameAsUsedToConstruct passed")

}


function getChecksumStringCalculatesTheChecksum() {
    const checksumExamples = {
        "0000111000000000110111100101101000011111100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000110010": "00110010",
        "0000111000000001101111110010001000010001000110010000000000000010000001111000000100000001011001000010000000000000000000000000000000000000000000000000000000101001": "00101001",
        "0000111000000000101111110010001000010001000110010000000000000010000001111000000100000011000000000010000000000000000000000000000000000000000000000000000011000110": "11000110",
    }
    for (const k in checksumExamples) {
        let t = new exportedForTesting.TamaMessage(k);
        let result = t.getChecksumString(t.getBitsNoChecksum());
        if (result != checksumExamples[k]) {
            throw Error(`Checksums don't match. Expected ${checksumExamples[k]}, got ${result}`);
        }
    }
    console.log("getChecksumStringCalculatesTheChecksum passed")

}

function getBitsNoChecksumReturnsCorrectBits() {
    const examples = {
        "0000111000000001101111110010001000010001000110010000000000000010000001111000000100000001011001000010000000000000000000000000000000000000000000000000000000101001": "00001110000000011011111100100010000100010001100100000000000000100000011110000001000000010110010000100000000000000000000000000000000000000000000000000000",
        "0000111000000110110111100101101000011111100010001000100010001000100010001000100000000000000000000000000000000000000000000000001100000000000000000000000000010110": "00001110000001101101111001011010000111111000100010001000100010001000100010001000000000000000000000000000000000000000000000000011000000000000000000000000",
    }
    for (let k in examples) {
        let t = new exportedForTesting.TamaMessage(k);
        let result = t.getBitsNoChecksum(t.getBitsNoChecksum());
        if (result != examples[k]) {
            throw Error(`Bits without checksum don't match.\nExpected: ${k}\nGot:      ${result}`)
        }
    }
    console.log("getBitsNoChecksumReturnsCorrectBits passed");
}

function tamaMessageThrowsErrorIfWrongNumberOfBits() {
    let bitstrings = ["10010101", "000011100000000011011110010110100001111110001000100010001000100010001000100010000000001000000000001000110000000000000000000000000000000000000000000000000011001", "00001110000000011011111100100010000100010001100100000000000000100000011110000001000000010110010000100000000000000000000000000000000000000000000000000000001010011"];
    for (let i = 0; i < bitstrings.length; i++) {
        let b = bitstrings[i];
        try {
            let t = new TamaMessage(b);
        } catch (error) {
            continue;
        }
        throw (Error("Expected error for incorrect length, none was thrown"))
    }
    console.log("tamaMessageThrowsErrorIfWrongNumberOfBits passed");
}

function tamaMessageThrowsErrorIfInvalidCharacters() {
    let bitstrings = ["]000111000000001110111100101101000011111100010001000100010001000100010001000100000000000011001000010001100000000000000000000000000000000000000000000000010010101", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "00001110000001101101111001011010000111111000100010001000100010001000100010001000000000000000O0000000000000000000000000000000001100000000000000000000000000010110"];
    for (let i = 0; i < bitstrings.length; i++) {
        let b = bitstrings[i];
        try {
            let t = new TamaMessage(b);
        } catch (error) {
            // console.log(error)
            continue;
        }
        throw (Error("Expected error for incorrect characters, none was thrown"))
    }
    console.log("tamaMessageThrowsErrorIfInvalidCharacters passed");
}



// call the test functions here
tamaLetterGetBitstringReturnsSameAsUsedToConstruct();
getChecksumStringCalculatesTheChecksum();
getBitsNoChecksumReturnsCorrectBits();
tamaNameGetBitstringReturnsSameAsUsedToConstruct();
tamaMessageThrowsErrorIfWrongNumberOfBits();
tamaMessageThrowsErrorIfInvalidCharacters();