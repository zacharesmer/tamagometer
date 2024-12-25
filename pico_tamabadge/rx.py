from machine import Pin, Timer
import utime

# vcc = Pin(6, Pin.OUT)
# signal = Pin(7, Pin.IN)

rx_vcc = Pin(2, Pin.OUT)
signal = Pin(4, Pin.IN)

TIMEOUT_US = 100_000
LAST_EDGE = utime.ticks_us()
# to store the rising and falling edges of the IR sensor
# TODO: look at making this an array
CHANGE_LIST = []
def enable_interrupts():
    #global signal
    print("Turning on IR sensor interrupts")

    #signal = Pin(4, Pin.IN)
    signal.irq(ir_sensor_callback_decode, trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING)
    rx_vcc.on()

def disable_interrupts():
    #global signal
    print("Turning off IR sensor interrupts")
    #signal = Pin(4, Pin.OUT)
    signal.irq(handler=None)
    rx_vcc.off()


def ir_sensor_callback(arg):
    # for now this is just to record a conversation
    # To respond, I will need to find a good way to reliably detect the end of a message. 
    #
    # Options include detecting a long high pulse (~1100 us), 
    # or going based off of the message length if it's standard (20 bytes).
    # The long high pulse will be easier to detect here because it's in the physical layer...
    global LAST_EDGE
    new_edge = utime.ticks_us()
    run_length = utime.ticks_diff(new_edge, LAST_EDGE)
    # send the length over serial so a computer can record it
    print(f"{run_length}", end=" ")
    # TODO: set a flag at end of a message to indicate that it's time to send a response
    LAST_EDGE = new_edge

def ir_sensor_callback_store(arg):
    global LAST_EDGE
    new_edge = utime.ticks_us()
    run_length = utime.ticks_diff(new_edge, LAST_EDGE)
    # add run_length to an array so it can be decoded when the signal ends?
    # TODO: set a flag at end of a message to indicate that it's time to send a response
    LAST_EDGE = new_edge


# STATE will be one of:
leader_awaiting_gap = 1         # Last saw the long mark at the beginning
leader_ended_awaiting_data = 2  # Last saw the long gap at the beginning
data_mark_awaiting_space = 3    # Last saw a short mark (part of a data bit)
data_long_space = 4             # Last saw a long space (end of a "0" data bit)
data_short_space = 5            # Last saw a short space (end of a "1" data bit)
waiting = 6                       # Something invalid was received, wait for new message to start
end_of_message = 0              # Waiting for a new message

min_leader_mark = 8000 -2000
max_leader_mark = 10_000 + 2000
min_leader_gap = 3500 -1000
max_leader_gap = 7500 
min_data_mark = 200
max_data_mark = 800
min_short_data_gap = 200
max_short_data_gap = 1000
min_long_data_gap = max_short_data_gap
max_long_data_gap = 2000
min_message_end_mark = max_data_mark
max_message_end_mark = 1800

# Count the length, should be 160
MESSAGE_LENGTH = 0

STATE = waiting 

PREV_CHANGE_LIST = []

def start_over_listening():
    global LAST_EDGE
    global STATE
    global MESSAGE_LENGTH
    global CHANGE_LIST
    STATE = waiting 
    LAST_EDGE = utime.ticks_us()
    MESSAGE_LENGTH = 0
    CHANGE_LIST = []




# I recognize that this is outrageous please don't @ me
# 
# Handle the IR signal and print out 1s and 0s over serial if it's a valid tamagotchi code
def ir_sensor_callback_decode(arg):

    global LAST_EDGE
    global STATE
    global MESSAGE_LENGTH
    global CHANGE_LIST


    new_edge = utime.ticks_us()
    run_length = utime.ticks_diff(new_edge, LAST_EDGE)
    # print(run_length)
    LAST_EDGE = new_edge
    #print(f"{STATE}: {run_length}", end="")
    if STATE == end_of_message or STATE == waiting:
        if run_length > min_leader_mark and run_length < max_leader_mark and signal.value() == 1:
            # print(f"Start of message: {run_length}")
            # print(f"\n")
            STATE = leader_awaiting_gap
            MESSAGE_LENGTH = 0
        else:
            # print(f"\n{STATE} error: pin was {signal.value()} for {run_length}")
            CHANGE_LIST = []
            STATE = waiting
    elif STATE == leader_awaiting_gap:
        # print(f"leader gap of {run_length}")
        if run_length > min_leader_gap and run_length < max_leader_gap:
            STATE = leader_ended_awaiting_data
        else:
            # print(f"\n{STATE} error: pin was {signal.value()} for {run_length}")
            CHANGE_LIST = []
            STATE = waiting
    elif STATE == leader_ended_awaiting_data:
        # print(f"Got mark: {run_length}")
        if run_length > min_data_mark and run_length < max_data_mark:
            STATE = data_mark_awaiting_space
        else:
            # print(f"\n{STATE} error: pin was {signal.value()} for {run_length}")
            CHANGE_LIST = []
            STATE = waiting
    elif STATE == data_mark_awaiting_space:
        # print(f"Got space: {run_length}")
        if run_length > min_short_data_gap and run_length < max_short_data_gap:
            STATE = data_short_space
        elif run_length >= min_long_data_gap and run_length < max_long_data_gap:
            STATE = data_long_space
        else:
            # print(f"\n{STATE} error: pin was {signal.value()} for {run_length}")
            CHANGE_LIST = []
            STATE = waiting
    elif STATE == data_long_space:
        # print(f"Got mark: {run_length}")
        if run_length > min_data_mark and run_length < max_data_mark:
            # print("1", end="")
            CHANGE_LIST.append("1")
            MESSAGE_LENGTH += 1
            STATE = data_mark_awaiting_space
        elif run_length >= min_message_end_mark and run_length < max_message_end_mark:
            MESSAGE_LENGTH += 1
            # print(f"0 : length {MESSAGE_LENGTH}\n")
            # print(f"1")
            CHANGE_LIST.append("1")
            print(f"[PICO]{''.join(CHANGE_LIST)}[END]")
            CHANGE_LIST = []
            STATE = end_of_message
        else:
            # print(f"\n{STATE} error: pin was {signal.value()} for {run_length}")
            CHANGE_LIST = []
            STATE = waiting
    elif STATE == data_short_space:
        # print(f"Got mark: {run_length}")
        if run_length > min_data_mark and run_length < max_data_mark:
            # print("0", end="")
            CHANGE_LIST.append("0")
            MESSAGE_LENGTH += 1
            STATE = data_mark_awaiting_space
        elif run_length >= min_message_end_mark and run_length < max_message_end_mark:
            MESSAGE_LENGTH += 1
            # print(f"1 : length {MESSAGE_LENGTH}\n")
            # print(f"0")
            CHANGE_LIST.append("0")
            print(f"[PICO]{''.join(CHANGE_LIST)}[END]")
            CHANGE_LIST = []
            STATE = end_of_message
        else:
            # print(f"\n{STATE}: pin was {signal.value()} for {run_length}")
            CHANGE_LIST = []
            STATE = waiting
    else:
        # print(f"\n{STATE} error: pin was {signal.value()} for {run_length}")
        CHANGE_LIST = []
        STATE = waiting


