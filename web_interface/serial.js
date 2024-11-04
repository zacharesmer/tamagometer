// thanks to https://whatwebcando.today/serial.html , which cites 
// Google developers code labs: https://codelabs.developers.google.com/codelabs/web-serial/#3

export { sendCommand, readOneCommandCancellable, stopListening };

let port;
let reader;
let writer;
let outputStream;

let receivedFromSerial;

let cancelListen = false;

document.getElementById('connect-to-serial').addEventListener('click', () => {
    if (navigator.serial) {
        connectSerial();
    } else {
        alert('Web Serial API not supported.');
    }
});

document.getElementById('send-serial').addEventListener('click', () => {
    const log = document.getElementById('error-message');
    if (navigator.serial) {
        try {
            sendCommand("0000111000000000110111100101101000011111100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000110010");
        } catch (error) {
            log.innerText = error;
        }
    }
});

document.getElementById('reset-serial').addEventListener('click', () => {
    const log = document.getElementById('error-message');
    if (navigator.serial) {
        try {
            resetSerial();
        } catch (error) {
            log.innerText = error;
        }
    }
});

document.getElementById('read-one-command').addEventListener('click', async () => {
    const errorLog = document.getElementById('error-message');
    const log = document.getElementById("output")
    // reset this just in case something else forgot to
    cancelListen = false;
    if (navigator.serial) {
        try {
            let command = await readOneCommandCancellable();
            if (command != null) {
                log.innerText += command.join("");
                log.innerText += "\n\n";
            }
        } catch (error) {
            errorLog.innerText = error;
        }
    }
});

document.getElementById("cancel-listen").addEventListener("click", () => {
    cancelListen = true;
});

async function connectSerial() {
    const log = document.getElementById('error-message');
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        const decoder = new TextDecoderStream();
        port.readable.pipeTo(decoder.writable);
        const inputStream = decoder.readable;
        reader = inputStream.getReader();

        const encoder = new TextEncoderStream();
        let outputDone = encoder.readable.pipeTo(port.writable);
        outputStream = encoder.writable;

        // resetSerial();
    } catch (error) {
        log.innerHTML = error;
    }
}

async function resetSerial(params) {
    // probably won't use this
    // sends an EOF to get out of the micropython REPL
    sendSerial('\x04');
}

async function readOneCommand() {
    // Returns either null or a string of 1 tamagotchi command.

    // match and return a string in the format [PICO]160 1s and 0s[END]
    // out of a stream that may be broken up in arbitrary chunks

    // This handles a successful code, and a timeout from the pico, but NOT no response from the pico
    // So, don't unplug it in the middle of this. Actually, it's possible the stream 
    // would end if it's unplug and that's handled.

    const beginning = "[PICO]";
    const end = "[END]";
    const end_offset = 160 + beginning.length;
    const total_length = 160 + beginning.length + end.length;
    // counter that resets on invalid character
    let matching_chars = 0;

    const timed_out_string = "[PICO]timed out[END]";
    let timed_out_matching_chars = 0;

    let command = [];

    // Tell the board to listen for input
    sendSerial("listen")

    while (true) {
        const { value, done: stream_done } = await reader.read();
        // why am I implementing another finite automaton? maybe I should learn about stream APIs someday
        if (typeof (value) === "string") {
            for (let i = 0; i < value.length; i++) {
                let current = String(value[i]);
                // console.log(`current: ${current}, command so far: ${command}, characters matched: ${matching_chars}`);
                // if we are in the header and match it, continue
                if (matching_chars < beginning.length && current === beginning[matching_chars]) {
                    matching_chars++;
                    // command.push(current);
                }
                // if we are in the main body and see a 1 or 0, continue and push it onto the thing we're saving
                else if (matching_chars < end_offset && (current === "0" || current === "1")) {
                    command.push(current);
                    matching_chars++;
                }
                // if we're in the end and matching, continue
                else if (matching_chars >= end_offset && current === end[matching_chars - end_offset]) {
                    matching_chars++;
                }
                // if none of those things happened then the pattern doesn't match.
                // reset the counter and clear out the recording to wait for a new one
                else {
                    command = [];
                    matching_chars = 0;
                }

                // Check the time out string now
                // This is in a separate if/else chain because otherwise it will never match since they have the same start
                if (current === timed_out_string[timed_out_matching_chars]) {
                    timed_out_matching_chars++;
                } else {
                    timed_out_matching_chars = 0;
                }


                // If the time out indicator matched, return null so it can be retried or handled
                if (timed_out_matching_chars === timed_out_string.length) {
                    // break out into the while loop. 
                    // console.log("Timed out")
                    return null;
                }
                // If the whole length has matched, return it
                if (matching_chars === total_length) {
                    // break out of for loop into while loop
                    return command;
                }
            }
        }
        if (stream_done) {
            console.log(`[readCommandLoop] DONE, ${command.join("")}`);
            return null;
        }
    }
}

async function readOneCommandCancellable() {
    // cancelListen is set by a callback
    cancelListen = false;
    let command = null;
    while (command === null & !cancelListen) {
        command = await readOneCommand();
    }
    // reset cancelListen
    cancelListen = false;
    return command;
}

function stopListening() {
    cancelListen = true;
}

async function sendSerial(...lines) {
    const writer = outputStream.getWriter();
    lines.forEach((line) => {
        console.log('[SEND]', line);
        writer.write(line + '\r\n');
    });
    writer.releaseLock();
}

async function sendCommand(code) {
    return await sendSerial("send" + code);
}