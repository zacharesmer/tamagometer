import { type SerialConnection, getSerialConnection } from "./serial"

let serialPort: SerialPort
let serialConnection: SerialConnection
let continueListening = true

onmessage = (async (e: MessageEvent) => {
    const message = e.data as ToListeningWorker
    // we have matching at home
    // matching at home:
    switch (message.kind) {
        case "connectSerial": {
            // TODO choose a port more intelligently
            serialPort = (await navigator.serial.getPorts())[0]
            // get a serial connection object
            getSerialConnection(serialPort).then(r => {
                serialConnection = r
                listen().catch(r => {
                    postMessage({ kind: "workerError", r })
                })
            }).catch((r) => {
                postMessage({ kind: "workerError", r }); return
            })
            break
        }
        case "stopWork": {
            // break out of the listening loop
            continueListening = false
            // free the serial port, and then notify the main thread that the worker is done
            serialConnection.destroy().then(r => postMessage({ kind: "workerDone" }))
            break
        }
    }
})

async function listen() {
    while (continueListening) {
        const command = await serialConnection.readOneCommand().catch(r => { throw r })
        if (command) {
            console.log("Sending message:", command)
            postMessage({ kind: "receivedBitstring", bits: command })
        }
    }
}