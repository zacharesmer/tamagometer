These are some plans for where this is going to go in the future, and what sorts of contributions would be particularly helpful. I'm potentially open to moving beyond this scope, but you are also very welcome to make a fork and do whatever you want.

## Other tamagotchis
If you have other tamagotchis that use infrared, and you can test and add support for them, that would be awesome. Currently I only have the 2024 ones and can borrow a single original v3. It's possible doing that will require you to change the code for the microcontroller because some of the assumptions made about the format are too restrictive. Please open an issue or a PR if you want to add another kind of tamagotchi!

## Firmware
Currently this is written in MicroPython, but the IR timing has been inconsistent and some of it is pretty cursed. I might rewrite it in Rust for fun/speed/reliability/readability, but for now it's basically working.

If you want to write something to use another board or re-implement the firmware in a different language this is the required functionality to interact with the front end:

Respond to the input string `listen\n` by listening for 1000 milliseconds for a tamagotchi signal and outputting one of:
- `[PICO]10110101[END]` (where the 10101010 etc. part is one valid decoded signal)
- `[PICO]timed out[END]` (if no valid signal was received for 1 second)

Respond to the input string `send0101010101010\n` by encoding and sending any 1s and 0s after "send" and before the newline

The encoding is similar to NEC: 9600-ish microseconds on, 6000-ish off. A 0 is 600-ish on and 600-ish off. A 1 is 600-ish on and 1200-ish off. The end marker is 1200-ish on. 

The front end is currently only paying attention to output between the strings `[PICO]` and `[END]`. This is mostly because I haven't figured out how to make webserial not also see everything it sends to the pico as input from the pico, and I think it is an issue with the device driver. Even if I fix it on my computer, I'm guessing other people will have the same problem, so it seems better to just design around it. A happy side effect of this is that you can print whatever you want for debugging purposes and it shouldn't interfere.

## The tamagotchi data format/protocol
It would be very helpful if you have any ideas about what the unknown parts of the bitstring mean.

There is a patent ([US8545324](https://patents.google.com/patent/US8545324B2/en)) that explains an older format, and it seems to have significant similarities, but not 100%. This may be helpful for a starting place, and creating some hypotheses to test.

If you know or think you know what part of it is, please include your rationale, or notes from an experiment that you have done to confirm it. This will make it easier to test, and help ensure that anything added is correct. There are some strange parts of the data format listed in the patent that can't be directly observed in the UI (like luckiness) so I expect some parts of it to need some outside of the box experimentation or a ROM dump.

For example if you have discovered that bit N determines if the tamagotchi is a boy or a girl, it would help if you include something like this in your PR or issue:
I initiated a visit with these bitstrings: 01010101 and 01010101, and the character was saved as a girl. I flipped bit N and then sent 0101010 and 1010101 and the character was saved as a boy.

## Web interface


## Flipper App
