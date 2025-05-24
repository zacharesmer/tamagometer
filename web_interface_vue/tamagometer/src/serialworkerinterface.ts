export { serialWorker, makeSerialWorker, connectSerial, listenContinuously, haveConversation, stopTask, waitForReady, connectToPort, bootstrap }
import { windowHasPort } from "./serialabstractionlayer"
// import { serial as polyfill } from 'web-serial-polyfill'

let serialWorker: Worker
let promiseRegistry: PromiseRegistry

// Return true if the connection is successful. The return value is used to determine 
// whether or not to show the button in the UI to request a port
async function connectToPort(requestPort: boolean): Promise<boolean> {
    let success = false
    if ("serial" in navigator){ // || "usb" in navigator) {
        //     if (!("serial" in navigator)) {
        //         let serial = polyfill
        //         console.log("using polyfill")
        //     }
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

// Used internally to store promises so that when the worker sends a response message, they can be resolved or rejected
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

// Sends a message to the web worker to call a function.
// Adds an ID to the message to identify it. Stores the ID and promise resolver/rejector functions 
// in a registry so it can be resolved or rejected based on a message from the worker.
function postMessagePromise(message: ToWorker): Promise<void> {
    return new Promise((resolve, reject) => {
        message.promiseID = promiseRegistry.registerPromise(resolve, reject)
        serialWorker.postMessage(message)
    })
}

// These functions are the externally used interface for the serial worker, so nothing else has to 
// care (much) that it's running in a web worker.
// If the worker is busy and a function is unable to run (eg, it's already listening and a "listen" message is sent)
// then the promise will be rejected immediately with a message about what tried to run, 
// and the worker won't do anything.

// The NaN promiseIDs get filled in by postMessagePromise before they're sent, they're just to satisfy TypeScript

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