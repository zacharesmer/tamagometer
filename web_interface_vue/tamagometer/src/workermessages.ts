// We have rust enums at home
// Rust enums at home:

// To worker:

interface connectSerialMessage {
    kind: "connectSerial"
    promiseID: number
}

interface conversationMessage {
    kind: "conversation"
    message1: string
    message2: string
    conversationType: "initiate" | "await"
    promiseID: number
}

interface listenContinuouslyMessage {
    kind: "listenContinuously"
    promiseID: number
}

interface stopTaskMessage {
    kind: "stopTask"
    promiseID: number
}

interface stopWorkerMessage {
    kind: "stopWorker"
    promiseID: number
}

interface startBootstrapMessage {
    kind: "startBootstrap"
    whichMessage: number
    messagesSoFar: [string, string, string, string] // bootstrapping never actually uses the 4th message but for clarity I think it's nice to have
    promiseID: number
}

interface waitForReady {
    kind: "waitForReady"
    promiseID: number
}

// From Worker:

interface result {
    kind: "result"
    result: "resolve" | "reject"
    // only used in the case where it's a rejection
    error?: Error
    promiseID: number
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

interface bootstrapResponse {
    kind: "bootstrapStatus"
    bitstring: string
    whichMessage: number
}

interface workerDone {
    kind: "workerDone"
}

interface animate {
    kind: "animate"
    animation: "statusIndicator" // | add options if there are more animations one day
}

type ToWorker = connectSerialMessage | conversationMessage | listenContinuouslyMessage | startBootstrapMessage | stopWorkerMessage | stopTaskMessage | waitForReady

type FromWorker = result | conversationResponse | receivedBitstring | bootstrapResponse | workerDone | animate 