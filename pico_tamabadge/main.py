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


VISIT_1_MSG_A1 = "0000111000000000001100011011111000011110000000110000000000001101000010001010000000000010000000000010001000000000000000000000000000000000000000000001010000001011"
VISIT_1_MSG_A2 = "0000111000001000001100011011111000011110000000110000000000001101000010001010000000000001000000000000000000000000000000000000000000000000000000000000000011011100"
def perform_exchange(messages_to_send):
    rx.disable_interrupts()
    for message_to_send in messages_to_send:
        # Send the message
        utime.sleep(0.1)
        try:
            tx.send_bits(message_to_send)
        except:
            print("Error sending")
            return False
        utime.sleep(0.1)
        # Wait for a response and ignore it

        rx.enable_interrupts()
        start = utime.ticks_ms()

        while True:
            if utime.ticks_diff(utime.ticks_ms(), start) > listen_timeout_ms:
                print("[PICO]timed out[END]")
                break
            # print(rx.STATE)
            if rx.STATE == rx.end_of_message:
                break
            
        rx.disable_interrupts()
        
        if rx.STATE == rx.end_of_message:
            print("Received a response!") 
            rx.STATE = rx.waiting
        else:
            print("Failed to receive response")
            return False
        
    return True

# check for serial input in the form `send10101001010101010[...]10100\n` or `listen\n`
while True:
    read_in = input()
    if read_in.lower() == "visit1":
        perform_exchange([VISIT_1_MSG_A1, VISIT_1_MSG_A2])

# tx.send_bits("0000111000000000110111100101101000001011100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000011110")

