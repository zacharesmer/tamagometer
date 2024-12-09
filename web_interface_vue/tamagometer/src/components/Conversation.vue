<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
// import { editingConversation, selectedConversation } from '@/conversation'
import { dbConnection } from '@/database';
import ConversationButtons from './ConversationButtons.vue';
import ConversationNameInput from './ConversationNameInput.vue';
import { useRoute } from 'vue-router';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { activeConversation as conversation } from '@/state';
import { getPortOrNeedToRetry } from '@/serial';

import { toast } from 'vue3-toastify'

const route = useRoute()
let workerPromise: Promise<void>
let worker: Worker

const needToRetry = ref(false)

onMounted(async () => {
    // TODO this might be a good place to check if the current conversation should be saved before overwriting it
    // Also I need to make this a query parameter at some point
    if (route.params.dbId) {
        const dbId = parseInt(route.params.dbId as string)
        const stored = await dbConnection.get(dbId)
        conversation.initFromStored(stored)
    }
    setUpWorker()
})

onBeforeUnmount(async () => {
    worker.postMessage({ kind: "stopWork" })
    await workerPromise
})

async function setUpWorker() {
    console.log("Setting up conversation worker...")
    needToRetry.value = await getPortOrNeedToRetry()
    if (! needToRetry.value) {
        workerPromise = new Promise((resolve) => {
            worker = new Worker(new URL("@/conversationWorker.ts", import.meta.url), { type: "module" })
            worker.onmessage = (e: MessageEvent) => {
                const message = e.data as FromConversationWorker
                console.log(message)
                switch (e.data.kind) {
                    case "conversationResponse": {
                        console.log(e.data.response1, e.data.response2)
                        break
                    }
                    case "workerDone": {
                        resolve()
                        break
                    }
                    case "workerError": {
                        needToRetry.value = true
                        break
                    }
                }
            }
            worker.onerror = (e) => { console.error("Error in listening worker:", e) }
            worker.postMessage({ kind: "connectSerial" })
        })
    }
}

function startConversation() {
    // TODO: I need something to prevent spamming the button. Maybe a promise in the 
    // webworker so it will just ignore any messages until the conversation is complete or cancelled?
    console.log("Starting conversation...")
    worker.postMessage({
        kind: "conversation",
        message1: conversation.message1.getBitstring(),
        message2: conversation.message3.getBitstring(),
        conversationType: "start"
    })
}

function awaitConversation() {
    console.log("Sending message to await conversation...")
    console.log(worker)
    worker.postMessage({
        kind: "conversation",
        message1: conversation.message2.getBitstring(),
        message2: conversation.message4.getBitstring(),
        conversationType: "wait"
    })
}

function stopWaiting() {
    worker.postMessage({ kind: "stopWaitingForConversation" })
}

// Write the current conversation to the database. 
// Update the selected conversation to the newly created one
function saveNewConversation(newName: string) {
    if (conversation.oneOrMoreMessagesAreInvalid()) {
        toast("Could not save conversation without all messages", { type: 'error' })
        return
    }
    const toastId = toast("Saving...")
    conversation.name = newName;
    dbConnection.set(conversation.toStored()).then(async dbId => {
        const stored = await dbConnection.get(dbId)
        conversation.initFromStored(stored)
        toast.update(toastId, {
            render: "Saved",
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: 'success',
            isLoading: false,
        })
    })
}

function saveName(newName: string) {
    // console.log(newName)
    conversation.name = newName;
}

function reloadPage() {
    window.location.reload()
}

</script>


<template>
    <div v-if="!conversation.oneOrMoreMessagesAreInvalid()">
        <div class="name-buttons-container">
            <ConversationNameInput class="name-input"
                @save-new-conversation="(newName) => { saveNewConversation(newName) }"
                @save-name="(newName) => { saveName(newName) }" :name="conversation.name">
            </ConversationNameInput>
            <div v-if="needToRetry" class="retry">
                <p>Could not connect to serial.</p>
                <button @click="setUpWorker">Retry</button>
                <p>Or if that doesn't work</p>
                <button @click="reloadPage">Refresh the page</button>
            </div>
            <ConversationButtons v-else class="conversation-buttons" @start-conversation="() => { startConversation() }"
                @await-conversation="() => { awaitConversation() }" @stop-waiting="() => { stopWaiting() }">
            </ConversationButtons>
        </div>
        <div class="messages-container">
            <BitstringInput :model="conversation.message1" bitstring-id="editingConversationMessage1"
                class="message from-tama1"></BitstringInput>
            <BitstringInput :model="conversation.message2" bitstring-id="editingConversationMessage2"
                class="message from-tama2"></BitstringInput>
            <BitstringInput :model="conversation.message3" bitstring-id="editingConversationMessage3"
                class="message from-tama1"></BitstringInput>
            <BitstringInput :model="conversation.message4" bitstring-id="editingConversationMessage4"
                class="message from-tama2"></BitstringInput>
        </div>
    </div>
    <div v-else>
        <h2>No conversation selected.</h2>
    </div>
</template>

<style scoped>
.name-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    padding-bottom: 1rem;
    align-items: center;
}

.retry {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.messages-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>