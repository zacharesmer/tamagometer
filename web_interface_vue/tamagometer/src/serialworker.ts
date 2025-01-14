import { type SerialConnection, getSerialConnection } from "./serial"
import { serialMightBeConnected } from "./state"

// workerReady acts as a lock to keep multiple tasks from happening at once. 
// Use the boolean to check if it's held, and the promise to wait for it to be released.
// It's set to true for the first time after the SerialConnection object is created successfully.
let resolveWorkerReady: Function
let workerReady = { ready: false, promise: new Promise((resolve, reject) => { resolveWorkerReady = resolve }) }

// cancelTask can be set to `true` to cancel any tasks that would otherwise be stuck waiting for user/tamagotchi input
// it is set when the message stopTask is received
let cancelTask = false
let serialConnection: SerialConnection

function acquireWorkerLock() {
    if (!workerReady.ready) {
        throw Error("Worker is not ready; can't acquire the lock")
    }
    workerReady = {
        ready: false, promise: new Promise((resolve, reject) => {
            resolveWorkerReady = resolve
        })
    }
}

function releaseWorkerLock() {
    resolveWorkerReady()
    workerReady.ready = true
}

onmessage = (async (e: MessageEvent) => {
    const message = e.data as ToWorker
    console.log(message)
    // Set f to be the function the message is requesting. 
    // The default function rejects the promise immediately, which is what should happen if you try to tell 
    // the worker to do something while it's busy with something else.
    // Every function that this dispatches to must return a promise that resolves or rejects. If
    // a promise is left open the worker will be unable to do anything 
    let f = () => { return new Promise<void>((resolve, reject) => { reject(Error("Command from message could not be run")) }) }
    switch (message.kind) {
        case "conversation":
            if (message.conversationType === "initiate") {
                makePromiseWithLock(async () => { await initiateConversation(message.message1, message.message2) }, message.promiseID)
            }
            else if (message.conversationType === "await") {
                makePromiseWithLock(async () => { await awaitConversation(message.message1, message.message2) }, message.promiseID)
            }
            else {
                throw Error("Invalid conversation type:" + message.conversationType)
            }
            break

        case "listenContinuously":
            makePromiseWithLock(listenContinuously, message.promiseID)
            break

        case "startBootstrap":
            makePromiseWithLock(startBootstrap, message.promiseID)
            break

        case "connectSerial":
            // This has to be handled differently from the rest of the functions because it should only 
            // release the lock if it is successful. The other functions also need to release it if they fail.
            // Here the lock is released in the then(), not the finally()
            connectSerial().then(() => {
                // Initial release of the lock when the serial connection is successfully set up
                releaseWorkerLock()
                console.log("Sending resolve message:", message.promiseID)
                postMessage({ kind: "result", result: "resolve", promiseID: message.promiseID })
            }).catch((r) => {
                console.log(r)
                console.log("Sending reject message:", message.promiseID)
                postMessage({
                    kind: "result", result: "reject", error: r, promiseID: message.promiseID
                })
            }).finally(() => {
                // update the UI. This is a terrible name for this variable, I should change it
                serialMightBeConnected.value = true

            })
            break

        case "stopTask":
            // This needs to be handled differently from the other functions because it will only run when the lock is
            // already held by something else (either the worker is doing something else, or the serial connection has
            // not been set up yet)
            if (!workerReady.ready && serialConnection != undefined) {
                // Don't need to unlock when done, because the task itself will do that
                stopTask()
                    .then(() => {
                        console.log("Sending resolve message:", message.promiseID)
                        postMessage({ kind: "result", result: "resolve", promiseID: message.promiseID })
                    }).catch((r: Error) => {
                        console.log(r)
                        console.log("Sending reject message:", message.promiseID)
                        postMessage({
                            kind: "result", result: "reject", error: r, promiseID: message.promiseID
                        })
                    })
            } else {
                postMessage({
                    kind: "result", result: "reject", error: "Could not run command", promiseID: message.promiseID
                })
            }
            break

        case "waitForReady":
            await workerReady.promise.catch(r => { console.error("This promise can't be rejected; something has gone terribly wrong") })
            console.log("Ready!!!")
            postMessage({ kind: "result", result: "resolve", promiseID: message.promiseID })
            break

        // This actually isn't used anywhere because the worker should remain active until the whole page closes
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
})

function makePromiseWithLock(f: Function, promiseID: number) {
    // if the lock is not available, reject and give up. Otherwise acquire the lock and call the function.
    if (!workerReady.ready) {
        postMessage({
            kind: "result", result: "reject", error: "Could not run command", promiseID: promiseID
        })
        return
    }
    acquireWorkerLock()

    f().then(() => {
        console.log("Sending resolve message:", promiseID)
        postMessage({ kind: "result", result: "resolve", promiseID })
    }).catch((r: Error) => {
        console.log(r)
        console.log("Sending reject message:", promiseID)
        postMessage({
            kind: "result", result: "reject", error: r, promiseID
        })
    }).finally(() => {
        // The worker needs to get unlocked when a task is done, even if it was because of an error.
        releaseWorkerLock()
    })
}

function connectSerial(): Promise<void> {
    // console.log("Connecting to serial...")
    // TODO choose a port more intelligently?
    return new Promise(async (resolve, reject) => {
        const serialPort = (await navigator.serial.getPorts())[0]
        getSerialConnection(serialPort).then(r => {
            serialConnection = r
            resolve()
        }).catch((r) => {
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
            resolve()
            return
        }
        console.log(`received ${received1}`)
        let received2 = await serialConnection.sendCommandUntilResponse(message2, 3).catch(r => { reject("Error sending message 2") })
        if (received2 == null) {
            console.error("Response 2 not received")
            resolve()
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
            resolve()
            return
        }
        console.log(`Received ${received1}`);
        serialConnection.sendCommand(message1);
        // send the response and await a second message, repeat up to 3 times if necessary
        let received2 = await serialConnection.readOneCommandCancellable(3).catch(r => { reject("Error receiving message 3") })
        if (received2 == null) {
            console.error("Message 2 not received")
            resolve()
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
async function stopTask(): Promise<void> {
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
        cancelTask = false
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
        resolve()
        cancelTask = false
    })
}

// TODO
async function startBootstrap() {
    return Promise.resolve()
}