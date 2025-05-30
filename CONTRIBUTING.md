# Git
If you would like to make a pull request, please rebase it onto the latest version of the main branch before submitting the changes so that you can resolve any conflicts.

# Web interface
## Building
The web interface uses Typescript and Vue 3, and it's built using Vite. This means you'll need Node installed to build it (sorry). I used version 22 because it's the newest long-term support version, but it'll probably work with any version that can handle Vue 3.

Change into the web_interface_vue/tamagometer directory:

```sh
cd web_interface_vue/tamagometer
```

Install dependencies, build the site, and run it locally:

```sh
npm install
npm run dev
```

## Adding a meaning to some bits
To add a selector to a section of bits:
- extend the class TamaBits in model.ts
- edit the constructor and init methods of TamaMessage in model.ts. You'll be replacing one or more "UnknownBits" objects.
- create a vue component, and then add it to EditConversationMessage.vue. `EditConversationLetter.vue` is a good example of a component if you want a starting place.

# Hardware/serial Specification/API
## IMPORTANT NOTE: THIS WILL PROBABLY CHANGE SOON
If you want to rewrite the firmware to use another board or re-implement the firmware in a different language, this is what it needs to interact with the front end (for now):

Respond to the input string `tamagometer listen` by listening for 1000 milliseconds for a tamagotchi signal and outputting one of:
- `[PICO]10110101[END]` (where the 10101010 etc. part is one valid decoded signal)
- `[PICO]timed out[END]` (if no valid signal was received for 1 second)

Respond to the input string `tamagometer send0101010101010...101010` (160 1s and 0s) by encoding and sending any 1s and 0s after "send" and before the newline

For any other input, it doesn't need to do anything in particular except not crash the whole board. Mine just ignores it.

The encoding is similar to NEC: 9600-ish microseconds on, 6000-ish off. A 0 is 600-ish on and 750-ish off. A 1 is 600-ish on and 1250-ish off. The end marker is 1100-ish on. 

The front end is currently only paying attention to output between the strings `[PICO]` and `[END]`. This is mostly because I haven't figured out how to make webserial not also see everything it sends to the pico as input, and I think it is an issue with the device driver. Even if I fix it on my computer, I'm guessing other people will have the same problem, so it seems better to just design around it. A happy side effect of this is that you can print whatever you want for debugging (or other) purposes and it shouldn't interfere (unless it's enough to bog down the parser in the front end)

## Planned new API
The current architecture was largely to make the listening cancellable in a way that didn't involve Crtl+C, because I didn't want to get into that. At this point I've seen enough of the rest of this project that I think it would be worth it to get into it, and a redesign would go a long way to reducing complexity and increasing reliability of the recordings.

The new IR device will:
- Respond to the input `tamagometer listen` by listening indefinitely, and printing received commands over serial as they come in
- Stop listening when it gets a Ctrl+C signal
- Respond to the input `tamagometer send101010.01010101` by sending that, then immediately start listening again

This change will make it (more) possible to use a stream to handle what the microcontroller is putting out. It will make it less likely a signal is received in the time between a time out, and when the message is sent to tell it to listen again, since that gap won't exist anymore. For now upping the baud rate helped a bit with reliability, so this is on the back burner.

# Flipper App
The current "tamagometer companion" flipper app is in an extreme first draft/minimum viable product stage. If you are good at C and you look at the source code for this app... please do be kind when you roast it. I do already know a lot of the low hanging fruit, I just wanted to get Something to work. 

https://github.com/zacharesmer/tamagometer-companion-flipper

# DIY Firmware
## Getting it onto the device
Currently the DIY microcontroller firmware is written in MicroPython, but the IR timing has been inconsistent and some of it is pretty cursed. I might rewrite it in Rust for fun/speed/reliability/readability, but for now it's basically working, so it shall remain in MicroPython.

If you make changes and want to update the firmware on your microcontroller, here is how to do it in VSCode:

- Install the MicroPico extension if you don't have it already
- Open just the `pico` folder as a project in VSCode
- Use "MicroPico: Upload project to pico" to update the files on the pico
- Run it with `main.py` open

### Problems you may encounter
- You click "run" and nothing happens. Make sure you've uploaded all the files if you've made changes in anything other than main.py, and make sure you're clicking "run" while main.py is open, not some other file. Otherwise it will try to run whichever file you have open. It's also possible you need to stop whatever is running on the board with the stop button, or ctrl+c.
- You can't use the web interface while VSCode is open. I don't have a solution for this, just know that VSCode can't be connected to the board at the same time as the web interface. I messed with the auto-connect settings a little bit to try and fix this, but didn't get anywhere useful. If you find a good workaround feel free to make a pull request and update the code/these instructions!

# The tamagotchi data format/IR protocol
This will be more completely documented in Protocol.md, and incidentally in the file `model.ts`.

It would be very helpful if anyone is able to figure out what the unknown parts of the code mean.

There is a patent ([US8545324](https://patents.google.com/patent/US8545324B2/en)) that explains an older format, and it seems to have significant similarities, but not 100%. This was a helpful starting place for me, so maybe it will also help you come up with ideas.

If you know or think you know what part of it is, please include your rationale, or notes from an experiment that you have done to confirm it. This will make it easier to test, and help ensure that anything added is correct. There are some strange parts of the data format listed in the patent that can't be directly observed in the UI (like luckiness) so I expect some parts of it to need divine inspiration, or a ROM dump.

# Plans
Here is a vague outline of where this is going to go in the future, and what sorts of contributions would be particularly helpful. I'm potentially open to moving beyond the planned scope, but you are also very welcome to make a fork and do whatever you want.

## Other tamagotchis
If you have other tamagotchis that use infrared, and you can test and add support for them, that would be awesome. Currently I only have the 2024 ones and can borrow a single original v3. It's possible that supporting them will require you to change the code for the microcontroller because some of the assumptions made about the format are too restrictive. Please open an issue or a PR if you think you're interested in working on this (if one is opened I'll try and remember to add a link here)!

## A More Fully Featured Flipper App
Ultimately I want to make a flipper app with similar functionality to the editor page in the web app. It will let you set a name and a character and a visit type and send it from the flipper. The web interface was initially meant as a research tool and stepping stone to making the flipper app.