// Mostly from https://whatwebcando.today/serial.html , which cites Google developers code labs

let port;
let reader;
let writer;
let outputStream;

let receivedFromSerial;

document.getElementById('connect-to-serial').addEventListener('click', () => {
    if (navigator.serial) {
        connectSerial();
    } else {
        alert('Web Serial API not supported.');
    }
});

document.getElementById('read-serial').addEventListener('click', () => {
    const log = document.getElementById('error-message');
    if (navigator.serial) {
        try {
            readSerial();
        } catch (error) {
            log.innerText = error;
        }
    } else {
        alert('Web Serial API not supported.');
    }
});

document.getElementById('send-serial').addEventListener('click', () => {
    const log = document.getElementById('error-message');
    if (navigator.serial) {
        try {
            sendCode("0000111000000000110111100101101000011111100010001000100010001000100010001000100000000010000000000010001100000000000000000000000000000000000000000000000000110010");
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

    if (navigator.serial) {
        try {
            let command = await readOneCommand();
            log.innerText += command.join("");
            log.innerText += "\n\n";
        } catch (error) {
            errorLog.innerText = error;
        }
    }
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

async function readSerial() {
    const log = document.getElementById("output")
    sendSerial("listen");
    while (true) {
        const { value, done } = await reader.read();
        if (value) {
            // todo: instead of logging, load the serial input into a variable. 
            // When a newline is received, parse that variable into the different chunks
            log.textContent += value;
        }
        if (done) {
            console.log('[readLoop] DONE', done);
            reader.releaseLock();
            break;
        }
    }
}


async function readOneCommand() {
    // match and return a string in the format [PICO]160 1s and 0s[END]
    // out of a stream that may be broken up in arbitrary chunks
    // This handles a successful code, and a timeout from the pico, but NOT no response from the pico
    // So, don't unplug it in the middle of this or it will never return.
    // TODO: implement a client side timeout to handle that case

    // counter for every time a matching character is read from the stream, 
    // resets on invalid character or end of message (well, the function returns on the end of a valid message)
    let matching_chars = 0;

    const beginning = "[PICO]";
    const end = "[END]";
    const end_offset = 160 + beginning.length;
    const total_length = 160 + beginning.length + end.length;

    const timed_out = "timed out"
    let timed_out_matching_chars = 0;

    let command = [];
    let finished = false;

    // Tell the board to listen for input
    sendSerial("listen")

    while (!finished) {
        const { value, done } = await reader.read();
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
                // if we are in the main body and see a 1 or 0, continue and push it onto whatever we're saving
                else if (matching_chars < end_offset && (current === "0" || current === "1")) {
                    command.push(current);
                    matching_chars++;
                }
                // if we're in the end and matching, continue
                else if (matching_chars >= end_offset && current === end[matching_chars - end_offset]) {
                    matching_chars++;
                }
                // also match the timed out response string, and quit if it matches
                // TODO check if it matched
                else if (current === timed_out[timed_out_matching_chars]) {
                    timed_out_matching_chars++;
                }
                // if none of those things happened then the pattern doesn't match.
                // clear out the recording and wait for a new one
                else {
                    command = [];
                    matching_chars = 0;
                }

                if (timed_out_matching_chars === timed_out.length) {
                    throw Error("Microcontroller timed out!");
                }
                // If we have matched the total length, the whole string has been matched and we are done!
                // Or, if we have matched the timeout string, it timed out
                if (matching_chars === total_length) {
                    finished = true;
                    // break out of for loop into while loop
                    break;
                }
            }
        }
        if (done | finished) {
            console.log(`[readCommandLoop] DONE, ${command.join("")}`);
            break;
        }
    }
    // reader.releaseLock();
    return command;
}



async function sendSerial(...lines) {
    const writer = outputStream.getWriter();
    lines.forEach((line) => {
        console.log('[SEND]', line);
        writer.write(line + '\r\n');
    });
    writer.releaseLock();
}

async function sendCode(code) {
    return await sendSerial("send" + code);
}

//--------------
/// this should be a new file but that's a problem for future me
//--------------

let savedMessage1, savedMessage2;

document.getElementById("save-message-bitstrings").addEventListener("click", () => {
    // TODO: literally any validation whatsoever
    // this is all front end baybeeee! I don't have a server to care about.
    // putting incorrect values in here is only potentially hurting your pico
    savedMessage1 = document.getElementById("message1").value;
    savedMessage2 = document.getElementById("message2").value;
    console.log(`Saved message 1: ${savedMessage1} and message 2: ${savedMessage2}`);
});

document.getElementById("initiate-visit").addEventListener("click", async () => {
    const errorLog = document.getElementById("visit-error");
    const output = document.getElementById("visit-output");
    try {
        console.log(`Sending ${savedMessage1}`)
        // Send message 1
        sendCode(savedMessage1);
        // listen for a response
        let response1 = await readOneCommand();
        output.innerText += response1 + "\n"
        console.log(`received ${response1}`)
        // send message 2
        console.log(`Sending ${savedMessage2}`)
        sendCode(savedMessage2);
        // listen for a response
        let response2 = await readOneCommand();
        output.innerText += response1 + "\n"
        console.log(`received ${response2}`)
    } catch (error) {
        errorLog.innerText = error;
    }
});

document.getElementById("wait-for-visit").addEventListener("click", async () => {
    const errorLog = document.getElementById("visit-error");
    const output = document.getElementById("visit-output");
    try {
        // listen 
        let response1 = await readOneCommand();
        output.innerText += response1 + "\n"
        console.log(`received ${response1}`)
        console.log(`Sending ${savedMessage1}`)
        // Send message 1
        sendCode(savedMessage1);
        // listen for a response
        let response2 = await readOneCommand();
        output.innerText += response1 + "\n"
        console.log(`received ${response2}`)
        // send message 2
        console.log(`Sending ${savedMessage2}`)
        sendCode(savedMessage2);

    } catch {
        errorLog.innerText = error;
    }
});

document.getElementById("snoop").addEventListener("click", async () => {
    console.log("Snooping");
    for (let i = 0; i < 4; i++) {
        let message = await readOneCommand();
        document.getElementById("snoop-output").innerText += message.join("") + "\n";
    }
});