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
        // this is kind of silly because these won't be null as soon as the stuff is mounted, and the button
        // to make this happen also can't be clicked until then, but typescript doesn't know that
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
        this.message2.init(received1)
        this.message4.init(received2)
    }


    // Respond with messages 2 and 4 from the conversation UI
    async awaitConversation() {
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
        this.message1.init(received1)
        this.message3.init(received2)
    }


    stopWaiting() {
        connection.stopListening()
    }

    initFromStored(stored: StoredConversation) {
        this.message1 = new TamaMessage(stored.message1 ? stored.message1 : null)
        this.message2 = new TamaMessage(stored.message2 ? stored.message2 : null)
        this.message3 = new TamaMessage(stored.message3 ? stored.message3 : null)
        this.message4 = new TamaMessage(stored.message4 ? stored.message4 : null)
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



export const selectedConversation: Conversation = reactive(new Conversation(null))
// TODO maybe keep the last conversation that was being edited in local storage so it'll persist on page reload
export const editingConversation: Conversation = reactive(new Conversation(null))
export const fromRecordingConversation: Conversation = reactive(new Conversation(null))
