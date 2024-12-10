import { reactive } from "vue"
import { Conversation } from "./conversation"

export const pageSettings = reactive({
    "hideKnownBits": true,
    "persistSettings": false
})

export let activeConversation: Conversation = reactive(new Conversation(null))

