export { TamaMessage, TamaName, TamaLetter, TamaBits, TamaAppearance, TamaID }


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
    hardcodedThing: UnknownBits
    unknown1: UnknownBits
    deviceID: TamaID
    appearance: TamaAppearance
    name: TamaName
    unknown3: UnknownBits
    unknown4: UnknownBits
    unknown5: UnknownBits
    unknown6: UnknownBits
    unknown7: UnknownBits
    unknown8: UnknownBits
    unknown9: UnknownBits
    unknown10: UnknownBits
    unknown11: UnknownBits


    initialized = false

    chunks: TamaChunk[]
    constructor(bitstring: string | null) {
        // To add a new section, also update init() and BitstringInput.vue
        this.hardcodedThing = new UnknownBits(null);
        this.unknown1 = new UnknownBits(null);
        this.deviceID = new TamaID(null);
        this.appearance = new TamaAppearance(null);
        this.name = new TamaName(null);
        this.unknown3 = new UnknownBits(null)
        this.unknown4 = new UnknownBits(null)
        this.unknown5 = new UnknownBits(null)
        this.unknown6 = new UnknownBits(null)
        this.unknown7 = new UnknownBits(null)
        this.unknown8 = new UnknownBits(null)
        this.unknown9 = new UnknownBits(null)
        this.unknown10 = new UnknownBits(null)
        this.unknown11 = new UnknownBits(null)

        this.chunks = [
            this.hardcodedThing,
            this.unknown1,
            this.deviceID,
            this.appearance,
            this.name,
            this.unknown3,
            this.unknown4,
            this.unknown5,
            this.unknown6,
            this.unknown7,
            this.unknown8,
            this.unknown9,
            this.unknown10,
            this.unknown11,
        ]

        if (bitstring !== null) {
            if (bitstring.length != 160) {
                console.error(`Can't construct message, bitstring must be 160 bits. Got ${bitstring.length} bits.`)
            }
            if (! /[10]{160}/.test(bitstring)) {
                console.error(`Incorrect format. Bitstring must be exactly 160 1s and 0s.\nGot: ${bitstring}`)
            }
            this.init(bitstring)
        }
    }

    init(bitstring: string) {
        // To add a new section, also update constructor() and BitstringInput.vue
        this.hardcodedThing.init(bitstring.slice(0, 8));
        this.unknown1.init(bitstring.slice(8, 16));
        this.deviceID.init(bitstring.slice(16, 32));
        this.appearance.init(bitstring.slice(32, 40));
        this.name.init(bitstring.slice(40, 80));
        this.unknown3.init(bitstring.slice(80, 88))
        this.unknown4.init(bitstring.slice(88, 96))
        this.unknown5.init(bitstring.slice(96, 104))
        this.unknown6.init(bitstring.slice(104, 112))
        this.unknown7.init(bitstring.slice(112, 120))
        this.unknown8.init(bitstring.slice(120, 128))
        this.unknown9.init(bitstring.slice(128, 136))
        this.unknown10.init(bitstring.slice(136, 144))
        this.unknown11.init(bitstring.slice(144, 152))
        // Exclude the last 8 bits because that's the checksum
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
        [122, "!"],
        [123, "?"],
        [124, "&"],
        [125, "o"],
        [126, "x"],
        [127, "♥"],
        [128, "✿"],
        [129, "★"],
        [130, "@"],
        [131, "♪"],
        [132, "⛶"],
        [133, "↑"],
        [134, "↓"],
        [135, "→"],
        [136, "←"],
        [160, "_"],
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

class TamaAppearance extends TamaBits {
    characterNames = new Map<number, string>([
        [0, "Nazotchi"],
        [1, "Kuroteletchi"],
        [2, "Shiroteletchi"],
        [3, "Tamatchi"],
        [4, "Mizutamatchi"],
        [5, "Kuchitamatchi"],
        [6, "Mohitamatchi"],
        [7, "Obotchi"],
        [8, "Young Mametchi"],
        [9, "Batabatchi"],
        [10, "Ichigotchi"],
        [11, "Nikatchi"],
        [12, "Pirorirotchi"],
        [13, "Hikotchi"],
        [14, "Hinatchi"],
        [15, "Young Mimitchi"],
        [16, "Ringotchi"],
        [17, "Hinotamatchi"],
        [18, "Hashitamatchi"],
        [19, "Mametchi"],
        [20, "Flowertchi"],
        [21, "Pyonkotchi"],
        [22, "Kuchipatchi"],
        [23, "Memetchi"],
        [24, "Billotchi"],
        [25, "Tarakotchi"],
        [26, "Paparatchi"],
        [27, "Mimiyoritchi"],
        [28, "Hanatchi"],
        [29, "Hashizotchi"],
        [30, "Tsunotchi"],
        [31, "Masktchi"],
        [32, "Megatchi"],
        [33, "Nazotchi"],
        [34, "Mimitchi"],
        [35, "ChoMametchi"],
        [36, "Decotchi"],
        [37, "Hidatchi"],
        [38, "Debatchi"],
        [39, "Bunbuntchi"],
        [40, "Pipotchi"],
        [41, "Dorotchi"],
        [42, "Bill"],
        [43, "Robotchi"],
        [44, "Wooltchi"],
        [45, "Teketchi"],
        [46, "Gozarutchi"],
        [47, "Warusotchi"],
        [48, "Sekitoritchi"],
        [49, "Oyajitchi"],
        [50, "Ojitchi"],
        [51, "Otokitchi"],
        [52, "Nyatchi"],
        [53, "Hohotchi"],
        // [54, "Mailman"],
        // [55, "Mailman"],
        // [56, "Mailman"],
        // [57, "Mailman"],
        // [58, "Mailman"],
        // [59, "Mailman"],
        // [60, "Mailman"],
        // [61, "Mailman"],
        // [62, "Mailman"],
        // [63, "Mailman"],
    ])

    init(bitstring: string) {
        if (bitstring.length !== 8) {
            throw Error(`Invalid bitstring length for Appearance: expected 8, got ${bitstring.length}`)
        }
        super.init(bitstring)
    }

    getName() {
        let lookup = null;
        if (this.bitstring !== null) {
            lookup = this.characterNames.get(parseInt(this.bitstring, 2))
        }
        // this is the character who shows up as the fallback if an unknown code 
        // is received
        return lookup ? lookup : "Nazotchi"
    }
}

class TamaID extends TamaBits {
    init(bitstring: string) {
        if (bitstring.length != 16) {
            throw Error(`Invalid bitstring length for ID: expected 16, got ${bitstring.length}`)
        }
        super.init(bitstring)
    }

    getNumber() {
        if (this.bitstring !== null) {
            return parseInt(this.bitstring, 2)
        }
        return 0
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