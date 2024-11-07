export { TamaMessage, TamaName, UnknownBits }

export interface TamaChunk {
    getBitstring(): string;
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
            this.unknown1 = new UnknownBits(null);
            this.name = new TamaName(null);
            this.unknown2 = new UnknownBits(null);
            this.chunks = [this.unknown1, this.name, this.unknown2]
        }
    }

    init(bitstring: string) {
        this.unknown1.init(bitstring.slice(0, 40));
        this.name.init(bitstring.slice(40, 80));
        // Exclude the last 8 bits because that's the checksum
        this.unknown2.init(bitstring.slice(80, 152));
        // no checksum is stored, calculate it every time it's needed

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
                console.log(`Length: ${bitsNoChecksum.length + checksum.length}, ${bitsNoChecksum + checksum}`);
                return bitsNoChecksum + checksum;
            } catch (error) {
                console.error(error)
                return ""
            }
        } else { return "" }
    }

}

class TamaName implements TamaChunk {
    // length: number
    letters: TamaLetter[]
    initialized = false;
    constructor(bitstring: string | null) {
        this.letters = []
        if (bitstring !== null) {
            this.init(bitstring)
        }
    }

    init(bitstring: string) {
        // 5 bytes
        // this.length = 40;
        // there are 5 letters in the name
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

class TamaLetter implements TamaChunk {
    bitstring: string
    length: number
    lettersSymbols: Map<number, string>
    constructor(bitstring: string) {
        // 1 byte
        this.length = 8;
        this.bitstring = bitstring;
        // Keys are the binary numbers intepreted as base 10 integers
        this.lettersSymbols = new Map<number, string>([
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

        // TODO figure out how to handle invalid letters

    }

    getSymbol() {
        let lookup = this.lettersSymbols.get(parseInt(this.bitstring, 2))
        return lookup ? lookup : "�"
    }

    getBitstring() {
        return this.bitstring
    }



}

class UnknownBits implements TamaChunk {
    // length: number
    bitstring: string
    initialized = false;
    constructor(bitstring: string | null) {
        this.init(bitstring)
    }

    init(bitstring: string | null) {
        // this.length = bitstring.length;
        this.bitstring = bitstring ? bitstring : "";
        this.initialized = true;
    }

    getBitstring() {
        return this.bitstring;
    }


    flipBit(index: number) {
        this.bitstring = flipBitAt(this.bitstring, index)
        this.init(this.bitstring)
    }
}

function flipBitAt(str: string, index: number) {
    let current = str[index]
    let newBit = (parseInt(current) + 1) % 2
    return str.slice(0, index) + newBit + str.slice(index + 1)
}