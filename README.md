Check out the web app here: https://zacharesmer.github.io/tamagometer/

# Hardware
## Flipper Zero
There's a flipper app, so if you have a Flipper Zero, you don't need to build any hardware. 

It is currently in ultra-pre-alpha/sympathetic-developer-eyes-only stage, but hopefully it will exit that soon. 

It is also not yet in the app catalog, since it is hot off the presses and I haven't figured out how to do that yet. [Here's the repository](https://github.com/zacharesmer/tamagometer-companion-flipper); it's also in here as a submodule, so to clone it all at once use `git clone --recursive https://github.com/zacharesmer/tamagometer.git`

## Bring Your Own Board
If you don't have a Flipper, you can make your own transmitter/receiver from a Raspberry Pi Pico. The firmware is written in MicroPython, so you'll need to prepare the Pico to run micropython programs. It might work on other boards that can run micropython, but I haven't tested any. 

1. Load the MicroPython firmware onto your pico so that it will be able to run this program. Instructions and a link to the file are on the raspberry pi website here: https://www.raspberrypi.com/documentation/microcontrollers/micropython.html
2. Copy all files in the `pico` folder onto the pico. 
3. Unplug the pico and plug it back in, and main.py will run automatically.

(To prepare the board and load the files you can also use an IDE like Thonny or VSCode with the MicroPico extension. Please note that if one of those is connected to the board, the web UI will break in some weird ways. I will try and make it break in some less weird ways, but it will never work if you're also connected to the board with Thonny or MicroPico or minicom or something)

### Parts
- Raspberry Pi Pico
- A 38kHz IR receiver 
- A 38kHz IR transmitter
- Wires/header pins/usb cable for power

I haven't tested with an ESP32 or any other boards but it should probably work as long as it can run micropython? Definitely let me know if you try it with one and it works!

[This looks like the receiver I used](https://www.ebay.com/itm/172087478029), and [this looks like the transmitter](https://www.ebay.com/itm/294328064400). I didn't actually order either of those from those sellers, so I'm not recommending those in particular. There are also bundles on Amazon and AliExpress with receivers and transmitters, and Adafruit even sells a transceiver where both are built into one chip. The important things to check for:

- They must deal with the 38kHz modulation in hardware. A plain IR LED or an analog sensor will not work with the firmware as it is written. It would not be very hard to make it work with a regular LED, I just didn't yet. Contributions are welcome if you make that work and want to share!
- If you get something that only works on 5V, you'll need a level shifter since the pico is 3.3V

### Pins
- Transmitter power: GPIO 2
- Transmitter data: GPIO 3
- Receiver power: GPIO 6
- Receiver data: GPIO 7

To use different pins, change the pin numbers at the top of `rx.py` and `tx.py` to match your setup.

### Troubleshooting
#### Serial reset (not implemented yet)
I plan to add a button in the settings to fully reset/forget the previous serial connections to the page. If you need to do that before the button is added, run 
```javascript
(await navigator.serial.getPorts()).forEach(port => port.forget())
```
in the devtools console.

The device that the page connects to is the first one in the list: `(await navigator.serial.getPorts())[0]`. This could be annoying if you have multiple boards connected for some reason, so I plan to add a setting to adjust that as well.

#### Linux
On Linux if you're getting errors about permissions, you may have to add yourself to the dialout group:

`sudo usermod -aG dialout` 

(Or equivalently, `sudo usermod --append --groups dialout`. Do not leave out the `a` or `--append` or you'll be removed from any groups other than dialout)

# Web interface
The web interface allows you to edit infrared codes and send them to a tamagotchi. It will be updated as I learn more about what the different bits in the transmission represent.  

It uses the WebSerial API, which only works in Chromium browsers for now.

## Conversation
This is the area to edit a conversation, then send it and/or save it. Everything is stored locally on your computer.

### Editing individual bits
Click on any bit to flip it. This will update the checksum and, if it's known, the displayed value.

### Editing larger structures
For any known parts of the transmission, select from a list of possible values. You can toggle whether to see the bits for the known parts in the settings.

## Record
This allows you to snoop/listen in on a conversation between two tamagotchis. You can add the recorded messages to a conversation and save it for later.

## View Saved
Recorded messages are saved locally on your computer using IndexedDB. If you clear your cookies and cache or site storage you will lose your saved messages! Please back them up by  using the export button to save them as a file so that you can add them back if this happens. Importing a file will add onto any existing saved messages; it won't overwrite them.

# Goals/Roadmap
- Understand the infrared messages that the tamagotchis send
- Make a flipper app so the tamagotchis can directly interact with the flipper
- Internationalization: Tamagotchis are Japanese so I'm guessing it might be useful if I could translate this page into Japanese (and once the architecture is there, there's not a lot of text so it should not be too hard to do other languages too)

# Prior Art and References
- [This Tamagotchi reverse engineering project by Natalie Silvanovich](https://github.com/natashenka/Tamagotchi-Hack/tree/master) helped a ton 
- The corresponding CCC talks: 
    - [Many Tamagotchis Were Harmed In the Making of This Presentation](https://media.ccc.de/v/29c3-5088-en-many_tamagotchis_were_harmed_in_the_making_of_this_presentation_h264#t=0) 
    - [Even More Tamagotchis Were Harmed In the Making of This Presentation](https://media.ccc.de/v/30C3_-_5279_-_en_-_saal_1_-_201312291715_-_even_more_tamagotchis_were_harmed_in_the_making_of_this_presentation_-_natalie_silvanovich)
- Tamagotchi fandom wiki https://tamagotchi.fandom.com/wiki/Main_Page

# Disclaimer
This project is entirely unofficial and not affiliated with Tamagotchi or Bandai. 
