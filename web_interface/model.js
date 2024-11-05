// Create the different areas for each part of the bit string

export { TamaMessage };

class TwoWayMap {
    // getSymbol returns wha
    constructor(map) {
        this.map = map;
        // the reverse map is used for serializing this back into a bitstring
        this.reverseMap = {};
        for (const key in map) {
            this.reverseMap[map[key]] = key;
        }
    }

    getSymbol(number) {
        return this.map[number];
    }

    getNumber(symbol) {
        return parseInt(this.reverseMap[symbol]);
    }
}

class TamaMessage {
    constructor(bitstring) {
        // The checksum is not validated here, but there needs to be some kind of placeholder
        if (bitstring.length != 160) {
            throw Error(`Can't construct message, bitstring must be 160 bits. Got ${bitstring.length} bits.`)
        }
        if (! /[10]{160}/.test(bitstring)) {
            throw Error(`Incorrect format. Bitstring must be exactly 160 1s and 0s.\nGot: ${bitstring}`)
        }
        // this.bitstring = bitstring;
        // console.log(`Bitstring is ${bitstring.length} bits long`)
        // console.log(`making UnknownBytes from ${bitstring.slice(0, 40).length} bits`)
        this.unknown1 = new UnknownBytes(bitstring.slice(0, 40));
        // console.log(`making name from ${bitstring.slice(40, 80).length} bits`);
        this.name = new TamaName(bitstring.slice(40, 80));
        // console.log(`making UnknownBytes from ${bitstring.slice(80, -8).length} bits`)
        // Exclude the last 8 bits because that's the checksum
        this.unknown2 = new UnknownBytes(bitstring.slice(80, 152));
        // no checksum is stored, calculate it every time it's needed
    }

    getBitsNoChecksum() {
        let output = []
        // for (let i = 0; i < this.messageParts.length; i++) {
        //     console.log(`Part: ${this.messageParts[i]}`);
        //     output.push((this.messageParts[i]).getBitstring())
        // }
        for (let key in this) {
            // console.log(`Adding ${key}: ${this[key].getBitstring()}, length ${this[key].getBitstring().length} to bitstring`)
            output.push(this[key].getBitstring())
        }
        return output.join("");
    }

    getChecksumString(otherBits) {
        let sum = 0;
        for (let i = 0; i < otherBits.length; i += 8) {
            let byte = otherBits.slice(i, i + 8);
            // console.log(`Adding ${byte} (${parseInt(byte, 2)}) to checksum...`)
            sum = (sum + parseInt(byte, 2)) % 256
            // console.log(`sum is ${sum} so far`)
        }
        // how to make sure this is 8 characters long?
        return sum.toString(2).padStart(8, "0");
    }

    getBitstring() {
        let bitsNoChecksum = this.getBitsNoChecksum();
        let checksum = this.getChecksumString(bitsNoChecksum);
        // console.log(`Length: ${bitsNoChecksum.length + checksum.length}, ${bitsNoChecksum + checksum}`);
        return bitsNoChecksum + checksum;
    }

}

class TamaName {
    constructor(bitstring) {
        this.letters = []
        // there are 5 letters in the name
        for (let i = 0; i < 5; i++) {
            let bits = bitstring.slice(i * 8, (i * 8) + 8);
            // console.log(bits);
            this.letters.push(new TamaLetter(bits));
        }
    }

    getBitstring() {
        let output = [];
        for (let l = 0; l < 5; l++) {
            output.push(this.letters[l].getBitstring());
        }
        return output.join("");
    }
}

class TamaLetter {
    constructor(bitstring) {
        // Keys are the binary numbers intepreted as base 10 integers
        this.lettersSymbols = new TwoWayMap({
            "0": "A", "1": "B", "2": "C", "3": "D", "4": "E", "5": "F", "6": "G", "7": "H",
            "8": "I", "9": "J", "10": "K", "11": "L", "12": "M", "13": "N", "14": "O",
            "15": "P", "16": "Q", "17": "R", "18": "S", "19": "T", "20": "U", "21": "V",
            "22": "W", "23": "X", "24": "Y", "25": "Z",
            "": "!", "": "?", "": "&", "": "o", "": "x", "": "♥", "": "✿", "129": "★",
            "130": "@", "131": "♫", "132": "⛶", "133": "↑", "134": "↓", "135": "→", "136": "←", "": " ",
        });

        let number = parseInt(bitstring, 2);
        this.symbol = this.lettersSymbols.getSymbol(number)
        // console.log(this.letter);
    }

    getBitstring() {
        let num = this.lettersSymbols.getNumber(this.symbol).toString(2).padStart(8, "0");
        return num;
    }
}

class UnknownBytes {
    constructor(bitstring) {
        this.bitstring = bitstring;
    }

    getBitstring() {
        return this.bitstring;
    }
}

export const exportedForTesting = { TwoWayMap, TamaMessage, TamaName, TamaLetter, UnknownBytes };
