# Tamagotchi in the middle


from machine import Pin, Timer
import utime 
#import rx
import converters
#import tx
import sys
from ir_tx import Player

ir_pin = Pin(7, Pin.OUT, value = 0)

READ_FROM_SERIAL_INSTEAD_OF_BUTTON = False

button_a = Pin(28, Pin.IN, Pin.PULL_UP)
button_b = Pin(29, Pin.IN, Pin.PULL_UP)
button_c = Pin(6, Pin.IN, Pin.PULL_UP)


from ir_rx.acquire import test
import ujson




#tx.vcc.on()
#tx.signal.off()

#rx.vcc.on()

# # For basic testing with web serial. Turn this off later
# rx.enable_interrupts()

listen_timeout_ms = 1000


VISIT_1_MSG_A1 = "0000111000000000001100011011111000011110000000110000000000001101000010001010000000000010000000000010001000000000000000000000000000000000000000000001010000001011"
VISIT_1_MSG_A2 = "0000111000001000001100011011111000011110000000110000000000001101000010001010000000000001000000000000000000000000000000000000000000000000000000000000000011011100"

VISIT_2_MSG_A1 = "0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101"
VISIT_2_MSG_A2 = "0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011"

VISIT_3_MSG_A1 = "0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000001111001101001"
VISIT_3_MSG_A2 = "0000111000001000110111100101101000110010100010001000100010001000100010001000100000000000000000000000000000000000000000000000000000000000000000000000000000101000"

def wait_for_single_message():

    lst = test()  # May report unsupported or unknown protocol
    print(lst)
    print(len(lst))
    (a, b) = converters.to_bits(lst)
    print(a, b)

    if a > 155 and a < 165:
        return True

    return False




def send_message_and_wait_for_response(message_to_send, retries=1):
    # Send the message

    #tx.send_bits(message_to_send)
    utime.sleep(0.05)
    #rx.disable_interrupts()
    #rx.enable_interrupts()
    # rx.pause_listening_without_changing_interrupts()

    print("starting play")
    try:
        lengths = converters.to_lengths(message_to_send)
        ir_out_1 = Player(ir_pin, asize=len(lengths)+1,verbose=True)
        ir_out_1.play(lengths)
        #tx.send_bits(message_to_send)
        #ir_out_1.play(converters.to_lengths(message_to_send))
        utime.sleep_us(sum(lengths)-1600)
        pass
    except:
        print("Error sending")
        return False
    #print("finished play")

    # Wait for a response and ignore it
    # utime.sleep(0.01)
    #rx.start_over_listening()
    # rx.resume_listening_without_changing_interrupts()


    #outgoing_copy_seen = wait_for_single_message()
    #if not outgoing_copy_seen:
    #    print("didn't get outgoing copy")
    #else:
    #    print("Got outgoing copy")
    #rx.start_over_listening()
    got_response = wait_for_single_message()

    if got_response:
        print("Got response!")
        return True
    else:
        if retries > 0:
            retries -=1
            
            print("Failed to receive response, retrying send")
            
            return send_message_and_wait_for_response(message_to_send, retries)
        else:
            print("Failed to recieve response, no retries left")
            return False
        
def perform_exchange(messages_to_send):
    #rx.disable_interrupts()
    for ind, message_to_send in enumerate(messages_to_send):
        if ind == 0:
            retries = 0
        else:
            retries = 0
        success = send_message_and_wait_for_response(message_to_send=message_to_send, retries=retries)
        if not success:
            return False
    print("Successful exchange!")
    return True

# check for serial input in the form `send10101001010101010[...]10100\n` or `listen\n`
while True:
    action = None
    if READ_FROM_SERIAL_INSTEAD_OF_BUTTON:
        action = input().lower()
    else:
        if button_a.value() == 0:
            print("Button a Pressed")
            action = "visit1"
        if button_b.value() == 0:
            print("Button b Pressed")
            action = "visit2"
        if button_c.value() == 0:
            print("Button c Pressed")
            action = "visit3"



    if action:
        print(action)
        if action == "visit1":
            perform_exchange([VISIT_1_MSG_A1, VISIT_1_MSG_A2])
        elif action == "visit2":
            perform_exchange([VISIT_2_MSG_A1, VISIT_2_MSG_A2])
        elif action == "visit3":
            perform_exchange([VISIT_3_MSG_A1, VISIT_3_MSG_A2])
        else:
            print(f"Invalid action: {action}")
    

    utime.sleep(0.1)

# tx.send_bits("0000111000000000110111100101101000001011100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000011110")

