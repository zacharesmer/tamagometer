// This module is unfortunately not used because I couldn't figure out how to make 
// it work with the back and forth conversation. Pulling more data from the 
// microcontroller is automagically handled by the stream, and for the 
// conversations I wanted something potentially less elegant but easier to 
// understand. 

class TamaMessageUnderlyingSource {
    serialPort: SerialPort
    // textEncoder: TextEncoderStream
    // textDecoder: TextDecoderStream
    textFromSerial: ReadableStream<string>
    textToBytesForSerial: WritableStream<string>
    // textReader: ReadableStreamDefaultReader
    // textWriter: WritableStreamDefaultWriter
    abortController: AbortController

    textFromSerialPromise: Promise<void>
    textToBytesForSerialPromise: Promise<void>

    // set up the serial connection
    async start(controller: ReadableStreamDefaultController) {
        // Open the serial port 
        // console.log("Starting...")
        // console.log("Getting serial port")
        if ((await navigator.serial.getPorts()).filter((p) => "connected" in p).length > 0) {
            this.serialPort = (await navigator.serial.getPorts())[0]
        } else {
            this.serialPort = await navigator.serial.requestPort()
        }
        // console.log(this.serialPort)
        await this.serialPort.open({ baudRate: 9600 }).catch(r => { console.error("Error opening serial port"); console.error(r) })
        // console.log(this.serialPort)

        // Set up a controller to cancel everything when it's done
        this.abortController = new AbortController()

        // Set up text encoder and decoder
        const textDecoder = new TextDecoderStream();
        const textEncoder = new TextEncoderStream();

        // Attach the text encoding and decoding to the serial port
        this.textFromSerialPromise = this.serialPort.readable.pipeTo(textDecoder.writable, { signal: this.abortController.signal }).catch(r => { console.log(r) })
        this.textFromSerial = textDecoder.readable
        this.textToBytesForSerialPromise = textEncoder.readable.pipeTo(this.serialPort.writable, { signal: this.abortController.signal }).catch(r => { console.log(r) })
        this.textToBytesForSerial = textEncoder.writable

    }

    // This is automatically called to fill the stream's queue. It will only be called as often as the promise resolves.
    async pull(controller: ReadableStreamDefaultController): Promise<void> {
        // console.log("Pull")
        const reader = this.textFromSerial.getReader()
        const writer = this.textToBytesForSerial.getWriter()
        // Send "listen" to the microcontroller to make it listen (time out is set to 1 second in the firmware)
        // console.log("Sending 'listen'")
        writer.write("listen\r\n").then(r => { writer.releaseLock(); "Releasing writer" })
        // Await the response, which is a timed out message or a command
        // For some reason anything sent to the board is also echoed back so that will show up too
        let readSoFar = ""
        // get chunks of text out of the serial connection
        // console.log("Getting a chunk from the microcontroller...")
        const { done, value } = await reader.read();
        // console.log("Chunk gotten:", value)
        // if the textReader is done then stop and reject the promise
        if (done) {
            // console.log("Microcontroller says it's done")
            reader.releaseLock()
            throw Error("Microcontroller is done")
        }
        // Otherwise forward its output to the stream
        else {
            controller.enqueue(value)
            // console.log(this)
            reader.releaseLock()
            return
        }
    }


    async cancel() {
        // Send the signal to the piped streams to cancel their sources and abort their desinations
        this.abortController.abort("Closing encoder and decoder streams from serial...")
        // Wait for the 
        await Promise.all([this.textFromSerialPromise, this.textToBytesForSerialPromise])
        console.log("Closing serial...")
        await this.serialPort.close()
    }
}

class TamaMessageTransformer implements Transformer {
    chunks: string
    constructor() {
        this.chunks = ""
    }
    transform(chunk: string, controller: TransformStreamDefaultController) {
        // console.log("Auto bots! Roll out. (transforming...)")
        // console.log(this.chunks)
        this.chunks = this.chunks + chunk
        // Match [PICO] + 160 1s or 0s + [END] and extract the 1s and 0s as a group named "command"
        const [...commandMatches] = this.chunks.matchAll(/\[PICO\](?<command>[10]{160})\[END\]/g)
        // Match [PICO]timed out[END]
        const [...timedOutMatches] = this.chunks.matchAll(/\[PICO\]timed out\[END\]/g)
        // enqueue the commands in order
        // console.log(commandMatches)
        for (let m of commandMatches) {
            if (m.groups !== undefined) {
                controller.enqueue(m.groups.command)
            }
        }
        if (this.chunks.includes("[END]")) {
            this.chunks = this.chunks.slice(this.chunks.lastIndexOf("[END]"))

        }
    }
}

let serialStream: ReadableStream
let serialStreamPromise: Promise<void>
let logStream: WritableStream
let serialStreamAbortController: AbortController

async function readSomething() {
    logStream = new WritableStream({
        write(chunk) {
            console.log("Chunk received:", chunk);
        },
    })

    serialStream = new ReadableStream(
        new TamaMessageUnderlyingSource(),
    )
    serialStreamAbortController = new AbortController()
    serialStream.pipeThrough(new TransformStream(new TamaMessageTransformer())).pipeTo(logStream, { signal: serialStreamAbortController.signal }).catch(r => { console.log(r) })
    console.log("Reading from the tamaMessageStreamReader")
}

async function cancel() {
    // serialStream.cancel()
    serialStreamAbortController.abort("Closing the stream from the microcontroller...")
}



export { readSomething, cancel }