<script lang="ts" setup>
import AppStatusIndicator from './AppStatusIndicator.vue'
import AppButtonRetry from './AppButtonRetry.vue';

import { ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'

import { serialWorker, stopTask, connectSerial, bootstrap, waitForReady } from '@/serial'
import { portNeedsToBeRequested } from '@/state';

const statusIndicator = useTemplateRef("statusIndicator")
// The retry button is shown when this is true or if a port needs to be requested
const showRetryButton = ref(false)
const nextMessage = ref<1 | 2 | 3 | 4>(1)
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

function startBootstrap() {
    showRetryButton.value = false
    nextMessage.value = 1
    messagesSoFar = ["", "", "", ""]
    bootstrap(nextMessage.value, messagesSoFar).catch(r => {
        showRetryButton.value = true
    })
}

function bootstrapNext() {
    // reimplement modulo arithmetic but 1 indexed and bad
    if (nextMessage.value == 4) {
        nextMessage.value = 1
    } else {
        nextMessage.value++
    }
    // TODO: it may be necessary to wait a couple of seconds for the tamagotchi to finish sending 
    // repeated signals
    bootstrap(nextMessage.value, messagesSoFar).catch(r => {
        showRetryButton.value = true
    })
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

// Send messages to update the parent component. This is necessary because there 
// will be other components that can be used instead to record in different ways.
const emit = defineEmits<{
    (e: 'stageMessage',
        stagedIndex: number, // which message this should be in the conversation
        recordingID: number, // In this case,the index of the array the recording is stored in
        bitstring: string // the bitstring for the message
    ): void,
    (e: 'clearList'
    ): void
}>()


function stageMessage(stagedIndex: number, bitstring: string) {
    if (stagedIndex < 0 || stagedIndex > 3) {
        throw Error("Invalid index, can only stage a message at index 0, 1, 2, or 3")
    }
    emit("stageMessage", stagedIndex, NaN, bitstring)
    // Also update the local copy of messages so far
    messagesSoFar[stagedIndex] = bitstring
}

async function retry() {
    showRetryButton.value = false
    connectSerial()
    await stopTask().catch(r => { console.log(r) })
    startBootstrap()
}

// - wait for a valid message (#1).
// - When a message (#1) is received, stage message #1 and tell the person to put their tamagotchi in waiting mode
// - Repeatedly send message (#1) and listen for a response.
// - When a message (#2) is received, stage message #2 and tell the person to send a request from their tamagotchi
// - Wait 3 seconds for the tamagotchi to finish its attempts and then begin listening again.
// - When a message (#1) is received, send message #2. Listen for a response. 
// - When a message (#3) is received, stage message #3. Wait for the tamagotchi to finish?
// - Repeatedly send message #1 and listen for a response. 
// - When a message (#2) is received, send message #3 and wait for a response. 
// - When a message (#4) is received, stage message #4


</script>

<template>

    <AppButtonRetry v-if="showRetryButton || portNeedsToBeRequested" direction="column" @retry="retry"></AppButtonRetry>
    <div v-else>
        <AppStatusIndicator ref="statusIndicator"></AppStatusIndicator>
        <div v-if="nextMessage == 1">
            Start an interaction on your tamagotchi
        </div>
        <div v-if="nextMessage == 2">
            Wait for interaction on your tamagotchi
        </div>
        <div v-if="nextMessage == 3">
            Start the interaction on your tamagotchi
        </div>
        <div v-if="nextMessage == 4">
            Wait for interaction on your tamagotchi
        </div>
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
</style>