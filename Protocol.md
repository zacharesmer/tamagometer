# Tamagotchi IR data format

| Byte  | Bits | Description                  |
|-------|------|------------------------------|
|1      |      |Hard-coded, same for all I've tested |
|2      |      |Might define the type of interaction. In a conversation this byte in the first message is always 0, the second one is always 1, and then the next one is 8 for a visit, 4 for a gift, and 2 for a game. In the last message it is the sum (9 for a visit, 5 for a gift, 3 for a game). |
|3      |      |ID 1                          |
|4      |      |ID 2                          |
|5      |      |Character appearance          |
|6      |      |Name letter 1                 |
|7      |      |Name letter 2                 |
|8      |      |Name letter 3                 |
|9      |      |Name letter 4                 |
|10     |      |Name letter 5                 |
|11     |      |                              |
|12     |      |                              |
|13     |      |                              |
|14     |      |                              |
|15     |      |Gift Item                     |
|16     |      |Pre-gift activity             |
|17     |      |                              |
|18     |      |                              |
|19     |      |                              |
|20     |      |                              |

# Name Letters
A-Z are 0-25

|Byte|Decimal|Symbol|
|--|--|--|
| 01111010 | 122 | ! |
| 01111011 | 123 | ? |
| 01111100 | 124 | & |
| 01111101 | 125 | o |
| 01111110 | 126 | x |
| 01111111 | 127 | ♥ |
| 10000000 | 128 | ✿ |
| 10000001 | 129 | ★ |
| 10000010 | 130 | @ |
| 10000011 | 131 | ♪ |
| 10000100 | 132 | ⛶ |
| 10000101 | 133 | ↑ |
| 10000110 | 134 | ↓ |
| 10000111 | 135 | → |
| 10001000 | 136 | ← |
| 10100000 | 160 | _ |


# Characters
| 5th byte | Byte as Decimal|Character Name|
| -------- | -- | -------------- |
| 00000000 | 0  | Mailman        |
| 00000001 | 1  | Teletchi       |
| 00000010 | 2  | ShiroTeletchi  |
| 00000011 | 3  | Tamatchi       |
| 00000100 | 4  | MizuTamatchi   |
| 00000101 | 5  | Kuchitamatchi  |
| 00000110 | 6  | Mohitamatchi   |
| 00000111 | 7  | Obotchi        |
| 00001000 | 8  | Young Mametchi |
| 00001001 | 9  | Batabatchi     |
| 00001010 | 10 | Ichigotchi     |
| 00001011 | 11 | Nikatchi       |
| 00001100 | 12 | Pirorirotchi   |
| 00001101 | 13 | Hikotchi       |
| 00001110 | 14 | Hinatchi       |
| 00001111 | 15 | Young Mimitchi |
| 00010000 | 16 | Ringotchi      |
| 00010001 | 17 | Hinotamatchi   |
| 00010010 | 18 | Hashitamatchi  |
| 00010011 | 19 | Mametchi       |
| 00010100 | 20 | Flowertchi     |
| 00010101 | 21 | Pyonkotchi     |
| 00010110 | 22 | Kuchipatchi    |
| 00010111 | 23 | Memetchi       |
| 00011000 | 24 | Billotchi      |
| 00011001 | 25 | Tarakotchi     |
| 00011010 | 26 | Paparatchi     |
| 00011011 | 27 | Mimiyoritchi   |
| 00011100 | 28 | Hanatchi       |
| 00011101 | 29 | Hashizotchi    |
| 00011110 | 30 | Tsunotchi      |
| 00011111 | 31 | Masktchi       |
| 00100000 | 32 | Megatchi       |
| 00100001 | 33 | Mailman        |
| 00100010 | 34 | Mimitchi       |
| 00100011 | 35 | ChoMametchi    |
| 00100100 | 36 | Decotchi       |
| 00100101 | 37 | Hidatchi       |
| 00100110 | 38 | Debatchi       |
| 00100111 | 39 | Bunbuntchi     |
| 00101000 | 40 | Pipotchi       |
| 00101001 | 41 | Dorotchi       |
| 00101010 | 42 | Bill           |
| 00101011 | 43 | Robotchi       |
| 00101100 | 44 | Wooltchi       |
| 00101101 | 45 | Teketchi       |
| 00101110 | 46 | Gozarutchi     |
| 00101111 | 47 | Warusotchi     |
| 00110000 | 48 | Sekitoritchi   |
| 00110001 | 49 | Oyajitchi      |
| 00110010 | 50 | Ojitchi        |
| 00110011 | 51 | Otokitchi      |
| 00110100 | 52 | Nyatchi        |
| 00110101 | 53 | Hohotchi       |
| 00110110 | 54 | Mailman        |
| 00110111 | 55 | Mailman        |
| 00111000 | 56 | Mailman        |
| 00111001 | 57 | Mailman        |
| 00111010 | 58 | Mailman        |
| 00111011 | 59 | Mailman        |
| 00111100 | 60 | Mailman        |
| 00111101 | 61 | Mailman        |
| 00111110 | 62 | Mailman        |
| 00111111 | 63 | Mailman        |

