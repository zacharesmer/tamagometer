export { connection, exportForTesting, SerialConnection }

// if ("serial" in navigator) {
//     navigator.serial.addEventListener("connect", (e) => {
//         console.log(e)
//     })

//     navigator.serial.addEventListener("disconnect", (e) => {
//         console.log(e)
//     })
// }


// An object manage a connection to a serial device
class SerialConnection {
    private serialPort: SerialPort

    private textFromSerial: ReadableStream<string>
    private textFromSerialReader: ReadableStreamDefaultReader
    private textFromSerialPromise: Promise<void>
    private textToBytesForSerial: WritableStream<string>
    private textToBytesForSerialWriter: WritableStreamDefaultWriter
    private textToBytesForSerialPromise: Promise<void>

    private abortController: AbortController

    private cancelListen = false;

    // Used to show a status indicator in the UI.
    listenCallback: () => void

    constructor(port: SerialPort) {
        this.serialPort = port
        port.open({ baudRate: 9600 }).then((r) => {
            // Set up a controller to cancel everything when it's done
            this.abortController = new AbortController()

            // Set up text encoder and decoder
            const textDecoder = new TextDecoderStream();
            const textEncoder = new TextEncoderStream();

            // Attach the text encoding and decoding to the serial port
            this.textFromSerialPromise = this.serialPort.readable.pipeTo(textDecoder.writable, { signal: this.abortController.signal }).catch(r => { console.log(r) })
            this.textFromSerial = textDecoder.readable
            this.textFromSerialReader = this.textFromSerial.getReader()
            this.textToBytesForSerialPromise = textEncoder.readable.pipeTo(this.serialPort.writable, { signal: this.abortController.signal }).catch(r => { console.log(r) })
            this.textToBytesForSerial = textEncoder.writable
            this.textToBytesForSerialWriter = this.textToBytesForSerial.getWriter()
        }).catch(r => { console.error("Could not open serial port.", r) })
    }

    async readSerial(): Promise<ReadableStreamReadResult<any>> {
        const line = await this.textFromSerialReader.read()
        console.log("[READ]", line)
        return line
    }

    async sendLine(line: string) {
        console.log('[SEND]', line);
        await this.textToBytesForSerialWriter.write(line + '\r\n')
    }

    // Add the prefix "send", which tells the microcontroller to transmit the message
    sendCommand(code: string) {
        this.sendLine("send" + code);
    }

    async readOneCommand(): Promise<string | null> {
        // Returns either null (if timed out or the stream closed) or a string of 1 tamagotchi command.

        // match and return a string in the format [PICO]160 1s and 0s[END]
        // out of a stream that may be broken up in arbitrary chunks (the arbitrary chunks 
        // aspect is why this isn't a regex one-liner)

        // This handles a successful code, and a timeout from the pico, but NOT no response from the pico
        // So, don't unplug it in the middle of this. Actually, it's possible the stream 
        // would end if it's unplug and that's handled. It's not planned or designed to work like that, though.

        let commandMatched: { matchingChars: number, commandSoFar: string[] }
        commandMatched = { matchingChars: 0, commandSoFar: [] }
        let commandComplete = false;

        let timeoutMatched = 0;
        let timeoutComplete = false;

        await this.sendLine("listen")
        while (true) {
            const readSerialResult = await this.readSerial();
            // console.log("Result: " + readSerialResult.value ? readSerialResult.value : "")
            const { value, done: stream_done } = readSerialResult
            if (typeof (value) === "string") {
                ({ complete: commandComplete, commandMatched } = matchCommandString(commandMatched, value));
                ({ complete: timeoutComplete, matchingChars: timeoutMatched } = matchTimedOutString(timeoutMatched, value));
                // TODO: what happens if something is sent with both a valid message and a timeout signal? 
                if (commandComplete) {
                    // console.log("Got a command!!")
                    console.log("[READ]" + commandMatched.commandSoFar.join(""))
                    return commandMatched.commandSoFar.join("")
                }
                if (timeoutComplete) {
                    return null
                }
            }
            // this probably won't happen since the serial stream stays open
            if (stream_done) {
                console.log(`[readCommandLoop] DONE, ${commandMatched.commandSoFar.join("")}`);
                return null;
            }
        }
    }

