export { connection, exportForTesting }

// A singleton object that holds a connection to a serial device, 
// and has some methods to write to and read from it.
class SerialConnection {
    private reader: ReadableStreamDefaultReader | null;
    private outputStream: WritableStream | null;
    private cancelListen = false;

    // The constructor makes an empty object. It can't be initialized until there is user interaction, 
    // but it's helpful for it to exist before then. If you try to use the object before it is initialized,
    // it will attempt to initialize itself first and prompt for you to select a serial device.
    constructor() {
        this.reader = null;
        this.outputStream = null;
    }

    // This is separate from the constructor because the object needs to exist before the site 
    // prompts you to allow access to serial. 
    async init() {
        if ("serial" in navigator) {
            try {
                // find and open a serial port to hand to the SerialConnection constructor
                // navigator will have serial because it is checked above, but typsecript doesn't know that apparently
                // @ts-ignore
                const port = await (navigator as Navigator).serial.requestPort();
                await port.open({ baudRate: 9600 });
                // connecting to the device must happen in a user-initiated interaction
                // set up a reader to get decoded text out of the port. Store the reader since we just need one
                const decoder = new TextDecoderStream();
                port.readable.pipeTo(decoder.writable);
                const inputStream = decoder.readable;
                this.reader = inputStream.getReader();

                // set up an output stream so the front end can write encoded text to the port. 
                // When this is used we'll make a new writer each time
                const encoder = new TextEncoderStream();
                let outputDone = encoder.readable.pipeTo(port.writable);
                this.outputStream = encoder.writable;

                // if the serial connection is lost, close the port and un-initialize 
                // the object so it can be tried again
                port.addEventListener("disconnect", () => {
                    this.reader = null
                    this.outputStream = null
                    port.close()
                })

            } catch (err) {
                console.error('There was an error opening the serial port:', err);
            }
        } else {
            throw Error("Webserial is not enabled in your browser. Try something based on Chromium.")
        }
    }

    async readSerial(): Promise<ReadableStreamReadResult<any>> {
        // If it hasn't been initialized (possibly the connect button hasn't been clicked), prompt for it again
        if (this.reader === null) {
            try {
                await this.init()
            }
            catch (error) {
                console.error(error)
            }
        }
        // check again if it's initialized (if not there was an error, or someone clicked "cancel")
        if (this.reader !== null) {
            const line = await this.reader.read()
            // console.log("[READ]", line)
            return line
        }
        // if it still isn't initialized after the prompt, give up.
        else { throw Error("Could not read serial.") }
    }

    // send text via serial, attempt to initialize the serial connection if it's not yet, 
    // or do nothing if an attempt to initialize the serial connection fails
    async sendSerial(...lines: string[]) {
        // If the connection hasn't been initialized, prompt for it again
        if (this.outputStream === null) {
            try {
                await this.init()
            }
            catch (error) {
                console.error(error)
                return
            }
        }
        // Check again after the initialization attempt. If it is not initialized, then there
        // was an error, or the person clicked "cancel" on the prompt
        if (this.outputStream !== null) {
            const writer = this.outputStream.getWriter();
            lines.forEach((line) => {
                console.log('[SEND]', line);
                writer.write(line + '\r\n');
            });
            writer.releaseLock();
        }
        // if it still isn't initialized after the prompt, give up.
        else {
            throw Error("Could not send serial")
        }
    }

    // Add the prefix "send", which tells the microcontroller to transmit the message
    async sendCommand(code: string) {
        return await this.sendSerial("send" + code);
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

        // Tell the board to listen for input
        await this.sendSerial("listen")
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
            // this case was in the example, but I'm not sure in what scenario it will actually happen
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

    // returns the response, or null if one is not received after maxAttempts attempts
    async sendCommandUntilResponse(message: string, maxAttempts = 3): Promise<string | null> {
        if (this.reader === null || this.outputStream === null) {
            try {
                await this.init()
            } catch (e) {
                console.error(e)
                return null
            }
        }
        for (let i = 0; i < maxAttempts; i++) {
            // this times out after however long is set on the microcontroller (currently 1 second)
            await this.sendCommand(message);
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

// Singleton connection that the whole page uses
const connection = new SerialConnection();

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