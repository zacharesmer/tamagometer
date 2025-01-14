import { reactive, ref } from "vue"
import { Conversation } from "./conversation"

export const pageSettings = reactive({
    "hideKnownBits": true,
    "persistSettings": false
})

export let activeConversation: Conversation = reactive(new Conversation(null))

// This doesn't actually necessarily reflect whether the serial device is connected, but it's pretty close
// It only exists to track when to show the "Retry" option in the UI
export const serialMightBeConnected = ref(false)