def to_lengths(bits):
    output = [9500, 6000]
    for b in bits:
        if int(b) == 0:
            # print("Adding 0")
            output += [600, 600]
        else:
            # print("adding 1")
            output += [600, 1200]
    output += [1200]
    return output

def to_bits(lengths):
    # Check the header (first 2 lengths), print debug info and return empty list if invalid
    if len(lengths) < 2:
        print("List too short!")
        print(f"{lengths}\n")
        return []
    if lengths[0] < 8000 or lengths[0] > 10000:
        print(f"Header pulse invalid: expected ~9500 us, got {lengths[0]}us")
        print(f"{lengths}\n")
        return [] 
    if lengths[1] <5000 or lengths[1] > 7000:
        print(f"Header gap invalid: expected ~6000us, got {lengths[1]}")
        print(f"{lengths}\n")
        return []
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
                # print(f"Length of {l} detected at position {i}/{len(lengths)}\n{lengths}\n")
                pass

    return (len(output), output)
