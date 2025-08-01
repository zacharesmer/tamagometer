import { reactive, ref } from "vue"
import { Conversation } from "./conversation"

export const pageSettings = reactive({
    "hideKnownBits": true,
    "persistSettings": false
})

// @ts-ignore
export let activeConversation: Conversation = reactive(new Conversation())

export const portNeedsToBeRequested = ref(false)