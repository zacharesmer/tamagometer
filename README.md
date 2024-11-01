# Goals/Roadmap
- Understand the infrared messages that the tamagotchis send
- Make a flipper app so the tamagotchis can interact with the flipper

# Web interface
The web interface allows you to edit infrared codes and send them to a tamagotchi. It will be updated as I learn more about what the different bits in the transmission represent.  

It uses the WebSerial API, which only works in Chromium browsers.

## Setting up the hardware
The program is written in MicroPython, so you'll need to prepare your device to run micropython programs.

1. Load the MicroPython firmware onto your pico so that it will be able to run this program. Instructions and a link to the file are on the raspberry pi website here: https://www.raspberrypi.com/documentation/microcontrollers/micropython.html
2. Copy all files in the `pico` folder onto the pico. 
3. Unplug the pico and plug it back in, and main.py will run automatically.

(To prepare the board and load the files you can also use an IDE like Thonny or VSCode with the MicroPico extension. Please note that if one of those is connected to the board, the web UI will break in some weird ways. I will try and make it break in some more straightforward ways, but it will never work if you're also connected to the board with Thonny or MicroPico or minicom or something)

### Troubleshooting
On Linux if you're getting errors about permissions, you may have to add yourself to the dialout group:
`sudo usermod -aG dialout` 
(Or equivalently, `sudo usermod --append --groups dialout`. Do not leave out the `a` or `--append` or you'll be removed from any groups other than dialout)

## Using the web interface
### Just listen
This allows you to snoop on a conversation between two tamagotchis. 

### Editing individual bits
Click on any bit to flip it. This will update the checksum and, if it's known, the displayed value (eg turning `00000000` to `00000001` in the name will update that letter from A to B)
### Editing larger structures
For any known parts of the transmission, select from a list of possible values.

For example, the name takes up 5 bytes, so editing the bits individually would be time consuming. Choose letters/symbols to generate the correct bits.
### Type of interactions
#### Visit
You can either initiate or wait for the tamagotchi to initiate.
#### Game

#### Present
