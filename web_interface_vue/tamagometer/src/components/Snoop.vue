<script lang="ts" setup>
import ConversationNameInput from './ConversationNameInput.vue';
import StatusIndicator from './StatusIndicator.vue';

import { onMounted, ref, useTemplateRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router';
import { toast } from 'vue3-toastify';

import { Conversation } from '@/conversation';
import { dbConnection } from '@/database';
import { TamaMessage } from '@/model';
import { serialWorker, listenContinuously, stopTask, waitForReady, connectSerial } from '@/serial';
import { portNeedsToBeRequested } from '@/state';

// Store recorded messages as strings
let snoopOutput = ref(new Array<string>);

// Some test recordings to see the layout
// snoopOutput.value.push("0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101")
// snoopOutput.value.push("0000111000000001101111110010001000110001000110010000000000000010000001111000000100000000011001000010001000000000000000000000000000000000000000000000101001010100")
// snoopOutput.value.push("0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011")
// snoopOutput.value.push("0000111000001001101111110010001000110001000110010000000000000010000001111000000100000011000000000000000000000000000000000000000000000000000000000000000011001111")

// The retry button is shown when this is true or if a port needs to be requested
const showRetryButton = ref(false)
const conversationName = ref("Recorded Conversation")

const statusIndicator = useTemplateRef("statusIndicator")

const stagedMessageIndeces = ref<{ message1: number, message2: number, message3: number, message4: number }>(
    {
        message1: NaN,
        message2: NaN,
        message3: NaN,
        message4: NaN
    })

onMounted(async () => {
    // Snoop-specific message handling code. More general message handling is in serial.ts
    serialWorker.addEventListener("message", snoopEventListener)
    snoop()
})

onBeforeRouteLeave(async (to, from) => {
    stopTask().catch(r => { console.log(r) })
    serialWorker.removeEventListener("message", snoopEventListener)
})

async function snoop() {
    showRetryButton.value = false
    await waitForReady()
    listenContinuously()
        .catch(r => { console.log("Snoop stopped :("); showRetryButton.value = true })
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

// Create a conversation from the staged messages and store it.
function saveConversation() {
    // Check if all 4 messages have been selected, return and display an error if not
    if (Number.isNaN(stagedMessageIndeces.value.message1) ||
        Number.isNaN(stagedMessageIndeces.value.message2) ||
        Number.isNaN(stagedMessageIndeces.value.message3) ||
        Number.isNaN(stagedMessageIndeces.value.message4)) {
        toast("Could not save: missing messages", {
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: 'error',
            isLoading: false,
        })
        return
    }

    // Don't store a conversation with an empty name
    if (conversationName.value == "") {
        toast("Could not save: missing name", {
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: 'error',
            isLoading: false,
        })
        return
    }

    const fromRecordingConversation = new Conversation(null)
    fromRecordingConversation.message1 = new TamaMessage(snoopOutput.value[stagedMessageIndeces.value.message1]);
    fromRecordingConversation.message2 = new TamaMessage(snoopOutput.value[stagedMessageIndeces.value.message2]);
    fromRecordingConversation.message3 = new TamaMessage(snoopOutput.value[stagedMessageIndeces.value.message3]);
    fromRecordingConversation.message4 = new TamaMessage(snoopOutput.value[stagedMessageIndeces.value.message4]);
    fromRecordingConversation.name = conversationName.value;

    const toastId = toast("Saving...")
    dbConnection.set(fromRecordingConversation.toStored())
        .then(r => {
            toast.update(toastId, { render: "Saved", })
        })
        .catch(r => { toast.update(toastId, { render: "Error", type: "error" }) })
}

function saveName(newName: string) {
    conversationName.value = newName;
}

function clearList() {
    snoopOutput.value = []
    conversationName.value = "Recorded Conversation"
    stagedMessageIndeces.value = {
        message1: NaN,
        message2: NaN,
        message3: NaN,
        message4: NaN,
    }
}

function reloadPage() {
    window.location.reload()
}
</script>

<template>
    <div v-if="showRetryButton || portNeedsToBeRequested" class="retry">
        <p>Could not connect to serial.</p>
        <button @click="connectSerial(); snoop()">Retry</button>
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
                                                :class="{ 'active-message-set-button': (index === stagedMessageIndeces.message1) }"
                                                @click="() => { stagedMessageIndeces.message1 = index }">1</button>
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === stagedMessageIndeces.message2) }"
                                                @click="() => { stagedMessageIndeces.message2 = index }">2</button>
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === stagedMessageIndeces.message3) }"
                                                @click="() => { stagedMessageIndeces.message3 = index }">3</button>
                                            <button class="round-button"
                                                :class="{ 'active-message-set-button': (index === stagedMessageIndeces.message4) }"
                                                @click="() => { stagedMessageIndeces.message4 = index }">4</button>
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
            <div class="staged-messages-container">
                <ConversationNameInput :name="conversationName" @save-name="(newName) => { saveName(newName) }"
                    @save-new-conversation="saveConversation" class="title">
                </ConversationNameInput>
                <div class="message-label-container">
                    <button class="message-label round-button"
                        :class="{ 'message-label-set': (!Number.isNaN(stagedMessageIndeces.message1)) }"
                        @click="stagedMessageIndeces.message1 = NaN">
                        1
                    </button>
                    <div class="message from-tama1">
                        {{ Number.isNaN(stagedMessageIndeces.message1) ? "" : snoopOutput[stagedMessageIndeces.message1]
                        }}
                    </div>
                </div>
                <div class="message-label-container">
                    <div class="message from-tama2">
                        {{ Number.isNaN(stagedMessageIndeces.message2) ? "" : snoopOutput[stagedMessageIndeces.message2]
                        }}
                    </div>
                    <button class="message-label round-button"
                        :class="{ 'message-label-set': (!Number.isNaN(stagedMessageIndeces.message2)) }"
                        @click="stagedMessageIndeces.message2 = NaN">
                        2
                    </button>
                </div>
                <div class="message-label-container">
                    <button class="message-label round-button"
                        :class="{ 'message-label-set': (!Number.isNaN(stagedMessageIndeces.message3)) }"
                        @click="stagedMessageIndeces.message3 = NaN">
                        3
                    </button>
                    <div class="message from-tama1">
                        {{ Number.isNaN(stagedMessageIndeces.message3) ? "" : snoopOutput[stagedMessageIndeces.message3]
                        }}
                    </div>
                </div>
                <div class="message-label-container">
                    <div class="message from-tama2">
                        {{ Number.isNaN(stagedMessageIndeces.message4) ? "" : snoopOutput[stagedMessageIndeces.message4]
                        }}
                    </div>
                    <button class="message-label round-button"
                        :class="{ 'message-label-set': (!Number.isNaN(stagedMessageIndeces.message4)) }"
                        @click="stagedMessageIndeces.message4 = NaN">
                        4
                    </button>
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