// Create the different areas for each part of the bit string
// Every piece must implement getBitstring() for itself. 
// Might consider adding a length field too because this is pretty rickety right now

export { TamaMessage };

// // maybe I'll need this someday?
// class TwoWayMap {
//     // getSymbol returns wha
//     constructor(map) {
//         this.map = map;
//         // the reverse map is used for serializing this back into a bitstring
//         this.reverseMap = {};
//         for (const key in map) {
//             this.reverseMap[map[key]] = key;
//         }
//     }

//     getSymbol(number) {
//         return this.map[number];
//     }

//     getNumber(symbol) {
//         return parseInt(this.reverseMap[symbol]);
//     }
// }

class TamaMessage {
    constructor(bitstring) {
        // The checksum is not validated here, but there needs to be some kind of placeholder
        if (bitstring.length != 160) {
            throw Error(`Can't construct message, bitstring must be 160 bits. Got ${bitstring.length} bits.`)
        }
        if (! /[10]{160}/.test(bitstring)) {
            throw Error(`Incorrect format. Bitstring must be exactly 160 1s and 0s.\nGot: ${bitstring}`)
        }
        this.unknown1 = new UnknownBytes(bitstring.slice(0, 40));
        this.name = new TamaName(bitstring.slice(40, 80));
        // Exclude the last 8 bits because that's the checksum
        this.unknown2 = new UnknownBytes(bitstring.slice(80, 152));
        // no checksum is stored, calculate it every time it's needed
    }

    getBitsNoChecksum() {
        let output = []
        // The order of the keys is supposed to be guaranteed (insertion order for strings and 
        // symbol names, numerical order for anything number-like). If I ever add anything  
        // number-like as a key and this breaks in a weird way, it's because of that

        // I anticipate changing it to an array or something less fragile
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
        // 5 bytes
        this.length = 40;
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
        // 1 byte
        this.length = 8;
        // Keys are the binary numbers intepreted as base 10 integers
        this.lettersSymbols = {
            "0": "A", "1": "B", "2": "C", "3": "D", "4": "E", "5": "F", "6": "G", "7": "H",
            "8": "I", "9": "J", "10": "K", "11": "L", "12": "M", "13": "N", "14": "O",
            "15": "P", "16": "Q", "17": "R", "18": "S", "19": "T", "20": "U", "21": "V",
            "22": "W", "23": "X", "24": "Y", "25": "Z",
            "": "!", "": "?", "": "&", "": "o", "": "x", "": "♥", "": "✿", "129": "★",
            "130": "@", "131": "♫", "132": "⛶", "133": "↑", "134": "↓", "135": "→", "136": "←", "": " ",
        };

        // TODO figure out how to handle invalid letters. I want people to be able to send them but 

        this.number = parseInt(bitstring, 2);
        this.symbol = this.lettersSymbols[this.number]
        // console.log(this.letter);
    }

    getBitstring() {
        let num = this.number.toString(2).padStart(8, "0");
        return num;
    }

}

class UnknownBytes {
    constructor(bitstring) {
        this.length = bitstring.length;
        this.bitstring = bitstring;
    }

    getBitstring() {
        return this.bitstring;
    }
}

export const exportedForTesting = { TamaMessage, TamaName, TamaLetter, UnknownBytes };
