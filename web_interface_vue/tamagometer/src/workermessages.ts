// We have rust enums at home
// Rust enums at home:

// (I don't know if this is a good way to do this. It was slightly better than no type checking, maybe)

interface conversation {
    kind: "conversation"
    message1: string
    message2: string
    conversationType: "start" | "wait"
}

interface conversationResponse {
    kind: "conversationResponse"
    responseTo: "initiate" | "await"
    response1: string
    response2: string
}

interface stopWaitingForConversation {
    kind: "stopWaitingForConversation"
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

interface animate {
    kind: "animate"
    animation: "statusIndicator" // | add more options as they get made
}

type ToConversationWorker = connectSerial | conversation | stopWork | stopWaitingForConversation

type FromConversationWorker = conversationResponse | workerDone | workerError | animate

type ToListeningWorker = connectSerial | stopWork

type FromListeningWorker = receivedBitstring | workerDone | workerError | animate