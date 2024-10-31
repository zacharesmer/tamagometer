# Tamagotchi in the middle

from machine import Pin, Timer
import utime 
import rx, tx, converters
import sys

tx.vcc.on()
tx.signal.off()

rx.vcc.on()

prompt = "Options:\n\
V: Visit\n\
G: Game\n\
P: Present\n\n\
> "


def visit():
    rx.enable_interrupts()
    prompt = "V to send visit, L to wait for a visit, Q to exit\n\n"
    while True:
        selection = input(prompt).lower()
        if selection == "v":
            # TODO send the visit request based on the current state
            # send initial request signal
            rx.disable_interrupts()
            tx.send_bits("0000111000000000101111110010001000010001000110010000000000000010000001111000000100000011000000000010000000000000000000000000000000000000000000000000000011000110")
            rx.enable_interrupts()
            # wait for the response from the tamagotchi
            while True:
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    print("Valid message detected!")
                    rx.STATE = rx.waiting
                    break
            # send the ack
            rx.disable_interrupts()
            tx.send_bits("0000111000001000101111110010001000010001000110010000000000000010000001111000000100000000000000000000000000000000000000000000000000000000000000000000000010101011")
            rx.enable_interrupts()
            # wait for the ack ack
            while True:
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    print("Valid message detected!")
                    rx.STATE = rx.waiting
                    break    
        elif selection == "l":
            while True:
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    print("Valid message detected!")
                    rx.STATE = rx.waiting
                    break
            # send the response
            rx.disable_interrupts() 
            tx.send_bits("0000111000000001101111110010001000010001000110010000000000000010000001111000000100000001011001000010000000000000000000000000000000000000000000000000000000101001")
            rx.enable_interrupts()
            while True:
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    print("Valid message detected!")
                    rx.STATE = rx.waiting
                    break
            # send the second response
            rx.disable_interrupts() 
            tx.send_bits("0000111000001001101111110010001000010001000110010000000000000010000001111000000100000000000000000000000000000000000000000000000000000000000000000000000010101100")
            rx.enable_interrupts()

        elif selection == "q":
            break
        
    rx.disable_interrupts()

def game():
    rx.enable_interrupts()
    while True:
        selection = input("G to send game request, Q to stop listening\n\n> ").lower()
        if selection == "g":
            # TODO send the game request for the current state
            # Also probably add in selection of the types of game
            pass
        elif selection == "q":
            break
    rx.disable_interrupts()

def present():
    rx.enable_interrupts()
    while True:
        selection = input("P to request a gift, Q to stop listening\n\n> ").lower()
        # I don't want to send actual items to the computer because I don't want to 
        # send my gifts into the void, but maybe I should implement the random gifts
        if selection == "p":
            pass
        if selection == "q":
            break
    rx.disable_interrupts()

# For testing web serial, turn this off or it won't work right
rx.enable_interrupts()

while True:
    selection = input(prompt).lower()
    if selection == "v":
        print("\nVisit\n")
        visit()
    elif selection == "g":
        print("\nGame\n")
        game()
    elif selection == "p":
        print("\nPresent\n")
        present()
    else:
        print("\nInvalid input.\n" + prompt)

# tx.send_bits("0000111000000000110111100101101000001011100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000011110")