import { error } from "console"
import { type SerialConnection, getSerialConnection } from "./serial"

let serialPort: SerialPort
let serialConnection: SerialConnection

onmessage = (async (e: MessageEvent) => {
    const message = e.data as ToConversationWorker
    // we have matching at home
    // matching at home:
    switch (message.kind) {
        case "connectSerial": {
            console.log("Connecting to serial...")
            // TODO choose a port more intelligently
            serialPort = (await navigator.serial.getPorts())[0]
            // get a serial connection object
            getSerialConnection(serialPort).then(r => {
                serialConnection = r
            }).catch((r) => {
                postMessage({ kind: "workerError", error: r }); return
            })
            break
        }
        case "stopWork": {
            if (serialConnection) {
                // free the serial port, and then notify the main thread that the worker is done
                serialConnection.destroy().then(r => postMessage({ kind: "workerDone" }))
            }
            break
        }
        case "conversation": {
            if (message.conversationType === "start") {
                startConversation(message.message1, message.message2).catch(r => postMessage({ kind: "workerError", error: r }))
            }
            else if (message.conversationType === "wait") {
                awaitConversation(message.message1, message.message2).catch(r => postMessage({ kind: "workerError", error: r }))
            }
            else {
                throw Error("Invalid conversation type:" + message.conversationType)
            }
            break
        }
        case "stopWaitingForConversation": {
            serialConnection.stopListening()
            break
        }
    }
})

// Send messages 1 and 3 from the conversation UI
async function startConversation(message1: string, message2: string) {
    // // stop anything currently waiting for input
    // this.stopWaiting()

    let received1 = await serialConnection.sendCommandUntilResponse(message1);
    if (received1 === null) {
        console.error("Response 1 not received")
        return;
    }
    console.log(`received ${received1}`)
    let received2 = await serialConnection.sendCommandUntilResponse(message2, 3);
    if (received2 === null) {
        console.error("Response 2 not received")
        return;
    }
    console.log(`received ${received2}`)
    postMessage({ kind: "conversationResponse", response1: received1, response2: received2, responseTo: "initiate" })
}


// Respond with messages 2 and 4 from the conversation UI
async function awaitConversation(message1: string, message2: string) {
    // // stop anything currently waiting for input
    // this.stopWaiting()
    // this is kind of silly because these won't be null as soon as the stuff is mounted, and the button
    // to make this happen also can't be clicked until then, but typescript doesn't know that
    // wait for a first message or until it's cancelled
    let received1 = await serialConnection.readOneCommandCancellable();
    if (received1 === null) {
        console.log("Cancelled, message 1 not received")
        return;
    }
    console.log(`Received ${received1}`);
    serialConnection.sendCommand(message1);
    // send the response and await a second message, repeat up to 3 times if necessary
    let received2 = await serialConnection.readOneCommandCancellable(3);
    if (received2 === null) {
        console.error("Message 2 not received")
        return;
    }
    console.log(`received ${received2}`);
    // send the final message 2 times just in case. The repeat is probably not 
    // necessary but my transmitter is a little wonky
    await serialConnection.sendCommandNTimes(message2, 2);
    postMessage({ kind: "conversationResponse", response1: received1, response2: received2, responseTo: "await" })
}