    // listen for a command until it's received, cancelled, or this method times out
    async readOneCommandCancellable(timeout: number | null = null) {
        // cancelListen can be set by a callback for a button, so reset it in case that's happened
        this.cancelListen = false;
        let command = null;
        if (timeout === null) {
            while (command === null && !this.cancelListen) {
                // An error may bubble up from readOneCommand, but that's fine. The main source of that error is if someone clicks 
                // "cancel" on the serial connection prompt. If they do this repeatedly, the browser stops prompting (probably to 
                // prevent a malicious site from spamming). So, readOneCommand just prompts once and gives up with an error if they cancel.
                // No serial connection is pretty unrecoverable so I'm just letting it go
                command = await this.readOneCommand();
            }
        }
        else {
            for (let i = 0; i < timeout; i++) {
                if (this.cancelListen) {
                    break;
                }
                command = await this.readOneCommand();
                if (command != null) {
                    break;
                }
            }
        }
        // reset cancelListen to be a good citizen
        this.cancelListen = false;
        // console.log("Command: " + command)
        return command;
    }

    // stops the loop that's polling the microcontroller for a valid tamagotchi signal
    stopListening() {
        console.log("Listening cancelled")
        this.cancelListen = true;
    }

    async destroy() {
        this.textFromSerialReader.releaseLock()
        this.textToBytesForSerialWriter.releaseLock()
        // Send the signal to the piped streams to cancel their sources and abort their desinations
        this.abortController.abort("Closing encoder and decoder streams from serial...")
        // Wait for them to close
        await Promise.all([this.textFromSerialPromise, this.textToBytesForSerialPromise])
        console.log("Closing serial port...")
        await this.serialPort.close()
    }

    // returns the response, or null if one is not received after maxAttempts attempts
    async sendCommandUntilResponse(message: string, maxAttempts = 3): Promise<string | null> {
        for (let i = 0; i < maxAttempts; i++) {
            // this times out after however long is set on the microcontroller (currently 1 second)
            this.sendCommand(message);
            // listen for a response
            let response = await this.readOneCommand();
            if (response != null) {
                return response;
            }
        }
        return null;
    }

    // could make it cancelleable someday if I ever use it for N > 3 
    async sendCommandNTimes(message: string, maxAttempts = 3) {
        for (let i = 0; i < maxAttempts; i++) {
            this.sendCommand(message);
        }
    }
}

// When this moves into a web worker this initialization strategy will change
let port: SerialPort
let connection: SerialConnection
if ("serial" in navigator) {
    navigator.serial.getPorts().then(ports => {
        port = ports[0]
        connection = new SerialConnection(port)
    })
}


// These could just be methods in the serial connection object. I put them here because I thought it would be easier to test
// but it may or may not have made a difference.
function matchCommandString(commandMatched: { matchingChars: number, commandSoFar: string[] }, newString: string): { complete: boolean, commandMatched: { matchingChars: number, commandSoFar: string[] } } {
    // DIY regex for matching in place
    let { matchingChars, commandSoFar } = commandMatched
    const beginning = "[PICO]";
    const end = "[END]";
    const end_offset = 160 + beginning.length;
    const total_length = 160 + beginning.length + end.length;

    for (let i = 0; i < newString.length; i++) {
        let current = newString[i].toString();
        // console.log(`current: ${current}, command so far: ${command}, characters matched: ${matching_chars}`);
        // if we are in the header and match it, continue
        if (matchingChars < beginning.length && current === beginning[matchingChars]) {
            matchingChars++;
            // command.push(current);
        }
        // if we are in the main body and see a 1 or 0, continue and push it onto the thing we're saving
        else if (matchingChars < end_offset && (current === "0" || current === "1")) {
            commandSoFar.push(current);
            matchingChars++;
        }
        // if we're in the end and the character matches, continue
        else if (matchingChars >= end_offset && current === end[matchingChars - end_offset]) {
            matchingChars++;
        }
        // if none of those things happened then the pattern doesn't match.
        // reset the counter and clear out the recording to wait for a new one
        else {
            commandSoFar = [];
            matchingChars = 0;
        }

        // If the entire pattern has been matched, return it
        if (matchingChars === total_length) {
            return { complete: true, commandMatched: { matchingChars, commandSoFar } }
        }
    }
    // If the entire pattern wasn't matched, return any progress
    return { complete: false, commandMatched: { matchingChars, commandSoFar } }
}

function matchTimedOutString(matchingChars: number, newString: string): { complete: boolean, matchingChars: number } {
    const timedOutString = "[PICO]timed out[END]";

    for (let i = 0; i < newString.length; i++) {
        let current = newString[i].toString();
        // In this case, the next character matches
        if (current === timedOutString[matchingChars]) {
            matchingChars++;
        } else {
            matchingChars = 0;
        }
        // If the entire timedOutString has been matched, return
        if (matchingChars === timedOutString.length) {
            // console.log("Timed out")
            return { complete: true, matchingChars };
        }
    }
    // If nothing in newString matched the timedOutString, return the progress (if any)
    return { complete: false, matchingChars }
}

const exportForTesting = { matchCommandString, matchTimedOutString }