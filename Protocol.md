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
|15     |      |                              |
|16     |      |                              |
|17     |      |                              |
|18     |      |                              |
|19     |      |                              |
|20     |      |                              |
