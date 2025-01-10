import { type SerialConnection, getSerialConnection } from "./serial"

// workerReady acts as a lock to keep multiple tasks from happening at once. 
// Use the boolean to check if it's held, and the promise to wait for it to be released.
// It's set to true for the first time after the SerialConnection object is created successfully.
let resolveWorkerReady: Function
let workerReady = { ready: false, promise: new Promise((resolve, reject) => { resolveWorkerReady = resolve }) }
// this is set to true to stop any tasks that would otherwise be stuck waiting for user/tamagotchi input
let cancelTask = false
let serialConnection: SerialConnection

onmessage = (async (e: MessageEvent) => {
    const message = e.data as ToWorker
    let unlockWhenDone = false
    console.log(message)
    // Set f to be the function the message is requesting. This allows us to write the promise message sending
    // part of it one time instead of every single time a kind of message is defined.
    // The default function rejects the promise immediately, which is what should happen if you try to tell 
    // the worker to do something while it's busy with something else.
    let f = () => { return new Promise<void>((resolve, reject) => { reject(Error("Command from message could not be run")) }) }
    switch (message.kind) {
        case "conversation":
            if (workerReady.ready) {
                unlockWhenDone = true
                workerReady = {
                    ready: false, promise: new Promise((resolve, reject) => {
                        resolveWorkerReady = resolve
                    })
                }
                if (message.conversationType === "initiate") {
                    f = async () => { await initiateConversation(message.message1, message.message2) }
                }
                else if (message.conversationType === "await") {
                    f = async () => { await awaitConversation(message.message1, message.message2) }
                }
                else {
                    throw Error("Invalid conversation type:" + message.conversationType)
                }
            }
            break
        case "listenContinuously":
            if (workerReady.ready) {
                unlockWhenDone = true
                workerReady = {
                    ready: false, promise: new Promise((resolve, reject) => {
                        resolveWorkerReady = resolve
                    })
                }
                f = listenContinuously
            }
            break
        case "startBootstrap":
            if (workerReady.ready) {
                unlockWhenDone = true
                workerReady = {
                    ready: false, promise: new Promise((resolve, reject) => {
                        resolveWorkerReady = resolve
                    })
                }
                f = startBootstrap
            }
            break
        case "connectSerial":
            {
                // Initial release of the lock to let everything else do its thing
                unlockWhenDone = true
                f = connectSerial
            }
            break

        case "stopTask":
            // only stop a task if the worker is busy (not ready)
            if (!workerReady.ready) {
                // Don't need to unlock when done, because the task itself will do that
                f = stopTask
            }
            break

        // This actually isn't that important because the worker should remain active until the whole page closes
        case "stopWorker":
            {
                await stopTask()
                serialConnection.destroy().then(
                    r => {
                        postMessage({ kind: "workerDone" })
                    }
                ).catch(
                    r => console.log(r)
                )
                break
            }
        default:
            {
                // Typescript underestimates me and thinks I've accounted for all the possible
                // kinds of messages, but it has been undefined at least once
                // @ts-ignore
                throw (Error("Invalid message kind: " + message.kind))
            }
    }

    // Send a message to the promise wrapper so that it can resolve or reject
    f().then(() => {
        console.log("Sending resolve message:", message.promiseID)
        postMessage({ kind: "result", result: "resolve", promiseID: message.promiseID })
    }).catch((r) => {
        console.error(r)
        console.log("Sending reject message:", message.promiseID)
        postMessage({
            kind: "result", result: "reject", promiseID: message.promiseID
        })
    }).finally(() => {
        // The worker needs to get unlocked when a task completes. 
        // This is also the callback for the fake non-task promise that gets rejected when the worker is busy, 
        // so unlockWhenDone is only set when a real task is started.
        if (unlockWhenDone) {
            resolveWorkerReady()
            workerReady.ready = true
            console.log(workerReady)
        }
    })
})

function connectSerial(): Promise<void> {
    // console.log("Connecting to serial...")
    // TODO choose a port more intelligently?
    return new Promise(async (resolve, reject) => {
        const serialPort = (await navigator.serial.getPorts())[0]
        getSerialConnection(serialPort).then(r => {
            serialConnection = r
            resolve()
        }).catch((r) => {
            postMessage({ kind: "workerError", error: r })
            reject(Error(r))
        })
    })
}

function initiateConversation(message1: string, message2: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        serialConnection.stopListening()
        let received1 = await serialConnection.sendCommandUntilResponse(message1).catch(r => { reject("Error sending message 1") })
        if (received1 == null) {
            console.error("Response 1 not received")
            reject("Response 1 not received")
            return
        }
        console.log(`received ${received1}`)
        let received2 = await serialConnection.sendCommandUntilResponse(message2, 3).catch(r => { reject("Error sending message 2") })
        if (received2 == null) {
            console.error("Response 2 not received")
            reject("Response 2 not received")
            return
        }
        console.log(`received ${received2}`)
        postMessage({ kind: "conversationResponse", response1: received1, response2: received2, responseTo: "initiate" })
        resolve()
    })

}


async function awaitConversation(message1: string, message2: string) {
    return new Promise<void>(async (resolve, reject) => {
        // wait for a first message or until it's cancelled
        let received1 = await serialConnection.readOneCommandCancellable().catch(r => { reject("Error receiving message 1") })
        if (received1 == null) {
            console.log("Cancelled, message 1 not received")
            reject("Message 1 not received")
            return
        }
        console.log(`Received ${received1}`);
        serialConnection.sendCommand(message1);
        // send the response and await a second message, repeat up to 3 times if necessary
        let received2 = await serialConnection.readOneCommandCancellable(3).catch(r => { reject("Error receiving message 3") })
        if (received2 == null) {
            console.error("Message 2 not received")
            reject("Message 2 not received")
            return
        }
        console.log(`received ${received2}`);
        // send the final message 2 times just in case. The repeat is probably not 
        // necessary but my transmitter is a little wonky
        await serialConnection.sendCommandNTimes(message2, 2);
        postMessage({ kind: "conversationResponse", response1: received1, response2: received2, responseTo: "await" })
        resolve()
    })
}

// The dispatching code checks that this will only be called if a task is actually running
function stopTask(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        // console.log("1")
        cancelTask = true
        // console.log("2")
        serialConnection.stopListening()
        // Wait for whatever task was running to finish
        // console.log("3")
        // console.log(workerReady)
        await workerReady.promise
        // console.log("4")
        resolve()
    })

}

async function listenContinuously() {
    return new Promise<void>(async (resolve, reject) => {
        while (!cancelTask) {
            const command = await serialConnection.readOneCommand().catch(
                r => {
                    // Break out of the loop if there's an error with the microcontroller, otherwise 
                    // it will loop really fast forever and crash the page
                    reject(Error("Error occurred in readOneCommand"))
                    cancelTask = true
                }
            )
            if (command) {
                console.log("Sending message:", command)
                postMessage({ kind: "receivedBitstring", bits: command })
            }
        }
        // Reset cancelTask so that this will run next time it's called
        cancelTask = false
        resolve()
    })
}

// TODO
async function startBootstrap() {
    return Promise.resolve()
}