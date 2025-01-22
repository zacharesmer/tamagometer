export { getSerialConnection }
export { serialWorker, makeSerialWorker, windowHasPort, connectSerial, listenContinuously, haveConversation, stopTask, waitForReady, connectToPort, bootstrap }
export type { SerialConnection }

import { matchCommandString, matchTimedOutString } from "./matchers"

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

    // Do not call the constructor directly; it needs to be accessed through the getSerialConnection 
    // function so the object is actually initialized. This is necessary because opening the serial port is
    // asynchronous, and you can't await a constructor

    // The real "constructor"
    async init(port: SerialPort) {
        this.serialPort = port
        this.serialPort.addEventListener("disconnect", () => {
        })
        await this.serialPort.open({ baudRate: 460800 })
        // Set up a controller to cancel everything when it's done
        this.abortController = new AbortController()

        // Set up text encoder and decoder
        const textDecoder = new TextDecoderStream();
        const textEncoder = new TextEncoderStream();

        // Attach the text encoder and decoder to the serial port
        this.textFromSerialPromise = this.serialPort.readable.pipeTo(textDecoder.writable, { signal: this.abortController.signal }).catch(r => { console.log("textFromSerial:", r) })
        this.textToBytesForSerialPromise = textEncoder.readable.pipeTo(this.serialPort.writable, { signal: this.abortController.signal }).catch(r => { console.log("textToBytesForSerial:", r) })

        // Save the other ends of the text encoder and decoder to send and receive from
        this.textFromSerial = textDecoder.readable
        this.textFromSerialReader = this.textFromSerial.getReader()
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
        this.sendLine("tamagometer send" + code);
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
        await this.sendLine("tamagometer listen")
        postMessage({ kind: "animate", animation: "statusIndicator" })
        while (true) {
            // The inside of this loop is not in a try/catch because if there's an error 
            // with the serial connection, I actually want it to fail.
            // There's a time out on the micro controller, but there needs to be a backup one here as
            // well so the page won't freeze if the microcontroller doesn't send its time out message
            const frontEndTimeout = new Promise<void>((resolve, reject) => {
                setTimeout(reject, 2000);
            });
            const readSerialResult = await Promise.race([this.readSerial(), frontEndTimeout])
            if (readSerialResult == null) {
                break
            }
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
        return null
    }

    // listen for a command until it's received, cancelled, or times out
    async readOneCommandCancellable(timeout: number | null = null): Promise<string | null> {
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
        // Release the writer
        this.textToBytesForSerialWriter.releaseLock()
        // Send the signal to the piped streams to cancel their sources and abort their desinations
        // Aborting also closes the now-unlocked reader and writer
        this.abortController.abort("Closing encoder and decoder streams from serial...")
        // The textFromSerial stream is supposed to get cancelled by the abort signal, but for some reason it's not, so
        await this.textFromSerial.cancel("Reader needs to be cancelled separately")
        // Wait for them to finish closing
        await Promise.all([this.textFromSerialPromise, this.textToBytesForSerialPromise])
        // console.log("Closing serial port...")
        await this.serialPort.close()
        console.log("Serial port closed.")
    }

    // Return the response, or null if one is not received after maxAttempts attempts
    async sendCommandUntilResponse(message: string, maxAttempts = 3): Promise<string | null> {
        this.cancelListen = false
        let response = null
        for (let i = 0; i < maxAttempts; i++) {
            if (this.cancelListen) {
                break
            }
            this.sendCommand(message);
            // listen for a response
            // this times out after however long is set on the microcontroller (currently 1 second)
            response = await this.readOneCommand();
            if (response != null) {
                break
            }
        }
        this.cancelListen = false;
        return response;
    }

    async sendCommandNTimes(message: string, maxAttempts = 3) {
        this.cancelListen = false
        for (let i = 0; i < maxAttempts; i++) {
            if (this.cancelListen) {
                break
            }
            this.sendCommand(message);
        }
        this.cancelListen = false
    }
}

// This has to be a factory because a constructor can't be async, but 
// opening the serial port is async and must be awaited for the SerialConnection to be created.
async function getSerialConnection(port: SerialPort) {
    // console.log("Making a new serial connection object")
    return await new SerialConnection().init(port)
}

