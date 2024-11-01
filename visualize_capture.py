# This was mostly used as a visualization tool for finding common characteristics for different signals
# It looks kind of cool though
# 
# Approximate timing for "nearly NEC" format v2 
# (natashenka's tamagotchi reverse engineering project/talk used that name and it's apt)

# Leader code: 9500 us pulse, 6000 us gap
# 1: 575 us mark, 1200 us space
# 0: 575 us mark, 750 us space
# End of message: 1100 us mark
#
# Generally messages are 160 bits/20 data bytes long, more details about the contents will 
# be available somewhere else in this repository

from pico.converters import to_bits

def multiple_to_bits(lengths):
    output = []
    start = 0
    # find any "leader" codes (~9500, 6000) and translate anything found before to bits
    for i, l in enumerate(lengths):
        if l < 10000 and l > 8000:
            if i < len(lengths) - 1 and lengths[i+1] > 5000 and lengths[i+1] < 7000:
                # get the bits for whatever came before this start code, unless it's nothing
                if i != 0:
                    output.append(f"Gap of {lengths[i-1]}")
                    output.append(to_bits(lengths[start:i]))
                    start = i
    # print(f"{to_bits(lengths[start:])}")
    output.append(f"Gap of {lengths[i-1]}")
    output.append(to_bits(lengths[start:]))
    return output


def minicom_file_to_lengths_list(filename="minicom.cap"):
    with open(filename, "r", encoding="utf8") as f:
        length_string = f.read()
        # print(length_string)
    # First 2 chars in minicom files are \x01\x01, so ignore them
    # Also remove trailing whitespace
    return [int(i) for i in length_string[2:].strip().split(" ")]

bit_lists =  multiple_to_bits(minicom_file_to_lengths_list("zach-request-balloon.cap"))
[print(l) for l in bit_lists]

def lengths_to_ascii_visualization(lengths):
    chars = ("_", "█")
    state = 0
    output = []
    for l in [int(l) for l in lengths]:
        # ignore extremely long signals
        if l > 10_000:
            output.append(f"\nskipping {l} us of {chars[state]}")
            state = (state + 1) % 2
            continue
        if state==1:
            # detect a high signal of ~9000 something microseconds and treat that as the start
            if l > 8000 and l < 11_000:
                output.append("\n\n\n")
            # detect short marks that would otherwise get lost in the floor division
            if l > 50 and l < 400:
                output.append(chars[state])
            else:
                output.append(chars[state] * (l // 400)) 
        if state == 0:
            output.append(chars[state] * (l // 600))
        state = (state + 1) % 2
    return "".join(output)

print(lengths_to_ascii_visualization(minicom_file_to_lengths_list("zach-initiate-game.cap")))