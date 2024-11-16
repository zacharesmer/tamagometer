export { Conversation }

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
    conversationID: string
    constructor(
        conversationID: string,
        message1: TamaMessage,
        message2: TamaMessage,
        message3: TamaMessage,
        message4: TamaMessage) {
        this.conversationID = conversationID
        this.message1 = message1
        this.message2 = message2
        this.message3 = message3
        this.message4 = message4
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
}

export const activeConversation = reactive(new Conversation("SingletonConvo", new TamaMessage(null), new TamaMessage(null), new TamaMessage(null), new TamaMessage(null)))