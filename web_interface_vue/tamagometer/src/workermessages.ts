// We have rust enums at home
// Rust enums at home:

// (I don't know if this is a good way to do this. It was slightly better than no type checking, maybe)

// To worker:

interface connectSerial {
    kind: "connectSerial"
    promiseID: number
}

interface conversation {
    kind: "conversation"
    message1: string
    message2: string
    conversationType: "initiate" | "await"
    promiseID: number
}

interface listenContinuously {
    kind: "listenContinuously"
    promiseID: number
}

interface stopTask {
    kind: "stopTask"
    promiseID: number
}

interface stopWorker {
    kind: "stopWorker"
    promiseID: number
}

interface startBootstrap {
    kind: "startBootstrap"
    promiseID: number
}

// From Worker:

interface result {
    kind: "result"
    result: "resolve" | "reject"
    error?: Error
    promiseID: number
    // task: "connectSerial" | "conversation" | "startBootstrap" | "listenContinuously" | "stopTask" | "stopWorker"
}

interface conversationResponse {
    kind: "conversationResponse"
    responseTo: "initiate" | "await"
    response1: string
    response2: string
}

interface receivedBitstring {
    kind: "receivedBitstring"
    bits: string
}

interface bootstrapStatus {
    kind: "bootstrapStatus"
    status: ""
    message1: string
    message2: string
    message3: string
    message4: string
}

interface workerError {
    kind: "workerError"
    error: Error
}

interface workerDone {
    kind: "workerDone"
}

interface animate {
    kind: "animate"
    animation: "statusIndicator" // | add options if there are more animations one day
}

type ToWorker = connectSerial | conversation | listenContinuously | startBootstrap | stopWorker | stopTask

type FromWorker = result | conversationResponse | receivedBitstring | workerError | workerDone | animate