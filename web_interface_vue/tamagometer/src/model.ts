export { TamaMessage, TamaMessage3, TamaMessage4, TamaName, TamaLetter, TamaBits, TamaAppearance, TamaID, TamaGiftItem, TamaGiftActivity, TamaVisitActivity }


// Any chunk of the TamaMessage, whether it's made up of other TamaChunks or bits
// Basically this doesn't have the bit flipping stuff because that's only used by 
// "leaf" chunks that are directly made of bits
export interface TamaChunk {
    update(bitstring: string, init?: boolean): void;
    getBitstring(): string;
}

// 
class TamaBits implements TamaChunk {
    bitstring: string | null;
    // If the original bitstring is null, then differs and differsAt will always report that
    // the bits do not differ.
    originalBitstring: string | null;
    initialized = false;

    constructor(bitstring: string | null) {
        this.bitstring = null
        if (bitstring !== null) {
            this.update(bitstring, true)
        }
    }

    update(bitstring: string, init: boolean = false) {
        this.bitstring = bitstring;
        if (init) {
            this.originalBitstring = bitstring;
            this.initialized = true;
        }
    }
    getBitstring() {
        return this.bitstring ? this.bitstring : ""
    }
    flipBit(index: number) {
        if (this.bitstring !== null) {
            this.bitstring = flipBitAt(this.bitstring, index)
            this.update(this.bitstring)
        }
    }
    // Check if the bitstring has been modified. 
    differs() {
        if (this.originalBitstring === null) {
            return false
        }
        return (this.bitstring !== this.originalBitstring)
    }
    differsAt(index: number): boolean {
        if (this.originalBitstring === null || this.bitstring === null) {
            return false
        }
        return (this.bitstring[index] !== this.originalBitstring[index])
    }
}

class TamaMessage {
    whichMessage: number
    hardcodedThing: UnknownBits
    unknown1: UnknownBits
    deviceID: TamaID
    appearance: TamaAppearance
    name: TamaName
    unknown3: UnknownBits
    unknown4: UnknownBits
    unknown5: UnknownBits
    unknown6: UnknownBits
    // giftitem: TamaGiftItem
    unknown7: UnknownBits
    unknown8: UnknownBits
    unknown9: UnknownBits
    unknown10: UnknownBits
    unknown11: UnknownBits

    initialized = false

    chunks: TamaChunk[]
    constructor(bitstring: string | null) {
        this.whichMessage = NaN
        // To add a new section, also update update() and EditConversationMessage.vue
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
            this.update(bitstring, true)
        }
    }

    update(bitstring: string, init: boolean = false) {
        this.hardcodedThing.update(bitstring.slice(0, 8), init);
        this.unknown1.update(bitstring.slice(8, 16), init);
        this.deviceID.update(bitstring.slice(16, 32), init);
        this.appearance.update(bitstring.slice(32, 40), init);
        this.name.update(bitstring.slice(40, 80), init);
        this.unknown3.update(bitstring.slice(80, 88), init)
        this.unknown4.update(bitstring.slice(88, 96), init)
        this.unknown5.update(bitstring.slice(96, 104), init)
        this.unknown6.update(bitstring.slice(104, 112), init)
        this.unknown7.update(bitstring.slice(112, 120), init)
        this.unknown8.update(bitstring.slice(120, 128), init)
        this.unknown9.update(bitstring.slice(128, 136), init)
        this.unknown10.update(bitstring.slice(136, 144), init)
        this.unknown11.update(bitstring.slice(144, 152), init)
        this.initialized = true
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

class TamaMessage3 extends TamaMessage {
    visitActivity: TamaVisitActivity
    constructor(bitstring: string | null) {
        super(bitstring)
        this.visitActivity = new TamaVisitActivity(null)
        this.chunks = [
            this.hardcodedThing,
            this.unknown1,
            this.deviceID,
            this.appearance,
            this.name,
            this.unknown3,
            this.visitActivity,
            this.unknown4,
            this.unknown5,
            this.unknown6,
            this.unknown7,
            this.unknown8,
            this.unknown9,
            this.unknown10,
            this.unknown11,
        ]
    }

    update(bitstring: string, init?: boolean): void {
        super.update(bitstring, init)
        this.unknown3.update(bitstring.slice(80, 86), init)
        this.visitActivity.update(bitstring.slice(86, 88), init)
    }
}

class TamaMessage4 extends TamaMessage {
    giftitem: TamaGiftItem
    giftactivity: TamaGiftActivity
    constructor(bitstring: string | null) {
        super(bitstring)
        this.whichMessage = 4
        this.giftitem = new TamaGiftItem(null)
        this.giftactivity = new TamaGiftActivity(null)
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
            this.giftitem,
            this.giftactivity,
            this.unknown9,
            this.unknown10,
            this.unknown11,
        ]
    }

    update(bitstring: string, init?: boolean): void {
        super.update(bitstring, init)
        this.giftitem.update(bitstring.slice(112, 120), init)
        this.giftactivity.update(bitstring.slice(120, 128), init)
    }
}

