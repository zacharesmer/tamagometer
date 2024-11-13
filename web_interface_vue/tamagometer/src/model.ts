export { TamaMessage, TamaName, TamaLetter, TamaBits }


// Any chunk of the TamaMessage, whether it's made up of other TamaChunks or bits
// Basically this doesn't have the bit flipping stuff because that's only used by 
// "leaf" chunks that are directly made of bits
export interface TamaChunk {
    init(bitstring: string): void;
    getBitstring(): string;
}

// 
class TamaBits implements TamaChunk {
    bitstring: string | null;
    initialized = false;

    constructor(bitstring: string | null) {
        this.bitstring = null
        if (bitstring !== null) {
            this.init(bitstring)
        }
    }

    init(bitstring: string) {
        this.bitstring = bitstring;
        this.initialized = true;
    }
    getBitstring() {
        return this.bitstring ? this.bitstring : ""
    }
    flipBit(index: number) {
        if (this.bitstring !== null) {
            this.bitstring = flipBitAt(this.bitstring, index)
            this.init(this.bitstring)
        }
    }
}

class TamaMessage {
    unknown1: UnknownBits
    name: TamaName
    unknown2: UnknownBits
    initialized = false
    private chunks: TamaChunk[]
    constructor(bitstring: string | null) {
        if (bitstring !== null) {
            if (bitstring.length != 160) {
                console.log(`Can't construct message, bitstring must be 160 bits. Got ${bitstring.length} bits.`)
            }
            if (! /[10]{160}/.test(bitstring)) {
                console.log(`Incorrect format. Bitstring must be exactly 160 1s and 0s.\nGot: ${bitstring}`)
            }
            this.init(bitstring)
        } else {
            // To add a new section, also update init() and BitstringInput.vue
            this.unknown1 = new UnknownBits(null);
            this.name = new TamaName(null);
            this.unknown2 = new UnknownBits(null);
            this.chunks = [this.unknown1, this.name, this.unknown2]
        }
    }

    init(bitstring: string) {
        // To add a new section, also update constructor() and BitstringInput.vue
        this.unknown1.init(bitstring.slice(0, 40));
        this.name.init(bitstring.slice(40, 80));
        // Exclude the last 8 bits because that's the checksum
        this.unknown2.init(bitstring.slice(80, 152));
        // no checksum is stored, it is calculated every time

        this.initialized = true;
    }

    getBitsNoChecksum(): string {
        if (this.initialized) {
            let output = []
            for (let i = 0; i < this.chunks.length; i++) {
                // console.log(`Adding ${key}: ${this[key].getBitstring()}, length ${this[key].getBitstring().length} to bitstring`)
                output.push(this.chunks[i].getBitstring())
            }
            return output.join("");
        } else {
            return "";
        }

    }

    getChecksumString(otherBits: string) {
        if (this.initialized) {
            let sum = 0;
            for (let i = 0; i < otherBits.length; i += 8) {
                let byte = otherBits.slice(i, i + 8);
                // console.log(`Adding ${byte} (${parseInt(byte, 2)}) to checksum...`)
                sum = (sum + parseInt(byte, 2)) % 256
                // console.log(`sum is ${sum} so far`)
            }
            // make sure this is 8 characters long
            return sum.toString(2).padStart(8, "0");
        }
        else {
            return ""
        }
    }

    getBitstring() {
        if (this.initialized) {
            try {
                let bitsNoChecksum = this.getBitsNoChecksum();
                let checksum = this.getChecksumString(bitsNoChecksum);
                // console.log(`Length: ${bitsNoChecksum.length + checksum.length}, ${bitsNoChecksum + checksum}`);
                return bitsNoChecksum + checksum;
            } catch (error) {
                console.error(error)
                return ""
            }
        } else { return "" }
    }

}

class TamaName implements TamaChunk {
    length = 40
    letters: TamaLetter[]
    initialized = false;

    constructor(bitstring: string | null) {
        this.letters = []
        if (bitstring !== null) {
            this.init(bitstring)
        }
    }

    init(bitstring: string) {
        // 5 bytes, 1 per letter
        this.letters = []
        for (let i = 0; i < 5; i++) {
            let bits = bitstring.slice(i * 8, (i * 8) + 8);
            // console.log(bits);
            this.letters.push(new TamaLetter(bits));
        }
        this.initialized = true
    }

    getBitstring() {
        if (this.initialized) {
            let output = [];
            for (let l = 0; l < 5; l++) {
                output.push(this.letters[l].getBitstring());
            }
            return output.join("");
        } else return ""

    }
}

class TamaLetter extends TamaBits {
    length = 8
    initialized = false;
    // the key is the bitstring interpreted as an unsigned integer
    lettersSymbols = new Map<number, string>([
        [0, "A"],
        [1, "B"],
        [2, "C"],
        [3, "D"],
        [4, "E"],
        [5, "F"],
        [6, "G"],
        [7, "H"],
        [8, "I"],
        [9, "J"],
        [10, "K"],
        [11, "L"],
        [12, "M"],
        [13, "N"],
        [14, "O"],
        [15, "P"],
        [16, "Q"],
        [17, "R"],
        [18, "S"],
        [19, "T"],
        [20, "U"],
        [21, "V"],
        [22, "W"],
        [23, "X"],
        [24, "Y"],
        [25, "Z"],
        [NaN, "!"],
        [NaN, "?"],
        [NaN, "&"],
        [NaN, "o"],
        [NaN, "x"],
        [NaN, "♥"],
        [NaN, "✿"],
        [129, "★"],
        [130, "@"],
        [131, "♫"],
        [132, "⛶"],
        [133, "↑"],
        [134, "↓"],
        [135, "→"],
        [136, "←"],
        [NaN, " "],
    ])
    constructor(bitstring: string | null) {
        super(bitstring)
    }

    init(bitstring: string) {
        if (bitstring.length !== 8) {
            throw Error(`Invalid bitstring length for Letter: expected 8, got ${bitstring.length}`)
        }
        super.init(bitstring)
    }

    getSymbol() {
        let lookup = null
        if (this.bitstring !== null) {
            lookup = this.lettersSymbols.get(parseInt(this.bitstring, 2))
        }
        return lookup ? lookup : "�"
    }
}

class UnknownBits extends TamaBits {
    constructor(bitstring: string | null) {
        super(bitstring)
    }
}

function flipBitAt(str: string, index: number) {
    let current = str[index]
    let newBit = (parseInt(current) + 1) % 2
    return str.slice(0, index) + newBit + str.slice(index + 1)
}

export const exportForTesting = { TamaBits, flipBitAt }