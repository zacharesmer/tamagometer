# Tamagotchi in the middle

from machine import Pin
import utime 

tx_vcc = Pin(2, Pin.OUT)
tx_signal = Pin(3, Pin.OUT)
rx_vcc = Pin(6, Pin.OUT)
rx_signal = Pin(7, Pin.IN)

tx_vcc.on()
tx_signal.off()
rx_vcc.on()

LAST_EDGE = utime.ticks_us()
# IR_PRESENT is whether the IR sensor is detecting a signal. 
# It needs to be 0 when the device starts or mayhem will ensue
IR_PRESENT = 0
CHANGE_BUFFER = []
# Whether to send responses to ir input. Turn it off to just observe a conversation between 2 tamagotchis
SEND = True

def change(arg):
    global LAST_EDGE
    global IR_PRESENT
    global CHANGE_BUFFER
    new_edge = utime.ticks_us()
    run_length = utime.ticks_diff(new_edge, LAST_EDGE)
    # # reset on long gaps (or long "on" signals I suppose)
    if (run_length > 100_000):
        print(f"{run_length}")
    else:
        # print(f"{run_length}", end=" ")
        CHANGE_BUFFER.append(run_length)
    if run_length > 800 and run_length < 2000 and IR_PRESENT == 1:
        # this is the way I'm detecting the ~1200 us high ending signal
        utime.sleep_us(300_000)
        respond()
        pass
    LAST_EDGE = new_edge
    IR_PRESENT = (IR_PRESENT + 1)%2


def enable_interrupts():
    # record a change on rising and falling edges
    rx_signal.irq(change, trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING)

def disable_interrupts():
    rx_signal.irq(None)

# Start with "high" signal
def send_run_lengths(length_list):
    state = 1
    # print("\n")
    for l in length_list:
        if state == 1:
            # print(f"{l}", end=" ")
            tx_signal.on()
        else:
            # print(f"{l}", end=" ")
            tx_signal.off()
        state = (state + 1) % 2
        utime.sleep_us(l)
    tx_signal.off()

def send_bits(bit_list):
    send_run_lengths(to_lengths(bit_list))


def to_lengths(bits):
    output = [9500, 6000]
    for b in bits:
        if b == 0:
            # print("Adding 0")
            output += [600, 600]
        else:
            # print("adding 1")
            output += [600, 1200]
    output += [1200]
    return output

def to_bits(lengths):
    # ignore the header (first 2 lengths)
    output = []
    state = 0
    # print(lengths)
    for i, l in enumerate(lengths[2:]):
        state = (state + 1) % 2 
        if state == 1:
            continue
        else:
            if l < 900:
                output.append(0)
            elif l < 2000:
                output.append(1)
            else:
                print(f"Length of {l} detected at position {i}/{len(lengths)}")
    return output


def respond():
    global SEND
    if SEND:
        disable_interrupts()
    global RESPONSE
    global CHANGE_BUFFER
    print(f"Received\n{to_bits(CHANGE_BUFFER)}\n")
    # print(f"{CHANGE_BUFFER}")
    CHANGE_BUFFER = []
    if SEND:
        print(f"Sending\n{RESPONSE}\n\n")
        # send_run_lengths(RESPONSE)
        send_bits(RESPONSE)
        RESPONSE = visit_request2_bits
    if SEND:
        enable_interrupts()

