export { Conversation, StoredConversation }

import { TamaMessage, TamaMessage3, TamaMessage4 } from "./model"

class Conversation {
    // Store 4 messages
    // start a conversation
    // wait for a conversation to start
    message1: TamaMessage
    message2: TamaMessage
    message3: TamaMessage3
    message4: TamaMessage4
    conversationID: any
    name: string
    previousName: string
    dbId: IDBValidKey | null
    constructor() {
        this.dbId = null
        // this.conversationID = conversationID
        this.message1 = new TamaMessage(null)
        this.message2 = new TamaMessage(null)
        this.message3 = new TamaMessage3(null)
        this.message4 = new TamaMessage4(null)
        // If the conversation came from the database, it will have an ID set. 
    }

    initFromStored(stored: StoredConversation, dbId: IDBValidKey) {
        this.dbId = dbId
        this.message1.update(stored.message1, true)
        this.message2.update(stored.message2, true)
        this.message3.update(stored.message3, true)
        this.message4.update(stored.message4, true)
        this.name = stored.name
        this.previousName = this.name
    }

    toStored() {
        return new StoredConversation(this)
    }

    oneOrMoreMessagesAreInvalid() {
        const result = (this.message1.getBitstring().length !== 160 ||
            this.message2.getBitstring().length !== 160 ||
            this.message3.getBitstring().length !== 160 ||
            this.message4.getBitstring().length !== 160)
        return result
    }

    differs(): boolean {
        return this.message1.differs() || this.message2.differs() || this.message3.differs() || this.message4.differs() || this.nameDirty()
    }

    initialized(): boolean {
        return this.message1.initialized && this.message2.initialized && this.message3.initialized && this.message4.initialized
    }

    setName(newName: string) {
        this.name = newName
    }

    nameDirty(): boolean {
        return !(this.name === this.previousName)
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
