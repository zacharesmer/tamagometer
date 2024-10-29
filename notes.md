I had heard of the concept of "yak shaving" as it relates programming/devops/IT, but hadn't learned the precise definition. Upon looking it up I found that I am a life-long chronic yak shaver of the highest degree and I don't plan to quit now. This is the story of trying to reverse engineer the Tamagotchi connection v3 2024 re-release infrared communication protocol.

I took a whirlwind tour of a bunch of different IR formats when researching the data format/protocol for the pixmob bracelets. It turns out pixmob uses a bespoke custom protocol obfuscated by a lookup table (which [jamesw343](https://github.com/jamesw343/PixMob_IR) finally figured out!). I'm hoping this will be simpler.

This is the messy, incomplete, possibly wrong version of the facts. More polished, verified information will go in the readme.

# Goals
I want to be able to send arbitrary characters, items, and game requests to the tamagotchi using infrared. Ideally I'll also make a flipper app with cute little pixel art, and your tamagotchi can visit the flipper.

# The physical layer 

## Hypothesis: The tamagotchi uses the IrDA specification
I have read that previous Tamagotchis used the IrDA specification (IrDA = Infrared Data Association. This spec is different from the protocols used in TV remotes. IrDA was used for beaming files in palm OS, for example). 

[According to the Tamagotchi wiki](https://tamagotchi.fandom.com/wiki/Tamagotchi_Connection_(2024_Pet)#Connection), "The Connection can connect to another Connection 2024 device via infrared; it cannot connect to previous versions of Tamagotchi Connection." So something has changed, but maybe it hasn't changed a lot. I'll start here.

The IR hardware on the 2024 tamagotchi doesn't look like any of the off-the-shelf IRDA transceivers I've seen, but that doesn't necessarily mean anything. I haven't seen that many transceivers, and Bandai is a big company so maybe they rolled their own thing.

Info about the IrDA specification and its use in tamagotchis past:

https://www.reddit.com/r/tamagotchi/comments/xkts5r/guide_everything_you_might_want_to_know_and_more/

### What I would expect to see in a capture if this was IrDA
[According to the IrDA physical layer specification](https://www.vishay.com/docs/82513/physicallayer.pdf): A data "0" is a frame with a pulse taking up no more than 3/16 of that frame, a data "1" is an empty frame with no pulse. So I'd expect to see longer empty periods with short spikes of IR pretty far apart. That is, if the flipper can even record it. 

As an additional test, I beamed a note using Palm OS installed on my defcon badge, since that uses IrDA 9.6kbit/s SIR (slow IR), and the flipper records *something*, so being able to record a signal with the flipper doesn't tell me much by itself.

(note about the flipper format: when it can't determine the format, it records lengths of on/off pulses in microseconds, starting with "on".)

### What I actually see 

The message starts with 9485us on 6071us off (presumably some kind of preamble), then there are various pulses and empty space of ~650 and ~1200 microseconds. Definitely not IRDA. It's either a massive coincidence or something made to minimize run length. Could be Manchester code?

## Hypothesis: The tamagotchi uses Manchester Code.
### What I would expect to see if it's Manchester Code
Pulses and empty space of 2 different widths, one twice as long. Yup. Let's decode it and see if there's anything to this.
https://en.wikipedia.org/wiki/Manchester_code

### What do I actually see?
 
Cyberchef is strangely lacking manchester code. That could be a good side-quest, actually, to add those encodings to cyber chef. Someone made a PR in 2020 but it's not merged because they didn't satisfy the linter. I could fix that pretty quickly. These yaks are going to be so shaved by the end of this.

Maybe later. For now I just used some python. Excluding the preamble, I called any run length close to 600 one physical bit, and anything close to 1200 two.

From that, I called high to low transitions "1",  low to high transitions "0", and low to low non-transitions "x". There were no high to high non-transitions. 

Flipper IR file (run lengths in microseconds):
9485 6071 639 652 677 625 624 686 643 650 677 1207 640 1252 650 1255 592 705 676 611 637 683 646 652 676 608 640 681 648 650 599 680 674 650 625 1257 670 651 651 1237 610 1251 677 1224 623 1254 674 1223 625 1276 677 624 625 686 642 1223 651 661 614 678 677 625 624 1253 674 678 597 684 643 651 678 652 597 684 645 650 678 608 640 678 651 1260 614 679 675 626 623 686 642 1225 675 1207 641 680 648 652 624 1279 647 653 623 658 644 679 623 682 619 656 646 679 621 661 642 679 648 664 611 682 620 680 622 658 669 654 621 680 622 1253 647 665 637 684 617 680 597 688 638 654 647 681 595 1284 616 1253 622 1280 645 1254 622 686 614 681 647 654 622 657 644 681 596 686 640 1280 647 635 641 682 619 680 624 659 641 654 647 665 611 1280 621 689 639 655 646 680 597 685 641 655 646 681 596 685 616 680 623 682 644 681 620 663 639 1254 646 655 622 685 615 680 648 1264 611 707 647 639 637 685 616 681 647 636 640 684 617 680 596 684 643 681 622 686 642 652 648 654 623 685 616 680 648 638 638 682 619 706 623 658 643 654 647 684 592 682 646 654 623 686 642 652 648 660 642 683 619 680 623 657 670 653 621 681 595 683 644 654 623 709 617 680 648 637 639 684 617 681 647 635 640 1253 648 1234 641 1279 648 636 640 683 618 680 597 685 669 626 648 680 596 681 646 664 639 1255 645 681 596 1257 670 1226 647 1236 639 1254 646 1236 639 635 1191

(from here I ignore the preamble)

Any period of ~600 microseconds represents 1 physical bit. 1 is "yes carrier" and 0 is "no carrier" and that becomes:
10101010100100100101010101010101010100101001001001001001001010100101010100101010101010101010010101010010010101001010101010101010101010101010100101010101010100100100100101010101010100101010101010100101010101010101010101010010101010010101010101010101010101010101010101010101010101010101010101010101010101010101001001001010101010101010100101001001001001001011

Transitions from high to low "1", low to high "0" and remaining low "x":
111110x10000000000x110x10x10x1110000x1111111110000x1000x1111111111111110000000x10x10000000x1111111000000000000x1111000000000000000000000000000000000000000x10x11111111100x10x10x1x

That kind of looks like something? I'm not confident because if it were just manchester code, there would be no Xes in there. How about some other run length limited encodings?

## Hypothesis: It uses NRZI (non-return to zero inverted) plus some other run length limited code
In NRZI, 1 is a transition, 0 is no transition. This ended up looking really similar to my "manchester plus X for repeated 0" code, but conveying less information. Unlikely.

## Time to consult some prior research
There's an absolutely fantastic talk by [Natalie Silvanovich](https://natashenka.ca/about/) about hacking tamagotchis, ["Many Tamagotchis were harmed in the making of this presentation"](https://media.ccc.de/v/29c3-5088-en-many_tamagotchis_were_harmed_in_the_making_of_this_presentation_h264). Right at the end she mentions she calls the IR format "Nearly NEC". She also has a [github repo](https://github.com/natashenka/Tamagotchi-Hack) full of goodies related to this. It sounds like not all tamagotchis used IrDA.

## Hypothesis: The IR format is similar to NEC
### What it would look like if it used the [actual NEC format](https://www.vishay.com/docs/80071/dataform.pdf)
A 9000us burst, 4500us pause, then the data. A 1 is a 578 microsecond pulse followed by 1125 microseconds of space, a 0 is the same 578 us pulse followed by 2250 us of space. NEC also repeats the inverse of each word immediately.

### What I actually see
A 9500-ish microsecond burst with a 6000-ish microsecond pause, then a bunch of chunks that are a 600us pulse followed by either a 600us pause, or a 1200us pause. I won't be able to spot the inverse part well until I see it as ones and zeros. That looks extremely promising though. I'll follow the NEC convention and say the short pause is "1" and long pause is "0"

Here is what I get from the "nearly NEC" format:

1111000111111111010000001101110111111100111001101111111111111101111110000111111011111101111111111101110111111111111111111111111111111111111110001111111100111111

I don't see the inverted repetition from NEC, but everything else looks good. Let's proceed.

## What to look for next?
I believe there is a 3 way process of some sort going on, because when I replay the initiation from the flipper for my waiting tamagotchi, the tamagotchi sees that something is happening, but fails to connect. So it must be looking for something else after it sends the first response.

Recording with the flipper has been a little challenging because infrared likes to go everywhere and it was hard to isolate the two signals with the flipper. I tried to set up some aluminum foil, but the tamagotchi fell asleep (and then so did I).

## Building an IR transceiver
My next move is to set up a recorder that isn't the flipper (which stops any time there is a gap in the IR signal) to get the entire conversation. I can also set up a transmitter to try and spoof the other tamagotchi and edit bits of the response to see what happens.

### Setup
I used leftover parts I had laying around for this, and I think they were designed for Arduino (5.5V) and not raspberry pi pico (3.3V), but they're working fine so far. I chose to use a pico instead of some kind of arduino because reading about how to do things with an arduino makes me unhappy, and reading about raspberry pi is at worst neutral. If you're buying parts, you should probably get something designed to use with your microcontroller. 

For software, I'm using micropython to mess around and prototype. I used VSCode with the MicroPico extension, which, like, mostly works fine.

### Miscellaneous notes from writing some bad micropython
I started by essentially replicating the flipper's raw recording format. Just print out the run lengths and split on really long gaps. This revealed that there is a 4 way back and forth conversation to arrange a visit. I was able to record that into NEC-ish format and get my tamagotchi to visit itself, so I think the NEC assumption is OK for visits at least.

At this point we have exited the physical layer, and I need a better interface to play with the data I'm sending, to see if flipping some bits will still allow for a valid code. It seems like there would be some kind of error detection/rejection, so it might make things more complicated. 

An example visit, from my fake tamagotchi's perspective:

```
Sending
[0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1]


Received
[0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1]

Sending
[0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0]

Received
[0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
```

## The next layer
Now what? I have a proof of concept, possibly enough for a compelling tech demo if I worked in sales, but I'm not much closer to my dream of a tamagotchi build-a-friend app for the flipper.

I need to clean it up, and probably think about some architectural changes. It started doing some wonky stuff when I was dealing with the "buffer" of recorded lengths. Specifically, I need a way to see when no signal has been received for a long time and then 


## Additional stuff
~
My next move is to set up a recorder that isn't the flipper (which stops any time there is a gap in the IR signal) to get the entire conversation. I can also set up a transmitter to try and spoof the other tamagotchi and edit bits of the response to see what happens.
~

The information that must be being sent, somehow:
- What my creature looks like (is this a function of more than age and gender?)
- Gender (tamagotchi does not have a very nuanced understanding of this so it's just boy/girl)
- Nickname, 5 characters  (it goes in the other person's book)
- Possibly a device ID or creature ID? 
- For vs. games, the outcome or a seed to generate the outcome

This may not all be sent in the first message; it may be part of an additional conversation.

For sanity, I'm operating under the assumption that whoever made this was not trying to reinvent the wheel. That could be an incorrect assumption, because it is a well resourced game company that was already making custom hardware. That said, if I didn't want to reinvent the wheel I'd use some kind of serial format baked into my processor. So maybe whatever falls out of the physical layer will be a normal format that I've heard of before.

If the pixmob efforts were any indication, the most effective way to get answers will be to take the thing apart and dump the firmware and/or the ROM, but that's really hard.

Don't remember why this is here:

https://tldp.org/HOWTO/Infrared-HOWTO/infrared-howto-c-lirc-irda.html