# Gift Items

| 15th byte in the 4th message | Byte in decimal | Item                          | Notes                                                            |
| ---------------------------- | --------------- | ----------------------------- | ---------------------------------------------------------------- |
| 00000000                     | 0               | Scone                         |                                                                  |
| 00000001                     | 1               | Sushi                         |                                                                  |
| 00000010                     | 2               | Bread                         |                                                                  |
| 00000011                     | 3               | Cereal                        |                                                                  |
| 00000100                     | 4               | Omelet                        |                                                                  |
| 00000101                     | 5               | Milk                          |                                                                  |
| 00000110                     | 6               | Hamburger                     |                                                                  |
| 00000111                     | 7               | BBQ                           |                                                                  |
| 00001000                     | 8               | Sandwich                      |                                                                  |
| 00001001                     | 9               | Beef Bowl                     |                                                                  |
| 00001010                     | 10              | Cheese                        |                                                                  |
| 00001011                     | 11              | Pizza                         |                                                                  |
| 00001100                     | 12              | Steak                         |                                                                  |
| 00001101                     | 13              | Taco                          |                                                                  |
| 00001110                     | 14              | Sausage (on stick)            |                                                                  |
| 00001111                     | 15              | Hot Dog                       |                                                                  |
| 00010000                     | 16              | Pasta                         |                                                                  |
| 00010001                     | 17              | Corn                          |                                                                  |
| 00010010                     | 18              | Turkey                        |                                                                  |
| 00010011                     | 19              | Noodle                        |                                                                  |
| 00010100                     | 20              | Fried Chicken                 |                                                                  |
| 00010101                     | 21              | Waffle                        |                                                                  |
| 00010110                     | 22              | Choco Bar                     |                                                                  |
| 00010111                     | 23              | Escargot                      |                                                                  |
| 00011000                     | 24              | Sausage (octopus)             |                                                                  |
| 00011001                     | 25              | Chikuwa                       |                                                                  |
| 00011010                     | 26              | Rice Ball                     |                                                                  |
| 00011011                     | 27              | Curry                         |                                                                  |
| 00011100                     | 28              | Kobu Maki                     |                                                                  |
| 00011101                     | 29              | Umeboshi                      |                                                                  |
| 00011110                     | 30              | Natto                         |                                                                  |
| 00011111                     | 31              | Fried Shrimp                  |                                                                  |
| 00100000                     | 32              | Takoyaki                      |                                                                  |
| 00100001                     | 33              | Oyster                        |                                                                  |
| 00100010                     | 34              | Naruto                        |                                                                  |
| 00100011                     | 35              | Pigs Feet                     |                                                                  |
| 00100100                     | 36              | Cone                          | Start of snacks                                                  |
| 00100101                     | 37              | Pudding                       |                                                                  |
| 00100110                     | 38              | Cake                          |                                                                  |
| 00100111                     | 39              | Apple                         |                                                                  |
| 00101000                     | 40              | Sundae                        |                                                                  |
| 00101001                     | 41              | Banana                        |                                                                  |
| 00101010                     | 42              | Fries                         |                                                                  |
| 00101011                     | 43              | Roll Cake                     |                                                                  |
| 00101100                     | 44              | Cupcake                       |                                                                  |
| 00101101                     | 45              | Fruit Juice                   |                                                                  |
| 00101110                     | 46              | Ice Cream                     |                                                                  |
| 00101111                     | 47              | Cheese Cake                   |                                                                  |
| 00110000                     | 48              | Apple Pie                     |                                                                  |
| 00110001                     | 49              | Energy Drink                  |                                                                  |
| 00110010                     | 50              | Corn Dog                      |                                                                  |
| 00110011                     | 51              | Donut                         |                                                                  |
| 00110100                     | 52              | Soda                          |                                                                  |
| 00110101                     | 53              | Popcorn                       |                                                                  |
| 00110110                     | 54              | Pear                          |                                                                  |
| 00110111                     | 55              | Pineapple                     |                                                                  |
| 00111000                     | 56              | Melon                         |                                                                  |
| 00111001                     | 57              | Grapes                        |                                                                  |
| 00111010                     | 58              | Chocolate (heart)             |                                                                  |
| 00111011                     | 59              | Cookie                        |                                                                  |
| 00111100                     | 60              | Whole Cake                    |                                                                  |
| 00111101                     | 61              | Yogurt                        |                                                                  |
| 00111110                     | 62              | Lollipop                      |                                                                  |
| 00111111                     | 63              | Candy                         |                                                                  |
| 01000000                     | 64              | Crepe Suzette                 |                                                                  |
| 01000001                     | 65              | Cherry                        |                                                                  |
| 01000010                     | 66              | Biscuit                       |                                                                  |
| 01000011                     | 67              | Marron Cake                   |                                                                  |
| 01000100                     | 68              | Cream Puff                    |                                                                  |
| 01000101                     | 69              | Gum                           |                                                                  |
| 01000110                     | 70              | Dango                         |                                                                  |
| 01000111                     | 71              | Shaved Ice                    |                                                                  |
| 01001000                     | 72              | Sweet Potato                  |                                                                  |
| 01001001                     | 73              | Mochi                         |                                                                  |
| 01001010                     | 74              | Peanuts                       |                                                                  |
| 01001011                     | 75              | Toast                         |                                                                  |
| 01001100                     | 76              | Crackers                      |                                                                  |
| 01001101                     | 77              | Water                         |                                                                  |
| 01001110                     | 78              | Ball                          | Start of items                                                   |
| 01001111                     | 79              | Pencil                        |                                                                  |
| 01010000                     | 80              | Wig                           |                                                                  |
| 01010001                     | 81              | Sunglasses                    |                                                                  |
| 01010010                     | 82              | RC Car 1                      |                                                                  |
| 01010011                     | 83              | Pen                           |                                                                  |
| 01010100                     | 84              | Weights                       |                                                                  |
| 01010101                     | 85              | RC Car 2 (duck)               |                                                                  |
| 01010110                     | 86              | RC Car 3                      |                                                                  |
| 01010111                     | 87              | Bow                           |                                                                  |
| 01011000                     | 88              | Darts                         |                                                                  |
| 01011001                     | 89              | Bldg Block                    |                                                                  |
| 01011010                     | 90              | Cap                           |                                                                  |
| 01011011                     | 91              | Bow Tie                       |                                                                  |
| 01011100                     | 92              | Wings                         |                                                                  |
| 01011101                     | 93              | Hair Gel                      |                                                                  |
| 01011110                     | 94              | Clock                         |                                                                  |
| 01011111                     | 95              | Chest                         |                                                                  |
| 01100000                     | 96              | Phonograph                    |                                                                  |
| 01100001                     | 97              | Fishing Pole                  |                                                                  |
| 01100010                     | 98              | Mirror                        |                                                                  |
| 01100011                     | 99              | Make Up                       |                                                                  |
| 01100100                     | 100             | Boom Box                      |                                                                  |
| 01100101                     | 101             | Music Disc                    |                                                                  |
| 01100110                     | 102             | Shirt                         |                                                                  |
| 01100111                     | 103             | Shoes                         |                                                                  |
| 01101000                     | 104             | Ticket 1                      | Snowman, Souvenir 10 (skis)                                      |
| 01101001                     | 105             | Ticket 2                      | Beach, Souvenir 11 (island)                                      |
| 01101010                     | 106             | Ticket 3                      | Wave, Souvenir 12 (surf board)                                   |
| 01101011                     | 107             | Ticket 4                      | Vines, Souvenir 13 (panda)                                       |
| 01101100                     | 108             | Ticket 5                      | Music Notes, Souvenir 14 (maracas)                               |
| 01101101                     | 109             | Doll 1                        | Lion                                                             |
| 01101110                     | 110             | Umbrella                      |                                                                  |
| 01101111                     | 111             | Lamp                          |                                                                  |
| 01110000                     | 112             | Roller Blades                 |                                                                  |
| 01110001                     | 113             | Action Figure                 |                                                                  |
| 01110010                     | 114             | Stuffed Tama 1                |                                                                  |
| 01110011                     | 115             | Stuffed Tama 2                |                                                                  |
| 01110100                     | 116             | Trumpet                       |                                                                  |
| 01110101                     | 117             | Drum                          |                                                                  |
| 01110110                     | 118             | Throne                        |                                                                  |
| 01110111                     | 119             | Music                         |                                                                  |
| 01111000                     | 120             | Plant                         |                                                                  |
| 01111001                     | 121             | Shovel                        |                                                                  |
| 01111010                     | 122             | TV                            |                                                                  |
| 01111011                     | 123             | Honey                         |                                                                  |
| 01111100                     | 124             | Royal Costume                 |                                                                  |
| 01111101                     | 125             | ! !                           | Makes a clone                                                    |
| 01111110                     | 126             | Balloon                       |                                                                  |
| 01111111                     | 127             | Rope                          |                                                                  |
| 10000000                     | 128             | Doll 2                        |                                                                  |
| 10000001                     | 129             | Tama Drink                    |                                                                  |
| 10000010                     | 130             | Castle                        |                                                                  |
| 10000011                     | 131             | Shaver                        |                                                                  |
| 10000100                     | 132             | Cone                          | Doesn't save in inventory                                        |
| 10000101                     | 133             | Flower                        | Doesn't save in inventory                                        |
| 10000110                     | 134             | Poop                          | Doesn't save in inventory                                        |
| 10000111                     | 135             | Jack in the box               | Doesn't save in inventory                                        |
| 10001000                     | 136             | Cake                          | Doesn't save in inventory                                        |
| 10001001                     | 137             | Heart                         | Doesn't save in inventory                                        |
| 10001010                     | 138             | Snake                         | Doesn't save in inventory                                        |
| 10001011                     | 139             | Blank/nothing                 |                                                                  |
| 10001100                     | 140             | Ghost thing                   | Doesn't save in inventory                                        |
| 10001101                     | 141             | Sickness                      | Makes the recipient sick                                         |
| 10001110                     | 142             | Passport                      | Start souvenirs. They don't save in inventory or souvenir list   |
| 10001111                     | 143             | Key                           |                                                                  |
| 10010000                     | 144             | Key 2                         |                                                                  |
| 10010001                     | 145             | Map                           |                                                                  |
| 10010010                     | 146             | Book                          |                                                                  |
| 10010011                     | 147             | Laptop                        |                                                                  |
| 10010100                     | 148             | Medal                         |                                                                  |
| 10010101                     | 149             | Cell phone                    |                                                                  |
| 10010110                     | 150             | Bicycle                       |                                                                  |
| 10010111                     | 151             | Skis souvenir                 |                                                                  |
| 10011000                     | 152             | Island souvenir               |                                                                  |
| 10011001                     | 153             | Surf board souvenir           |                                                                  |
| 10011010                     | 154             | Panda souvenir                |                                                                  |
| 10011011                     | 155             | Maracas souvenir              |                                                                  |
| 10011100                     | 156             | Diamond Ring?                 |                                                                  |
| 10011101                     | 157             | Robe/Cape                     |                                                                  |
| 10011110                     | 158             | Crown                         |                                                                  |
| 10011111                     | 159             | Skate board                   |                                                                  |
| 10100000                     | 160             | 3 balloons                    |                                                                  |
| 10100001                     | 161             | Baseball hat?                 |                                                                  |
| 10100010                     | 162             | Teddy bear                    |                                                                  |
| 10100011                     | 163             | CD                            |                                                                  |
| 10100100                     | 164             | Rare shoes                    |                                                                  |
| 10100101                     | 165             | Poster 1                      |                                                                  |
| 10100110                     | 166             | Poster 2                      |                                                                  |
| 10100111                     | 167             | Poster 3                      |                                                                  |
| 10101000                     | 168             | Microphone                    |                                                                  |
| 10101001                     | 169             | Suitcase                      |                                                                  |
| 10101010                     | 170             | Trophy                        |                                                                  |
| 10101011                     | 171             | Mona Lisa                     |                                                                  |
| 10101100                     | 172             | Small Crown                   |                                                                  |
| 10101101                     | 173             | Glasses                       |                                                                  |
| 10101110                     | 174             | Sword                         |                                                                  |
| 10101111                     | 175             | Camera                        |                                                                  |
| 10110000                     | 176             | Heart key                     |                                                                  |
| 10110001                     | 177             | Sparkly heart                 |                                                                  |
| 10110010                     | 178             | Sparkly star                  |                                                                  |
| 10110011                     | 179             | M Ball (no idea what this is) |                                                                  |
| 10110100                     | 180             | Heart ring                    |                                                                  |
| 10110101                     | 181             | Scone                         | Probably scones from here to the end. Doesn't save in inventory. |
| 10110110                     | 182             | Scone                         |                                                                  |
| 10110111                     | 183             | Scone                         |                                                                  |
| 10111000                     | 184             | Scone                         |                                                                  |
| 10111001                     | 185             | Probably scone, didn't test   |                                                                  |
| 10111010                     | 186             | Probably scone, didn't test   |                                                                  |
| 10111011                     | 187             | Probably scone, didn't test   |                                                                  |
| 10111100                     | 188             | Probably scone, didn't test   |                                                                  |
| 10111101                     | 189             | Probably scone, didn't test   |                                                                  |
| 10111110                     | 190             | Probably scone, didn't test   |                                                                  |
| 10111111                     | 191             | Probably scone, didn't test   |                                                                  |
| 11000000                     | 192             | Probably scone, didn't test   |                                                                  |
| 11000001                     | 193             | Probably scone, didn't test   |                                                                  |
| 11000010                     | 194             | Probably scone, didn't test   |                                                                  |
| 11000011                     | 195             | Probably scone, didn't test   |                                                                  |
| 11000100                     | 196             | Probably scone, didn't test   |                                                                  |
| 11000101                     | 197             | Probably scone, didn't test   |                                                                  |
| 11000110                     | 198             | Probably scone, didn't test   |                                                                  |
| 11000111                     | 199             | Probably scone, didn't test   |                                                                  |
| 11001000                     | 200             | Probably scone, didn't test   |                                                                  |
| 11001001                     | 201             | Probably scone, didn't test   |                                                                  |
| 11001010                     | 202             | Probably scone, didn't test   |                                                                  |
| 11001011                     | 203             | Probably scone, didn't test   |                                                                  |
| 11001100                     | 204             | Probably scone, didn't test   |                                                                  |
| 11001101                     | 205             | Probably scone, didn't test   |                                                                  |
| 11001110                     | 206             | Probably scone, didn't test   |                                                                  |
| 11001111                     | 207             | Probably scone, didn't test   |                                                                  |
| 11010000                     | 208             | Probably scone, didn't test   |                                                                  |
| 11010001                     | 209             | Probably scone, didn't test   |                                                                  |
| 11010010                     | 210             | Probably scone, didn't test   |                                                                  |
| 11010011                     | 211             | Probably scone, didn't test   |                                                                  |
| 11010100                     | 212             | Probably scone, didn't test   |                                                                  |
| 11010101                     | 213             | Probably scone, didn't test   |                                                                  |
| 11010110                     | 214             | Probably scone, didn't test   |                                                                  |
| 11010111                     | 215             | Probably scone, didn't test   |                                                                  |
| 11011000                     | 216             | Probably scone, didn't test   |                                                                  |
| 11011001                     | 217             | Probably scone, didn't test   |                                                                  |
| 11011010                     | 218             | Probably scone, didn't test   |                                                                  |
| 11011011                     | 219             | Probably scone, didn't test   |                                                                  |
| 11011100                     | 220             | Probably scone, didn't test   |                                                                  |
| 11011101                     | 221             | Probably scone, didn't test   |                                                                  |
| 11011110                     | 222             | Probably scone, didn't test   |                                                                  |
| 11011111                     | 223             | Probably scone, didn't test   |                                                                  |
| 11100000                     | 224             | Probably scone, didn't test   |                                                                  |
| 11100001                     | 225             | Probably scone, didn't test   |                                                                  |
| 11100010                     | 226             | Probably scone, didn't test   |                                                                  |
| 11100011                     | 227             | Probably scone, didn't test   |                                                                  |
| 11100100                     | 228             | Probably scone, didn't test   |                                                                  |
| 11100101                     | 229             | Probably scone, didn't test   |                                                                  |
| 11100110                     | 230             | Probably scone, didn't test   |                                                                  |
| 11100111                     | 231             | Probably scone, didn't test   |                                                                  |
| 11101000                     | 232             | Probably scone, didn't test   |                                                                  |
| 11101001                     | 233             | Probably scone, didn't test   |                                                                  |
| 11101010                     | 234             | Probably scone, didn't test   |                                                                  |
| 11101011                     | 235             | Probably scone, didn't test   |                                                                  |
| 11101100                     | 236             | Probably scone, didn't test   |                                                                  |
| 11101101                     | 237             | Probably scone, didn't test   |                                                                  |
| 11101110                     | 238             | Probably scone, didn't test   |                                                                  |
| 11101111                     | 239             | Probably scone, didn't test   |                                                                  |
| 11110000                     | 240             | Probably scone, didn't test   |                                                                  |
| 11110001                     | 241             | Probably scone, didn't test   |                                                                  |
| 11110010                     | 242             | Probably scone, didn't test   |                                                                  |
| 11110011                     | 243             | Probably scone, didn't test   |                                                                  |
| 11110100                     | 244             | Probably scone, didn't test   |                                                                  |
| 11110101                     | 245             | Probably scone, didn't test   |                                                                  |
| 11110110                     | 246             | Probably scone, didn't test   |                                                                  |
| 11110111                     | 247             | Probably scone, didn't test   |                                                                  |
| 11111000                     | 248             | Probably scone, didn't test   |                                                                  |
| 11111001                     | 249             | Probably scone, didn't test   |                                                                  |
| 11111010                     | 250             | Probably scone, didn't test   |                                                                  |
| 11111011                     | 251             | Probably scone, didn't test   |                                                                  |
| 11111100                     | 252             | Probably scone, didn't test   |                                                                  |
| 11111101                     | 253             | Probably scone, didn't test   |                                                                  |
| 11111110                     | 254             | Probably scone, didn't test   |                                                                  |
| 11111111                     | 255             | Scone                         |                                                                  |