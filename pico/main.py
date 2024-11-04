# Tamagotchi in the middle

from machine import Pin, Timer
import utime 
import rx, tx, converters
import sys

tx.vcc.on()
tx.signal.off()

rx.vcc.on()

# # For basic testing with web serial. Turn this off later
# rx.enable_interrupts()

listen_timeout_ms = 1000

# check for serial input in the form `send10101001010101010[...]10100\n` or `listen\n`
while True:
    read_in = input()
    if read_in.lower().startswith("send"):
        try:
            tx.send_bits(read_in[4:])
        except:
            print("Error")
            pass
    elif read_in.lower() == "listen":
        try:
            rx.enable_interrupts()
            start = utime.ticks_ms()
            while True:
                if utime.ticks_diff(utime.ticks_ms(), start) > listen_timeout_ms:
                    print("[PICO]timed out[END]")
                    break
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    rx.STATE = rx.waiting
                    break    
            rx.disable_interrupts()
        except:
            # print("Error")
            pass


# tx.send_bits("0000111000000000110111100101101000001011100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000011110")

