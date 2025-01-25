<script lang="ts" setup>
import AppStatusIndicator from './AppStatusIndicator.vue'
import AppButtonRetry from './AppButtonRetry.vue';

import { ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'

import { serialWorker, stopTask, waitForReady, listenContinuously, connectSerial } from '@/serialworkerinterface'
import { portNeedsToBeRequested } from '@/state';

// Store recorded messages as strings
let snoopOutput = ref(new Array<string>);

// The recordingID for each message that is staged.
const stagedMessageIDs = ref([NaN, NaN, NaN, NaN])
const statusIndicator = useTemplateRef("statusIndicator")
// The retry button is shown when this is true or if a port needs to be requested
const showRetryButton = ref(false)

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

defineExpose({ unstageMessage })

function stageMessage(recordingID: number, whichMessage: number) {
    if (whichMessage < 1 || whichMessage > 4) {
        throw Error("Invalid message" + whichMessage + ", can only stage message 1, 2, 3, or 4")
    }
    stagedMessageIDs.value[whichMessage - 1] = recordingID
    emit("stageMessage", whichMessage, recordingID, snoopOutput.value[recordingID])
}

function unstageMessage(whichMessage: number) {
    if (whichMessage < 1 || whichMessage > 4) {
        throw Error("Invalid message" + whichMessage + ", can only unstage message 1, 2, 3, or 4")
    }
    stagedMessageIDs.value[whichMessage - 1] = NaN
}

function clearList() {
    snoopOutput.value = []
    stagedMessageIDs.value = [NaN, NaN, NaN, NaN]
    emit("clearList")
}

onMounted(async () => {
    // Snoop-specific message handling code. More general message handling is in serial.ts
    serialWorker.addEventListener("message", snoopEventListener)
    snoop()
    // // Some test recordings to see the layout
    // snoopOutput.value.push("0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101")
    // snoopOutput.value.push("0000111000000001101111110010001000110001000110010000000000000010000001111000000100000000011001000010001000000000000000000000000000000000000000000000101001010100")
    // snoopOutput.value.push("0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011")
    // snoopOutput.value.push("0000111000001001101111110010001000110001000110010000000000000010000001111000000100000011000000000000000000000000000000000000000000000000000000000000000011001111")
    // stageMessage(1, 0)
    // stageMessage(2, 1)
    // stageMessage(3, 2)
    // stageMessage(4, 3)
})

// TODO: this was OnBeforeRouteLeave, did that break anything
onBeforeUnmount(() => {
    stopTask().catch(r => { console.log(r) })
    serialWorker.removeEventListener("message", snoopEventListener)
})

async function snoop() {
    showRetryButton.value = false
    await waitForReady()
    listenContinuously()
        .catch(r => { console.log("Snoop stopped :("); showRetryButton.value = true })
}

function retry() {
    connectSerial()
    snoop()
}

function snoopEventListener(e: MessageEvent) {
    const message = e.data as FromWorker
    switch (message.kind) {
        case "receivedBitstring": {
            snoopOutput.value.push(message.bits)
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

</script>

<template>
    <AppButtonRetry v-if="showRetryButton || portNeedsToBeRequested" direction="column" @retry="retry"></AppButtonRetry>
    <div v-else>
        <div class="recording-list">
            <div class="title">
                <AppStatusIndicator ref="statusIndicator"></AppStatusIndicator>
                <h2>Listening for input...</h2>
            </div>
            <div v-if="snoopOutput.length > 0" class="recording-table-container">
                <table>
                    <tbody>
                        <tr>
                            <th></th>
                            <th>Set as message</th>
                            <th></th>
                        </tr>
                        <template v-for="(message, messageIndex) in snoopOutput">
                            <tr>
                                <td>{{ messageIndex }}</td>
                                <td>
                                    <div class="set-message-buttons-container">
                                        <!-- n is 1-based, buttonIndex is 0 based -->
                                        <button v-for="(n, buttonIndex) in 4" class="round-button"
                                            :class="{ 'active-message-set-button': (messageIndex === stagedMessageIDs[buttonIndex]) }"
                                            @click="() => { stageMessage(messageIndex, n) }">{{ n
                                            }}</button>
                                    </div>
                                </td>
                                <td>
                                    <div class="bitstring">{{ message }}</div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
            <button v-if="snoopOutput.length > 0" @click="() => { clearList() }"
                class="icon-label-button">Clear</button>
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

.recording-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

th {
    position: sticky;
    top: 0;
}

.recording-table-container {
    max-height: 70vh;
    overflow-y: auto;
}

.bitstring {
    max-width: 40ch;
    font-family: monospace;
    text-wrap: wrap;
    word-wrap: break-word;
}

.set-message-buttons-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: baseline;
}

.round-button {
    font-size: large;
}

.active-message-set-button {
    background-color: var(--pink);
}
</style>