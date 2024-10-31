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
    while True:
        selection = input("V to send visit, Q to stop listening\n\n> ").lower()
        if selection == "v":
            # TODO send the visit request based on the current state
            # send initial signal
            
            # wait for the response
            while True:
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    print("Valid message detected!")
                    rx.STATE = rx.waiting
                    break
            # send the ack
            # wait for the ack
            while True:
                # print(rx.STATE)
                if rx.STATE == rx.end_of_message:
                    print("Valid message detected!")
                    rx.STATE = rx.waiting
                    break
            
            
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
