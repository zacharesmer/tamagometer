<script lang="ts" setup>
import AppInputConversationName from './AppInputConversationName.vue';
import RecordSnoop from './RecordSnoop.vue';

import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { toast } from 'vue3-toastify';

import { Conversation } from '@/conversation';
import { dbConnection } from '@/database';
import { TamaMessage } from '@/model';
import RecordBootstrap from './RecordBootstrap.vue';
import { useRoute } from 'vue-router';

const conversationName = ref("Recorded Conversation")
const snoopComponent = useTemplateRef("snoop")
const bootstrapComponent = useTemplateRef("bootstrap")
const recordingMode = ref("")
const route = useRoute()

// messages are 1-indexed everywhere except when stored in this array
const stagedMessages = ref<{ bitstring: string, recordingID: number }[]>([
    { bitstring: "", recordingID: NaN },
    { bitstring: "", recordingID: NaN },
    { bitstring: "", recordingID: NaN },
    { bitstring: "", recordingID: NaN },
])

onMounted(() => {
    const mode = route.params.mode
    if (mode == 'snoop' || mode == 'bootstrap') {
        recordingMode.value = mode
    } else {
        recordingMode.value = 'snoop'
    }
})

watch(
    () => route.params.mode,
    (newMode, oldMode) => {
        if (newMode == 'snoop' || newMode == 'bootstrap') {
            recordingMode.value = newMode
        } else {
            recordingMode.value = 'snoop'
        }
    }
)

function stageMessage(whichMessage: number, recordingID: number, bitstring: string) {
    stagedMessages.value[whichMessage - 1] = { bitstring, recordingID }
}

function unstageMessage(whichMessage: number) {
    stagedMessages.value[whichMessage - 1] = { bitstring: "", recordingID: NaN }
    // tell the recording component to mark the message as unstaged too
    if (snoopComponent.value != null) {
        snoopComponent.value.unstageMessage(whichMessage)
    }
    if (bootstrapComponent.value != null) {
        bootstrapComponent.value.retryFrom(whichMessage)
    }
}

function clearList() {
    conversationName.value = "Recorded Conversation"
    for (let i = 0; i < stagedMessages.value.length; i++) {
        stagedMessages.value[i] = { bitstring: "", recordingID: NaN }
    }
    console.log(stagedMessages.value)
}

function saveName(newName: string) {
    conversationName.value = newName;
}

// Create a conversation from the staged messages and store it.
function saveConversation() {
    // Check if all 4 messages have been selected, return and display an error if not
    for (let m of stagedMessages.value) {
        if (m.bitstring == "") {
            toast("Could not save: missing at least one message", {
                autoClose: true,
                closeOnClick: true,
                closeButton: true,
                type: 'error',
                isLoading: false,
            })
            return
        }
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
    fromRecordingConversation.message1 = new TamaMessage(stagedMessages.value[0].bitstring);
    fromRecordingConversation.message2 = new TamaMessage(stagedMessages.value[1].bitstring);
    fromRecordingConversation.message3 = new TamaMessage(stagedMessages.value[2].bitstring);
    fromRecordingConversation.message4 = new TamaMessage(stagedMessages.value[3].bitstring);
    fromRecordingConversation.name = conversationName.value;

    const toastId = toast("Saving...")
    dbConnection.set(fromRecordingConversation.toStored())
        .then(r => {
            toast.update(toastId, { render: "Saved", })
        })
        .catch(r => { toast.update(toastId, { render: "Error", type: "error" }) })
}
</script>

<template>
    <div class="recording-body-container">
        <RecordSnoop v-if="recordingMode == 'snoop'" @stage-message="stageMessage" @clear-list="() => { clearList() }"
            ref="snoop" />
        <RecordBootstrap v-if="recordingMode == 'bootstrap'" @stage-message="stageMessage"
            @clear-list="() => { clearList() }" ref="bootstrap" />
        <div class="staged-messages-container">
            <AppInputConversationName :name="conversationName" @save-name="(newName) => { saveName(newName) }"
                @save-new-conversation="saveConversation" class="title">
            </AppInputConversationName>
            <div v-for="(n, index) in 4" class="message-label-container"
                :class="(index % 2 == 0) ? 'button-on-left' : 'button-on-right'">
                <button class="message-label round-button"
                    :class="{ 'message-label-set': (!(stagedMessages[index].bitstring == '')) }"
                    @click="() => { unstageMessage(n) }">{{ n }}</button>
                <div :class="(index % 2 == 0) ? 'message from-tama1' : 'message from-tama2'">
                    {{ stagedMessages[index].bitstring }}
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

.recording-body-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap-reverse;
    gap: 2rem 10rem;
    align-items: start;
    justify-content: space-around;
}

.recorder-selector-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
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

.button-on-left {
    flex-direction: row;

}

.button-on-right {
    flex-direction: row-reverse;
}
</style>