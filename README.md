This is currently a work in progress, but the parts that exist generally work. Check back for updates!

# Goals/Roadmap
- Understand the infrared messages that the tamagotchis send
- Make a flipper app so the tamagotchis can interact with the flipper

# Web interface
The web interface allows you to edit infrared codes and send them to a tamagotchi. It will be updated as I learn more about what the different bits in the transmission represent.  

It uses the WebSerial API, which only works in Chromium browsers.

## Setting up hardware
The program is written in MicroPython, so you'll need to prepare your device to run micropython programs.

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

- They must deal with the 38kHz modulation in hardware. A plain IR LED or an analog sensor will not work with the firmware as it is written.
- If you're using a Pico, they need to run on 3.3V. If you get something designed for 5V, you'll need a level shifter.

### Pins
Transmitter power: GPIO 2
Transmitter data: GPIO 3
Receiver power: GPIO 6
Receiver data: GPIO 7

To use different pins, change the pin numbers at the top of `rx.py` and `tx.py` to match your setup.

### Troubleshooting
On Linux if you're getting errors about permissions, you may have to add yourself to the dialout group:
`sudo usermod -aG dialout` 
(Or equivalently, `sudo usermod --append --groups dialout`. Do not leave out the `a` or `--append` or you'll be removed from any groups other than dialout)

### Conversation
This is the area to edit a conversation and then send it. Choose messages in the saved conversations, or paste in bitstrings, edit them, and save them.

#### Editing individual bits
Click on any bit to flip it. This will update the checksum and, if it's known, the displayed value.

#### Editing larger structures
For any known parts of the transmission, select from a list of possible values. You can toggle whether to see the bits for the known parts in the settings.

### Record
This allows you to snoop/listen in on a conversation between two tamagotchis. You can add the recorded messages to a conversation and save it for later

### View Saved
Recorded messages are saved locally on your computer using IndexedDB. If you clear your cookies and cache or site storage you will lose your saved messages! Please back them up by  using the export button to save them as a file so that you can add them back if this happens. Importing a file will add onto any existing saved messages.

### Diff
This lets you compare multiple bit strings. This may be helpful for understanding what the different parts do.