# response1 = [9504, 6053, 665, 634, 664, 647, 572, 718, 672, 634, 631, 1244, 669, 1228, 640, 1245, 661, 663, 624, 682, 635, 661, 609, 678, 623, 665, 671, 1231, 619, 691, 606, 696, 635, 661, 661, 1240, 651, 633, 628, 1261, 670, 1220, 597, 1292, 641, 1257, 610, 1268, 639, 1267, 632, 666, 665, 637, 605, 1276, 636, 688, 606, 681, 602, 690, 661, 1222, 627, 694, 662, 663, 581, 698, 662, 639, 635, 1246, 630, 1270, 628, 1254, 620, 1273, 602, 1297, 610, 686, 641, 646, 634, 694, 605, 1269, 603, 1266, 636, 717, 557, 699, 631, 1296, 575, 722, 612, 689, 612, 695, 577, 723, 606, 695, 606, 701, 581, 716, 609, 694, 618, 709, 579, 728, 573, 698, 607, 695, 603, 703, 574, 725, 603, 1300, 576, 724, 613, 714, 550, 733, 598, 702, 600, 679, 597, 726, 577, 1322, 554, 1322, 577, 1300, 603, 1293, 606, 726, 552, 725, 606, 693, 612, 719, 546, 733, 573, 726, 577, 1326, 602, 697, 576, 731, 574, 724, 601, 703, 574, 727, 576, 730, 546, 1325, 578, 1349, 551, 728, 601, 701, 604, 725, 549, 730, 572, 728, 597, 680, 599, 726, 569, 732, 599, 708, 602, 721, 550, 727, 601, 699, 616, 717, 546, 734, 571, 726, 576, 724, 601, 728, 550, 752, 574, 700, 602, 732, 546, 729, 599, 700, 581, 746, 553, 752, 601, 676, 601, 703, 596, 725, 553, 724, 608, 696, 603, 728, 548, 749, 580, 722, 579, 748, 553, 728, 583, 717, 576, 752, 551, 757, 521, 749, 581, 723, 547, 779, 549, 754, 576, 703, 576, 751, 550, 751, 552, 719, 588, 746, 523, 758, 546, 772, 579, 701, 576, 751, 552, 752, 551, 723, 553, 776, 527, 775, 546, 728, 569, 789, 525, 749, 578, 725, 553, 724, 575, 751, 527, 779, 546, 726, 551, 774, 530, 779, 548, 1354, 546, 729, 560, 1340, 551, 1349, 529, 1355, 518, 1375, 496, 808, 527, 723, 1151]
visit_response1 = [int(i) for i in "9454 6122 603 680 602 690 666 636 633 676 629 1268 635 1264 584 1265 641 710 580 721 640 662 617 691 577 706 651 667 610 694 581 719 587 1316 584 1317 585 1314 559 718 587 1312 585 1298 580 1287 611 1269 605 746 584 717 609 1275 599 691 615 1266 606 1293 616 689 613 1261 611 718 610 695 577 718 610 698 609 687 585 719 614 690 612 1260 614 1316 608 1269 607 694 609 717 581 702 575 1316 585 697 606 692 610 746 552 1328 578 727 575 695 607 691 609 1296 605 697 583 717 606 699 606 1293 604 698 605 699 576 730 598 1295 606 677 599 724 580 737 562 1324 579 722 607 671 600 730 575 1324 554 726 571 727 605 700 602 1296 609 716 556 727 602 699 607 1291 579 699 604 723 552 755 601 700 602 722 554 723 603 699 611 717 546 736 599 722 582 695 600 754 553 726 577 1296 602 704 609 1290 578 1322 583 692 579 1350 582 725 547 758 570 1323 552 751 576 697 581 748 555 1320 551 1351 583 745 524 753 579 724 576 750 526 752 580 721 580 722 549 779 579 721 575 706 573 752 550 730 596 704 580 747 552 725 576 751 578 747 530 751 574 723 579 749 529 748 550 752 580 698 576 777 553 751 550 727 575 750 553 753 547 729 574 749 531 784 512 774 585 719 555 756 545 754 574 728 549 754 528 775 575 719 563 770 526 778 551 748 531 744 555 1353 545 1352 528 1374 529 1343 528 802 528 777 497 1400 501 1373 532 774 498 805 525 770 516 792 499 779 1098".split(" ")]
visit_response2 = [int(i) for i in "9450 6122 577 701 601 701 602 726 575 700 574 1326 581 1316 557 1299 600 754 546 725 604 703 601 728 551 725 601 1297 606 669 602 703 604 1302 597 1300 610 1287 581 698 605 1297 602 1272 603 1295 606 1293 579 730 598 728 553 1324 573 733 571 1321 558 1319 580 722 603 1274 576 749 605 695 577 729 575 727 599 679 601 724 578 723 602 1275 580 1346 577 1323 554 725 605 697 576 728 579 1294 606 721 551 724 601 728 577 1302 600 726 575 730 547 726 604 1296 604 677 598 726 580 744 581 1303 575 718 608 671 603 727 574 1327 551 730 598 701 601 750 552 1298 607 719 558 722 605 693 605 1297 581 722 580 724 552 749 601 1301 603 696 576 730 575 726 603 1295 550 730 599 703 578 751 575 726 601 698 578 725 573 733 598 698 579 727 573 730 551 750 601 701 600 726 550 749 578 729 575 724 554 725 603 700 581 772 550 750 575 702 579 725 576 751 523 752 580 721 580 750 524 777 575 725 579 726 549 752 579 723 579 730 545 756 547 727 578 747 579 750 532 751 568 728 579 748 549 729 579 722 584 744 523 777 579 730 572 701 575 754 547 755 576 698 576 752 550 732 571 751 577 753 549 725 580 722 581 750 524 751 554 746 582 698 580 773 549 751 579 700 554 770 531 775 550 725 551 774 555 757 517 778 553 750 546 779 524 782 552 749 523 779 498 806 523 753 548 800 504 1350 554 1344 532 1367 532 1350 527 1370 530 775 532 1343 526 748 1127".split(" ")]
visit_response1_bits = [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0]
visit_response2_bits = [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0]

visit_request1_bits = [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1]
visit_request2_bits = [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0]

giftrq1 = [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1]
giftrp1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
giftrq2 = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1]
giftrp2 = [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]

RESPONSE = visit_request1_bits

enable_interrupts()

respond()

while True:
    pass