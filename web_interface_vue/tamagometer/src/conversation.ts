export { Conversation, StoredConversation }

import { reactive } from "vue"
import { TamaMessage } from "./model"
import { connection } from './serial'

class Conversation {
    // Store 4 messages
    // start a conversation
    // wait for a conversation to start
    message1: TamaMessage
    message2: TamaMessage
    message3: TamaMessage
    message4: TamaMessage
    conversationID: any
    name: string
    constructor(dbId: number | null) {
        // this.conversationID = conversationID
        this.message1 = new TamaMessage(null)
        this.message2 = new TamaMessage(null)
        this.message3 = new TamaMessage(null)
        this.message4 = new TamaMessage(null)
        // If the conversation came from the database, it will have an ID set. 
    }
    // Send messages 1 and 3 from the conversation UI
    async startConversation() {
        // stop anything currently waiting for input
        this.stopWaiting()
        // this is kind of silly because these won't be null as soon as the stuff is mounted, and the button
        // to make this happen also can't be clicked until then, but typescript doesn't know that
        console.log(this)
        let received1 = await connection.sendCommandUntilResponse(this.message1.getBitstring());
        if (received1 === null) {
            console.error("Response 1 not received")
            return;
        }
        console.log(`received ${received1}`)
        let received2 = await connection.sendCommandUntilResponse(this.message3.getBitstring(), 3);
        if (received2 === null) {
            console.error("Response 2 not received")
            return;
        }
        console.log(`received ${received2}`)
        // not a typo, I'm setting every other message
        this.message2.update(received1)
        this.message4.update(received2)
    }


    // Respond with messages 2 and 4 from the conversation UI
    async awaitConversation() {
        // stop anything currently waiting for input
        this.stopWaiting()
        // this is kind of silly because these won't be null as soon as the stuff is mounted, and the button
        // to make this happen also can't be clicked until then, but typescript doesn't know that
        // wait for a first message or until it's cancelled
        let received1 = await connection.readOneCommandCancellable();
        if (received1 === null) {
            console.log("Cancelled, message 1 not received")
            return;
        }
        console.log(`Received ${received1}`);
        await connection.sendCommand(this.message2.getBitstring());
        // send the response and await a second message, repeat up to 3 times if necessary
        let received2 = await connection.readOneCommandCancellable(3);
        if (received2 === null) {
            console.error("Message 2 not received")
            return;
        }
        console.log(`received ${received2}`);
        // send the final message 2 times just in case. The repeat is probably not 
        // necessary but my transmitter is a little wonky
        await connection.sendCommandNTimes(this.message4.getBitstring(), 2);
        this.message1.update(received1)
        this.message3.update(received2)
    }


    stopWaiting() {
        connection.stopListening()
    }

    initFromStored(stored: StoredConversation) {
        this.message1.update(stored.message1, true)
        this.message2.update(stored.message2, true)
        this.message3.update(stored.message3, true)
        this.message4.update(stored.message4, true)
        this.name = stored.name
    }

    toStored() {
        return new StoredConversation(this)
    }
}

// Can't store objects with methods so this object holds a serialized conversation
class StoredConversation {
    message1: string
    message2: string
    message3: string
    message4: string
    name: string
    timestamp: number

    constructor(conversation: Conversation) {
        this.message1 = conversation.message1.getBitstring()
        this.message2 = conversation.message2.getBitstring()
        this.message3 = conversation.message3.getBitstring()
        this.message4 = conversation.message4.getBitstring()

        this.name = conversation.name

        this.timestamp = Date.now()
    }

}
