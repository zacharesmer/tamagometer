export { connection }

// A singleton object that holds a connection to a serial device, 
// and has some methods to write to and read from it
class SerialConnection {
    private reader: ReadableStreamDefaultReader | null;
    private outputStream: WritableStream | null;
    private cancelListen = false;
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
        if (this.reader !== null) {
            const line = await this.reader.read()
            // console.log("[READ]", line)
            return line
        }
        // this error should only be thrown in a case 
        else { throw Error("Could not read serial.") }
    }

    // send text via serial, or do nothing if it's not initialized
    async sendSerial(...lines: string[]) {
        // If it hasn't been initialized (possibly the connect button hasn't been clicked), prompt for it again
        if (this.outputStream === null) {
            try {
                await this.init()
            }
            catch (error) {
                console.error(error)
                return
            }
        }
        if (this.outputStream !== null) {
            const writer = this.outputStream.getWriter();
            lines.forEach((line) => {
                console.log('[SEND]', line);
                writer.write(line + '\r\n');
            });
            writer.releaseLock();
        }
        else {
            throw Error("Could not send serial")
        }
    }


    async sendCommand(code: string) {
        return await this.sendSerial("send" + code);
    }

    async readOneCommand(): Promise<string | null> {
        // Returns either null (if timed out or the stream closed) or a string of 1 tamagotchi command.

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

        // some of the error handling in here feels like it could be better

        // Tell the board to listen for input
        await this.sendSerial("listen")
        while (true) {
            const readSerialResult = await this.readSerial();
            const { value, done: stream_done } = readSerialResult
            // why am I implementing another finite automaton? maybe I should learn about stream APIs someday
            if (typeof (value) === "string") {
                for (let i = 0; i < value.length; i++) {
                    let current = value[i].toString();
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
                        return command.join("");
                    }
                }
            }
            if (stream_done) {
                console.log(`[readCommandLoop] DONE, ${command.join("")}`);
                return null;
            }
        }
    }

    // listen for a command until it's received, cancelled, or times out, whatever happens first.
    async readOneCommandCancellable(timeout: number | null = null) {
        // cancelListen can be set by a callback for a button, so reset it in case that's happened
        this.cancelListen = false;
        let command = null;
        if (timeout === null) {
            while (command === null && !this.cancelListen) {
                // An error may bubble up from readOneCommand, but so far the other options I've tried
                // let to weird behavior and infinite loops that crash the browser. 
                // The uncaught error doesn't seem to actually do anything bad so I'll leave it for now
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
        // reset cancelListen
        this.cancelListen = false;
        // console.log(command)
        return command;
    }

    // stops the loop that's polling the microcontroller for a command
    stopListening() {
        console.log("Listening cancelled")
        this.cancelListen = true;
    }

    // returns a response or null if one is not received after maxAttempts attempts
    async sendCommandUntilResponse(message: string, maxAttempts = 3) {
        if (this.reader === null || this.outputStream === null) {
            try {
                await this.init()
            } catch (e) {
                console.log(e)
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

    // send a command N times, could make it cancelleable, not sure how useful it even is
    async sendCommandNTimes(message: string, maxAttempts = 3) {
        for (let i = 0; i < maxAttempts; i++) {
            this.sendCommand(message);
        }
    }

}

// Singleton connection that the whole page uses
const connection = new SerialConnection();