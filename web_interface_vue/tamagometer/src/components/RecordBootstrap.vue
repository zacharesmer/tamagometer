<script lang="ts" setup>
import AppStatusIndicator from './AppStatusIndicator.vue'
import AppButtonRetry from './AppButtonRetry.vue';

import { ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'

import { serialWorker, stopTask, connectSerial, bootstrap, waitForReady } from '@/serialworkerinterface'
import { portNeedsToBeRequested } from '@/state';

const statusIndicator = useTemplateRef("statusIndicator")
// The retry button is shown when this is true or if a port needs to be requested
const showRetryButton = ref(false)
const nextMessage = ref<1 | 2 | 3 | 4 | "idle">(1)
let messagesSoFar: [string, string, string, string] = ["", "", "", ""]

onMounted(async () => {
    // Bootstrap-specific message handling code. More general message handling is in serial.ts
    serialWorker.addEventListener("message", bootstrapEventListener)
    await waitForReady()
    startBootstrap()
})

onBeforeUnmount(() => {
    stopTask().catch(r => { console.log(r) })
    serialWorker.removeEventListener("message", bootstrapEventListener)
})


// Send messages to update the parent component. This is necessary because there 
// will be other components that can be used instead to record in different ways.
const emit = defineEmits<{
    (e: 'stageMessage',
        whichMessage: number, // which message this should be in the conversation
        recordingID: number, // In this case,the index of the array the recording is stored in
        bitstring: string // the bitstring for the message
    ): void,
    (e: 'clearList'
    ): void
}>()

defineExpose({ retryFrom })

function startBootstrap() {
    showRetryButton.value = false
    nextMessage.value = 1
    messagesSoFar = ["", "", "", ""]
    bootstrap(nextMessage.value, messagesSoFar).catch(r => {
        showRetryButton.value = true
    })
}

// advance the UI state and also tell the web worker to look for the next message
async function bootstrapNext() {
    // reimplement modulo arithmetic but 1 indexed, including a string, and bad
    console.log("hello there from bootstrapNext")
    console.log("Next message:", nextMessage.value)
    switch (nextMessage.value) {
        case "idle":
            nextMessage.value = 1
            break
        case 1:
        case 2:
        case 3:
            nextMessage.value++
            // wait for the tamagotchi to stop attempting to connect from last time
            console.log("Waiting for tamagotchi to finish sending")
            await new Promise(resolve => setTimeout(resolve, 3300))
            console.log("next step starting now, getting message ", nextMessage.value)
            bootstrap(nextMessage.value, messagesSoFar).catch(r => {
                // TODO check if the rejection was because a message wasn't received and show a different retry button 
                showRetryButton.value = true
            })
            break
        case 4:
            nextMessage.value = "idle"
            break
        default:
            console.error("Danger danger this should never reach the default case")
    }
}

function bootstrapEventListener(e: MessageEvent) {
    const message = e.data as FromWorker
    switch (message.kind) {
        case "bootstrapResponse": {
            // emit a signal to stage the received message
            stageMessage(message.whichMessage, message.bitstring)
            // update the UI state
            bootstrapNext()
            break
        }
        case "animate": {
            if (message.animation === "statusIndicator") {
                statusIndicator.value?.animateStatusIndicator()
            }
            break
        }
    }
}

function stageMessage(whichMessage: number, bitstring: string) {
    if (whichMessage < 1 || whichMessage > 4) {
        throw Error("Invalid message number," + whichMessage + ", can only stage message 1, 2, 3, or 4")
    }
    emit("stageMessage", whichMessage, NaN, bitstring)
    // Also update the local copy of messages so far
    messagesSoFar[whichMessage - 1] = bitstring
}

function retryFrom(whichMessage: number) {

}

async function retry() {
    showRetryButton.value = false
    connectSerial()
    emit("clearList")
    await stopTask().catch(r => { console.log(r) })
    startBootstrap()
}

</script>

<template>

    <AppButtonRetry v-if="showRetryButton || portNeedsToBeRequested" direction="column" @retry="retry"></AppButtonRetry>
    <div v-else class="prompt-container">
        <AppStatusIndicator ref="statusIndicator"></AppStatusIndicator>
        <div v-if="nextMessage == 1">
            <p>Getting message 1...</p>
            <p>Start an interaction on your tamagotchi</p>
        </div>
        <div v-if="nextMessage == 2">
            <p>Getting message 2...</p>
            <p>Wait for the same interaction on your tamagotchi</p>
        </div>
        <div v-if="nextMessage == 3">
            <p>Getting message 3...</p>
            <p>Start the interaction on your tamagotchi</p>
        </div>
        <div v-if="nextMessage == 4">
            <p>Getting message 4...</p>
            <p>Wait for the interaction on your tamagotchi</p>
        </div>
        <div v-if="nextMessage == 'idle'">
        </div>
        <button @click="retry" class="icon-label-button">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M61 20L56.3735 64.4144C56.1612 66.4521 54.4437 68 52.395 68H27.605C25.5563 68 23.8388 66.4521 23.6265 64.4144L19 20" />
                <path d="M65 20H15" />
                <path d="M27.8555 19.9986L33.926 12.3865H46.0747L52.1452 19.9986" />
            </svg>
            <span>Start over</span>
        </button>
    </div>
</template>

<style scoped>
.title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

h2 {
    text-align: center;
}

.prompt-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
</style>