class TamaName implements TamaChunk {
    length = 40
    letters: TamaLetter[]
    initialized = false;

    constructor(bitstring: string | null) {
        this.letters = []
        if (bitstring !== null) {
            this.update(bitstring, true)
        }
    }

    update(bitstring: string, init: boolean = false) {
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

    differs() {
        for (let l of this.letters) {
            if (l.differs()) {
                return true
            }
        }
        return false
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

    update(bitstring: string, init: boolean = false) {
        if (bitstring.length !== 8) {
            throw Error(`Invalid bitstring length for Letter: expected 8, got ${bitstring.length}`)
        }
        super.update(bitstring, init)
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

    update(bitstring: string, init: boolean = false) {
        if (bitstring.length !== 8) {
            throw Error(`Invalid bitstring length for Appearance: expected 8, got ${bitstring.length}`)
        }
        super.update(bitstring, init)
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

class TamaVisitActivity extends TamaBits {
    activities = new Map<number, string>([
        [0, "Scale"],
        [1, "Spin Around"],
        [2, "Ball"],
        [3, "Music"]
    ])
}

class TamaGiftItem extends TamaBits {
    gift_items = new Map<number, string>([
        [0, "Scone"],
        [1, "Sushi"],
        [2, "Bread	"],
        [3, "Cereal"],
        [4, "Omelet"],
        [5, "Milk"],
        [6, "Hamburger"],
        [7, "BBQ"],
        [8, "Sandwich"],
        [9, "Beef Bowl"],
        [10, "Cheese"],
        [11, "Pizza"],
        [12, "Steak"],
        [13, "Taco"],
        [14, "Sausage on stick"],
        [15, "Hot Dog"],
        [16, "Pasta"],
        [17, "Corn"],
        [18, "Turkey"],
        [19, "Noodle"],
        [20, "Fried Chicken"],
        [21, "Waffle"],
        [22, "Choco Bar"],
        [23, "Escargot"],
        [24, "Octopus Sausage"],
        [25, "Chikuwa"],
        [26, "Rice Ball"],
        [27, "Curry"],
        [28, "Kobu Maki"],
        [29, "Umeboshi"],
        [30, "Natto"],
        [31, "Fried Shrimp"],
        [32, "Takoyaki"],
        [33, "Oyster"],
        [34, "Naruto"],
        [35, "Pigs Feet"],
        [36, "Cone"],
        [37, "Pudding"],
        [38, "Cake"],
        [39, "Apple"],
        [40, "Sundae"],
        [41, "Banana"],
        [42, "Fries"],
        [43, "Roll Cake"],
        [44, "Cupcake"],
        [45, "Fruit Juice"],
        [46, "Ice Cream"],
        [47, "Cheese Cake"],
        [48, "Apple Pie"],
        [49, "Energy Drink"],
        [50, "Corn Dog"],
        [51, "Donut"],
        [52, "Soda"],
        [53, "Popcorn"],
        [54, "Pear"],
        [55, "Pineapple"],
        [56, "Melon"],
        [57, "Grapes"],
        [58, "Chocolate heart"],
        [59, "Cookie"],
        [60, "Whole Cake"],
        [61, "Yogurt"],
        [62, "Lollipop"],
        [63, "Candy"],
        [64, "Crepe Suzette"],
        [65, "Cherry"],
        [66, "Biscuit"],
        [67, "Marron Cake"],
        [68, "Cream Puff"],
        [69, "Gum"],
        [70, "Dango"],
        [71, "Shaved Ice"],
        [72, "Sweet Potato"],
        [73, "Mochi"],
        [74, "Peanuts"],
        [75, "Toast"],
        [76, "Crackers"],
        [77, "Water"],
        [78, "Ball"],
        [79, "Pencil"],
        [80, "Wig"],
        [81, "Sunglasses"],
        [82, "RC Car 1"],
        [83, "Pen"],
        [84, "Weights"],
        [85, "RC Car 2 duck"],
        [86, "RC Car 3"],
        [87, "Bow"],
        [88, "Darts"],
        [89, "Bldg Block"],
        [90, "Cap"],
        [91, "Bow Tie"],
        [92, "Wings"],
        [93, "Hair Gel"],
        [94, "Clock"],
        [95, "Chest"],
        [96, "Phonograph"],
        [97, "Fishing Pole"],
        [98, "Mirror"],
        [99, "Make Up"],
        [100, "Boom Box"],
        [101, "Music Disc"],
        [102, "Shirt"],
        [103, "Shoes"],
        [104, "Ticket 1"],
        [105, "Ticket 2"],
        [106, "Ticket 3"],
        [107, "Ticket 4"],
        [108, "Ticket 5"],
        [109, "Doll 1"],
        [110, "Umbrella"],
        [111, "Lamp"],
        [112, "Roller Blades"],
        [113, "Action Figure"],
        [114, "Stuffed Tama 1"],
        [115, "Stuffed Tama 2"],
        [116, "Trumpet"],
        [117, "Drum"],
        [118, "Throne"],
        [119, "Music"],
        [120, "Plant"],
        [121, "Shovel"],
        [122, "TV"],
        [123, "Honey"],
        [124, "Royal Costume"],
        [125, "! !"],
        [126, "Balloon"],
        [127, "Rope"],
        [128, "Doll 2"],
        [129, "Tama Drink"],
        [130, "Castle"],
        [131, "Shaver"],
        [132, "Cone"],
        [133, "Flower"],
        [134, "Poop"],
        [135, "Jack in the box"],
        [136, "Cake"],
        [137, "Heart"],
        [138, "Snake"],
        [139, "Blank/nothing"],
        [140, "Ghost thing"],
        [141, "Sickness"],
        [142, "Passport"],
        [143, "Key"],
        [144, "Key 2"],
        [145, "Map"],
        [146, "Book "],
        [147, "Laptop"],
        [148, "Medal"],
        [149, "Cell phone"],
        [150, "Bicycle"],
        [151, "Skis souvenir"],
        [152, "Island souvenir"],
        [153, "Surfboard souvenir"],
        [154, "Panda souvenir"],
        [155, "Maracas souvenir"],
        [156, "Diamond Ring?"],
        [157, "Robe/Cape"],
        [158, "Crown"],
        [159, "Skate board"],
        [160, "3 balloons"],
        [161, "Baseball hat?"],
        [162, "Teddy bear"],
        [163, "CD "],
        [164, "Rare shoes"],
        [165, "Poster 1"],
        [166, "Poster 2"],
        [167, "Poster 3"],
        [168, "Microphone"],
        [169, "Suitcase"],
        [170, "Trophy"],
        [171, "Mona Lisa"],
        [172, "Small Crown"],
        [173, "Glasses"],
        [174, "Sword"],
        [175, "Camera"],
        [176, "Heart key"],
        [177, "Sparkly heart"],
        [178, "Sparkly star"],
        [179, "M Ball (no idea what this is)"],
        [180, "Heart ring"],
    ])

    update(bitstring: string, init: boolean = false) {
        if (bitstring.length !== 8) {
            throw Error(`Invalid bitstring length for GiftItem: expected 8, got ${bitstring.length}`)
        }
        super.update(bitstring, init)
    }

    getName() {
        let lookup = null;
        if (this.bitstring !== null) {
            lookup = this.gift_items.get(parseInt(this.bitstring, 2))
        }
        // this is the item that shows up as the fallback if an unknown code 
        // is received
        return lookup ? lookup : "Scone"
    }
}

class TamaGiftActivity extends TamaBits {
    activities = new Map<number, string>([
        [0, "look at windows"],
        [1, "video games"],
        [2, "look at flowers"],
        [3, "look at stars"],
        [4, "look at moon "],
        [5, "look at sunrise or sunset"],
        [6, "fireplace and Christmas tree"],
        [7, "snowmen"],
        [8, "ocean with clouds or mountains"],
        [9, "two chairs and cake"],
    ])
    update(bitstring: string, init: boolean = false) {
        if (bitstring.length !== 8) {
            throw Error(`Invalid bitstring length for GiftItem: expected 8, got ${bitstring.length}`)
        }
        super.update(bitstring, init)
    }
    getName() {
        let lookup = null;
        if (this.bitstring !== null) {
            lookup = this.activities.get(parseInt(this.bitstring, 2) % 10)
        }
        // this is the item that shows up as the fallback if an unknown code 
        // is received. That shouldn't happen because this one cycles through mod 10
        return lookup ? lookup : "look at windows"
    }

}

class TamaID extends TamaBits {
    update(bitstring: string, init: boolean = false) {
        if (bitstring.length != 16) {
            throw Error(`Invalid bitstring length for ID: expected 16, got ${bitstring.length}`)
        }
        super.update(bitstring, init)
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