// Check if the page has a port available. 
// This is the case if a request for a device/port has previously been granted and that device is connected.
async function windowHasPort() {
    // Check if serial API is even available
    if ("serial" in navigator) {
        let ports = await navigator.serial.getPorts()
        // console.log(ports)
        return !(ports.length == 0)
    }
}

// Return true if the connection is successful. The return value is used to determine 
// whether or not to show the button in the UI to request a port
async function connectToPort(requestPort: boolean): Promise<boolean> {
    let success = false
    if ("serial" in navigator) {
        if (requestPort) {
            await navigator.serial.requestPort().catch(r => { console.error(r); success = false })
        }
        if (await windowHasPort()) {
            await connectSerial()
                .catch(r => {
                    // InvalidStateError happens when the port is already open, which means it's 
                    // successfully connected and doesn't need to be requested.
                    if ((r as DOMException).name == "InvalidStateError") {
                        success = true
                    }
                    else {
                        console.error("Could not connect to serial")
                        success = false
                    }
                })
            success = true
        } else {
            success = false
        }
    }
    console.log("Connection successful?", success)
    return success
}

let serialWorker: Worker
let promiseRegistry: PromiseRegistry

// Used to store promises so that when the worker sends a response message, they can be resolved or rejected
class PromiseRegistry {
    promises = new Map<number, { resolve: Function, reject: Function }>()
    nextID = 0
    registerPromise(resolve: Function, reject: Function): number {
        const id = this.nextID
        this.nextID += 1
        this.promises.set(id, { resolve, reject })
        return id
    }
}


function makeSerialWorker() {
    promiseRegistry = new PromiseRegistry()
    serialWorker = new Worker(new URL("@/serialworker.ts", import.meta.url), { type: "module" })
    serialWorker.addEventListener("message", (e: MessageEvent) => {
        const message = e.data as FromWorker
        console.log("Message from worker:", message)
        if (message.kind == "result") {
            if (message.result == "resolve") {
                console.log("Resolving promise", message.promiseID)
                promiseRegistry.promises.get(message.promiseID)?.resolve()
            } else if (message.result == "reject") {
                console.log("Rejecting promise", message.promiseID)
                promiseRegistry.promises.get(message.promiseID)?.reject(message.error ? message.error : "")
            }
            promiseRegistry.promises.delete(message.promiseID)
        }

    })
    serialWorker.onerror = (e) => { console.error("Error in worker:", e) }
}

// Sends a message to the web worker to call a function.
// Adds an ID to the message to identify it. Stores the ID and promise resolver/rejector functions 
// in a registry so it can be resolved or rejected based on a message from the worker.
function postMessagePromise(message: ToWorker): Promise<void> {
    return new Promise((resolve, reject) => {
        message.promiseID = promiseRegistry.registerPromise(resolve, reject)
        serialWorker.postMessage(message)
    })
}

// These functions are an abstraction layer so nothing else has to care they're running in a web worker
// If the worker is busy and a function is unable to run (eg, it's already listening and a "listen" message is sent)
// then the promise will be rejected immediately, and the worker won't do anything

// The NaN promiseIDs get filled in by postMessagePromise before they're sent

function connectSerial(): Promise<void> {
    return postMessagePromise({ kind: "connectSerial", promiseID: NaN })
}

function haveConversation(message1: string, message2: string, conversationType: "initiate" | "await"): Promise<void> {
    return postMessagePromise({ kind: "conversation", message1, message2, conversationType, promiseID: NaN })
}

function listenContinuously(): Promise<void> {
    return postMessagePromise({ kind: "listenContinuously", promiseID: NaN })
}


function stopTask(): Promise<void> {
    return postMessagePromise({ kind: "stopTask", promiseID: NaN })
}

function waitForReady(): Promise<void> {
    return postMessagePromise({ kind: "waitForReady", promiseID: NaN })
}

function bootstrap(whichMessage: number, messagesSoFar: [string, string, string, string]): Promise<void> {
    return postMessagePromise({ kind: "startBootstrapMessage", whichMessage, messagesSoFar, promiseID: NaN })
}