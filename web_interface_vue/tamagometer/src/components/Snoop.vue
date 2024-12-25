<script lang="ts" setup>
import { Conversation } from '@/conversation';
import { dbConnection } from '@/database';
import { TamaMessage } from '@/model';
import { onMounted, ref, useTemplateRef } from 'vue'
import ConversationNameInput from './ConversationNameInput.vue';
import { toast } from 'vue3-toastify';
import { getPortOrNeedToRetry } from '@/serial';
import StatusIndicator from './StatusIndicator.vue';
import { onBeforeRouteLeave } from 'vue-router';

let snoopOutput = ref(new Array<TamaMessage>);

// // Some test recordings to see the layout
// snoopOutput.value.push(new TamaMessage("0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101"))
// snoopOutput.value.push(new TamaMessage("0000111000000001101111110010001000110001000110010000000000000010000001111000000100000000011001000010001000000000000000000000000000000000000000000000101001010100"))
// snoopOutput.value.push(new TamaMessage("0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011"))
// snoopOutput.value.push(new TamaMessage("0000111000001001101111110010001000110001000110010000000000000010000001111000000100000011000000000000000000000000000000000000000000000000000000000000000011001111"))

const needToRetry = ref(false);
let worker: Worker;
let workerPromise: Promise<void>

let fromRecordingConversation = ref(new Conversation(null))
fromRecordingConversation.value.name = "Recorded Conversation"

const statusIndicator = useTemplateRef("statusIndicator")

// Called when the component is mounted or if it fails and the retry button is clicked
async function snoop() {
    needToRetry.value = await getPortOrNeedToRetry()
    // console.log("Snooping...");
    workerPromise = new Promise((resolve, reject) => {
        worker = new Worker(new URL("@/listeningWorker.ts", import.meta.url), { type: "module" })
        worker.onmessage = (e: MessageEvent) => {
            const message = e.data as FromListeningWorker
            switch (message.kind) {
                case "receivedBitstring": {
                    snoopOutput.value.push(new TamaMessage(message.bits))
                    break
                }
                case "workerDone": {
                    resolve()
                    break
                }
                case "workerError": {
                    needToRetry.value = true
                    reject(message.error)
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
        worker.onerror = (e) => { console.error("Error in listening worker:", e) }
        worker.postMessage({ kind: "connectSerial" })
    })
}

async function saveConversation() {
    // Make sure all messages have been selected
    if (fromRecordingConversation.value.oneOrMoreMessagesAreInvalid()) {
        toast("Could not save, invalid or missing messages", {
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: 'error',
            isLoading: false,
        })
    }
    // Name is a required field but just in case an empty string sneaks through don't store it
    else if (fromRecordingConversation.value.name !== "") {
        const toastId = toast("Saving...")
        dbConnection.set(fromRecordingConversation.value.toStored()).then(result => {
            toast.update(toastId, { render: "Saved", })
        }
        )
    }
}

function saveName(newName: string) {
    fromRecordingConversation.value.name = newName;
}

onMounted(async () => {
    snoop()
})

onBeforeRouteLeave(async (to, from, next) => {
    worker.postMessage({ kind: "stopWork" })
    await workerPromise.catch(r => {
        // This is usually a TypeError because the serial reader was cancelled and closed while it was reading
        // That's fine because it needs to stop no matter what when we leave the page.
        // console.log(r)
    })
    next()
})

const recordingIndeces = ref<{ message1: number, message2: number, message3: number, message4: number }>({
    message1: NaN,
    message2: NaN,
    message3: NaN,
    message4: NaN,
})

function setStagedMessage(whichMessage: "message1" | "message2" | "message3" | "message4", recordedIndex: number) {
    fromRecordingConversation.value[whichMessage].update(snoopOutput.value[recordedIndex].getBitstring())
    recordingIndeces.value[whichMessage] = recordedIndex;
}

function reloadPage() {
    window.location.reload()
}

function clearList() {
    snoopOutput.value = []
    fromRecordingConversation.value.clearMessages()
    fromRecordingConversation.value.name = "Recorded Conversation"
    recordingIndeces.value = {
        message1: NaN,
        message2: NaN,
        message3: NaN,
        message4: NaN,
    }

}

</script>

<template>
    <div v-if="needToRetry" class="retry">
        <p>Could not connect to serial.</p>
        <button @click="snoop">Retry</button>
        <p>Or if that doesn't work</p>
        <button @click="reloadPage">Refresh the page</button>
    </div>
    <div v-else>
        <div class="recording-body-container">
            <div class="recording-list">
                <div class="title">
                    <StatusIndicator ref="statusIndicator"></StatusIndicator>
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
                            <template v-for="(message, index) in snoopOutput">
                                <tr>
                                    <td>{{ index }}</td>
                                    <td>
                                        <div class="set-message-buttons-container">
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === recordingIndeces.message1) }"
                                                @click="() => { setStagedMessage('message1', index) }">1</button>
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === recordingIndeces.message2) }"
                                                @click="() => { setStagedMessage('message2', index) }">2</button>
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === recordingIndeces.message3) }"
                                                @click="() => { setStagedMessage('message3', index) }">3</button>
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === recordingIndeces.message4) }"
                                                @click="() => { setStagedMessage('message4', index) }">4</button>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="bitstring">{{ message.getBitstring() }}</div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
                <button v-if="snoopOutput.length > 0" @click="() => { clearList() }"
                    class="icon-label-button">Clear</button>
            </div>
            <div class="staged-messages-container">
                <ConversationNameInput :name="fromRecordingConversation.name"
                    @save-name="(newName) => { saveName(newName) }" @save-new-conversation="saveConversation"
                    class="title">
                </ConversationNameInput>
                <div class="message-label-container">
                    <div class="message-label round-button"
                        :class="{ 'message-label-set': (fromRecordingConversation.message1.getBitstring().length !== 0) }">
                        1
                    </div>
                    <div class="message from-tama1">
                        {{ fromRecordingConversation.message1.getBitstring() }}
                    </div>
                </div>
                <div class="message-label-container">
                    <div class="message from-tama2">
                        {{ fromRecordingConversation.message2.getBitstring() }}
                    </div>
                    <div class="message-label round-button"
                        :class="{ 'message-label-set': (fromRecordingConversation.message2.getBitstring().length !== 0) }">
                        2
                    </div>
                </div>
                <div class="message-label-container">
                    <div class="message-label round-button"
                        :class="{ 'message-label-set': (fromRecordingConversation.message3.getBitstring().length !== 0) }">
                        3
                    </div>
                    <div class="message from-tama1">
                        {{ fromRecordingConversation.message3.getBitstring() }}
                    </div>
                </div>
                <div class="message-label-container">
                    <div class="message from-tama2">
                        {{ fromRecordingConversation.message4.getBitstring() }}
                    </div>
                    <div class="message-label round-button"
                        :class="{ 'message-label-set': (fromRecordingConversation.message4.getBitstring().length !== 0) }">
                        4
                    </div>
                </div>
            </div>
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

.recording-body-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap-reverse;
    gap: 2rem 10rem;
    align-items: start;
    justify-content: space-around;
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

.retry {
    display: flex;
    flex-direction: column;
    align-items: center
}

.staged-messages-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.message {
    font-family: monospace;
    text-wrap: wrap;
    word-wrap: break-word;
    width: 40ch;
    padding: 1rem;
}

.message-label {
    background-color: var(--vanilla);
    text-align: center;
    border: 2px outset var(--dark-blue);
}

.message-label-set {
    background-color: var(--pink);
}

.message-label-container {
    display: flex;
    gap: 1rem;
    align-items: end;
}
</style>