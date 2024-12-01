<script lang="ts" setup>
import { Conversation } from '@/conversation';
import { dbConnection } from '@/database';
import { TamaMessage } from '@/model';
import { connection } from '@/serial';
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ConversationNameInput from './ConversationNameInput.vue';

let snoopOutput = ref(new Array<TamaMessage>);

// // Some test recordings to see the layout
// snoopOutput.value.push(new TamaMessage("0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101"))
// snoopOutput.value.push(new TamaMessage("0000111000000001101111110010001000110001000110010000000000000010000001111000000100000000011001000010001000000000000000000000000000000000000000000000101001010100"))
// snoopOutput.value.push(new TamaMessage("0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011"))
// snoopOutput.value.push(new TamaMessage("0000111000001001101111110010001000110001000110010000000000000010000001111000000100000011000000000000000000000000000000000000000000000000000000000000000011001111"))

let cancelSnoop = false;
const needToRetry = ref(false);

let fromRecordingConversation = ref(new Conversation(null))
fromRecordingConversation.value.name = "Recorded Conversation"


function stopSnooping() {
    console.log("Snooping is cancelled :(")
    cancelSnoop = true;
    connection.stopListening();
}

async function snoop() {
    // stop any existing listening 
    stopSnooping()
    console.log("Snooping");
    cancelSnoop = false;
    needToRetry.value = false;
    // wait for cancelSnoop to be set
    try {
        while (true) {

            // console.log("Loop")
            if (cancelSnoop) {
                break;
            }
            let snoopedMessage = await connection.readOneCommandCancellable(null);
            // console.log(snoopedMessage)

            if (snoopedMessage != null) {
                snoopOutput.value.push(new TamaMessage(snoopedMessage))
            }
        }
    }
    catch (e) {
        console.error(e)
        needToRetry.value = true;
    }


    cancelSnoop = false;
}

const savedConversationName = ref("")

async function saveConversation() {
    // Name is required but just in case an empty string sneaks through don't store it
    console.log(fromRecordingConversation.value.name)
    if (fromRecordingConversation.value.name !== "") {
        await dbConnection.set(fromRecordingConversation.value.toStored())
    }
}

function saveName(newName: string) {
    fromRecordingConversation.value.name = newName;
}

onMounted(async () => {
    await snoop()
})

onUnmounted(() => {
    stopSnooping()
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
                    <h2>Listening for input...</h2>
                </div>
                <table class="recording-table" v-if="snoopOutput.length > 0">
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
h2 {
    text-align: center
}

.recording-body-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap-reverse;
    gap: 2rem 10rem;
    align-items: start;
    justify-content: space-around;
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