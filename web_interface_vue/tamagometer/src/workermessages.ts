// We have rust enums at home
// Rust enums at home:

interface conversation {
    kind: "conversation"
    message1: string
    message2: string
    conversationType: "start" | "wait"
}

interface conversationResponse {
    kind: "conversationResponse"
    response1: string
    response2: string
}

interface stopWork {
    kind: "stopWork"
}

interface workerDone {
    kind: "workerDone"
}

interface workerError {
    kind: "workerError"
    error: Error
}

interface connectSerial {
    kind: "connectSerial"
}

interface receivedBitstring {
    kind: "receivedBitstring"
    bits: string
}

type ToConversationWorker = conversation | stopWork

type FromConversationWorker = conversationResponse | workerDone | Error

type ToListeningWorker = connectSerial | stopWork

type FromListeningWorker = receivedBitstring | workerDone | workerError