from machine import Pin 
import utime
from converters import to_lengths

vcc = Pin(2, Pin.OUT)
signal = Pin(3, Pin.OUT)


# Start with "high" signal
def send_run_lengths(length_list):
    # print(f"Sending {length_list}")
    state = 1
    # print("\n")
    for l in length_list:
        if state == 1:
            # print(f"{l}", end=" ")
            signal.on()
        else:
            # print(f"{l}", end=" ")
            signal.off()
        state = (state + 1) % 2
        # this is kind of wack, the "off" periods were taking too long
        # so I made it sleep less for those...
        utime.sleep_us(l)
    signal.off()

def send_bits(bit_list):
    # print(f"sending {bit_list}")
    send_run_lengths(to_lengths(bit_list))
