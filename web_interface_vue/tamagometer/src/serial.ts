export { exportForTesting, getSerialConnection, getPortOrNeedToRetry }
export type { SerialConnection }

// An object manage the connection to a serial device
// It is exposed only through `getSerialConnection` because it requires async setup
class SerialConnection {
    serialPort: SerialPort

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

    // Do not call the constructor directly; it needs to be accessed through the getSerialConnection 
    // function so the object is actually initialized. This is necessary because opening the serial port is
    // asynchronous, and you can't await a constructor

    // The real "constructor"
    async init(port: SerialPort) {
        this.serialPort = port
        this.serialPort.addEventListener("disconnect", () => {
            this.destroy()
        })
        await this.serialPort.open({ baudRate: 9600 })
        // Set up a controller to cancel everything when it's done
        this.abortController = new AbortController()

        // Set up text encoder and decoder
        const textDecoder = new TextDecoderStream();
        const textEncoder = new TextEncoderStream();

        // Attach the text encoding and decoding to the serial port
        this.textFromSerialPromise = this.serialPort.readable.pipeTo(textDecoder.writable, { signal: this.abortController.signal }).catch(r => { console.log("textFromSerial:", r) })
        this.textFromSerial = textDecoder.readable
        this.textFromSerialReader = this.textFromSerial.getReader()
        this.textToBytesForSerialPromise = textEncoder.readable.pipeTo(this.serialPort.writable, { signal: this.abortController.signal }).catch(r => { console.log("textToBytesForSerial:", r) })
        this.textToBytesForSerial = textEncoder.writable
        this.textToBytesForSerialWriter = this.textToBytesForSerial.getWriter()
        return this
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

    // Add the prefix "send" to a message, which tells the microcontroller to transmit the message
    sendCommand(code: string) {
        this.sendLine("send" + code);
    }

    // Returns either null (if timed out or the stream closed) or a string of 1 tamagotchi command.
    // Matches /[PICO]([10]{160})[END]/ from of a stream that may be broken up in arbitrary chunks
    //
    // This is not implemented as a legit stream because it needs to support a back and forth conversation. 
    // I tried it as a stream, and it was great for passively recording, but it got weird with the conversations.
    // The matching logic is kind of wild, and at some point I will replace it with a regex
    async readOneCommand(): Promise<string | null> {
        let commandMatched: { matchingChars: number, commandSoFar: string[] }
        commandMatched = { matchingChars: 0, commandSoFar: [] }
        let commandComplete = false;

        let timeoutMatched = 0;
        let timeoutComplete = false;

        // Tell the microcontroller to listen for a command for 1 second
        await this.sendLine("listen")
        postMessage({ kind: "animate", animation: "statusIndicator" })
        while (true) {
            // This part is not in a try/catch because if there's an error with the serial connection, I actually want it to fail
            const readSerialResult = await this.readSerial();
            // console.log("Result: " + readSerialResult.value ? readSerialResult.value : "")
            const { value, done: stream_done } = readSerialResult
            if (typeof (value) === "string") {
                ({ complete: commandComplete, commandMatched } = matchCommandString(commandMatched, value));
                ({ complete: timeoutComplete, matchingChars: timeoutMatched } = matchTimedOutString(timeoutMatched, value));
                // TODO: what happens if something is sent with both a valid message and a timeout signal? 
                // For now the command matching takes precedence
                if (commandComplete) {
                    // console.log("Got a command!!")
                    console.log("[READ]" + commandMatched.commandSoFar.join(""))
                    return commandMatched.commandSoFar.join("")
                }
                if (timeoutComplete) {
                    return null
                }
            }
            // this might get called when the object is destroyed/cleaned up
            if (stream_done) {
                console.log(`[readCommandLoop] DONE, ${commandMatched.commandSoFar.join("")}`);
                return null;
            }
        }
    }

    // listen for a command until it's received, cancelled, or times out
    async readOneCommandCancellable(timeout: number | null = null) {
        // cancelListen can be set by a callback for a button, so reset it in case that's happened
        this.cancelListen = false;
        let command = null;
        // If no timeout is set, just listen indefinitely
        if (timeout === null) {
            while (command === null && !this.cancelListen) {
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

    // stops the loop in readOneCommandCancellable that's polling the microcontroller
    stopListening() {
        // console.log("Listening cancelled")
        this.cancelListen = true;
    }

    // Clean up the serial connection and close the port so a different script (probably a new web worker) can reconnect later
    async destroy() {
        // console.log("Destroy has been called")
        this.stopListening()
        // Release the reader's lock. If this happens when it still has pending .read() requests those will be rejected
        // with a TypeError. That's fine; when this method is called we want it to be released no matter what.
        this.textFromSerialReader.releaseLock()
        // Just in case, release the writer. This may be unnecessary.
        this.textToBytesForSerialWriter.releaseLock()
        // Send the signal to the piped streams to cancel their sources and abort their desinations
        // Aborting also closes the reader and writer
        this.abortController.abort("Closing encoder and decoder streams from serial...")
        // The textFromSerial stream should get cancelled by the abort signal, but for some reason it's not, so
        await this.textFromSerial.cancel("Reader needs to be cancelled separately??")
        // Wait for them to finish closing
        await Promise.all([this.textFromSerialPromise, this.textToBytesForSerialPromise])
        // console.log("Closing serial port...")
        await this.serialPort.close()
        console.log("Serial port closed.")
    }

    // Return the response, or null if one is not received after maxAttempts attempts
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

async function getSerialConnection(port: SerialPort) {
    // console.log("Making a new serial connection")
    return await new SerialConnection().init(port)
}

async function getPortOrNeedToRetry(): Promise<boolean> {
    let needToRetry = false
    let port: SerialPort
    // Check if serial API is even available
    if ("serial" in navigator) {
        let ports = await navigator.serial.getPorts()
        // console.log(ports)
        // If there's not a connected serial device that has been used before, request access to one
        if (ports.length === 0) {
            try {
                await navigator.serial.requestPort()
            }
            catch (err) {
                needToRetry = true
                console.error(err)
            }
        }
    } else {
        needToRetry = true
        console.error("Web Serial is not available in this browser")
    }
    return needToRetry
}

// These could just be methods in the serial connection object. I put them here because I thought it would be easier to test
// but it may or may not have made a difference.
function matchCommandString(commandMatched: { matchingChars: number, commandSoFar: string[] }, newString: string): { complete: boolean, commandMatched: { matchingChars: number, commandSoFar: string[] } } {
    // DIY regex for matching in place
    // This is kind of ridiculous and I will probably change it to a regular old regex at some point
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