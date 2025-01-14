<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
import ConversationButtons from './ConversationButtons.vue';
import ConversationNameInput from './ConversationNameInput.vue';
import StatusIndicator from './StatusIndicator.vue';
import RetryButton from './RetryButton.vue';

import { onMounted, ref, useTemplateRef } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify'

import { dbConnection } from '@/database';
import { serialWorker, haveConversation, stopTask, connectSerial } from '@/serial';
import { activeConversation as conversation } from '@/state';

const route = useRoute()

const showRetryButton = ref(false)

const statusIndicator = useTemplateRef("statusIndicator")

onMounted(async () => {
    if (route.query.dbid) {
        const dbId = parseInt(route.query.dbid as string)
        const stored = await dbConnection.get(dbId)
        conversation.initFromStored(stored)
    }
    serialWorker.addEventListener("message", conversationEventListener)
})

onBeforeRouteLeave(async (to, from) => {
    stopTask().catch(r => { })
    serialWorker.removeEventListener("message", conversationEventListener)
})

// Conversation-specific message handling. More general message handling is in serial.ts
function conversationEventListener(e: MessageEvent) {
    const message = e.data as FromWorker
    switch (message.kind) {
        // Update the UI with the responses
        // In some distant future it could make sense for these responses to be passed through the `resolve` 
        // of the promise. 
        case "conversationResponse": {
            // console.log(message.response1, message.response2)
            // console.log(message)
            if (message.responseTo == "initiate") {
                console.log("Updating messages 2 and 4...")
                conversation.message2.update(message.response1)
                conversation.message4.update(message.response2)
            }
            if (message.responseTo == "await") {
                console.log("Updating messages 1 and 3...")
                conversation.message1.update(message.response1)
                conversation.message3.update(message.response2)
            }
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

async function startConversation() {
    // console.log("Starting conversation...")
    await haveConversation(
        conversation.message1.getBitstring(),
        conversation.message3.getBitstring(),
        'initiate'
    ).catch(r => { showRetryButton.value = true })
}

async function awaitConversation() {
    await haveConversation(
        conversation.message2.getBitstring(),
        conversation.message4.getBitstring(),
        "await",
    ).catch(r => { showRetryButton.value = true })
}

function stopWaiting() {
    stopTask().catch(r => { })
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

function retry() {
    showRetryButton.value = false
    connectSerial()
}

</script>


<template>
    <div v-if="!conversation.oneOrMoreMessagesAreInvalid()">
        <div class="name-buttons-container">
            <ConversationNameInput class="name-input"
                @save-new-conversation="(newName) => { saveNewConversation(newName) }"
                @save-name="(newName) => { saveName(newName) }" :name="conversation.name">
            </ConversationNameInput>
            <StatusIndicator ref="statusIndicator"></StatusIndicator>
            <RetryButton v-if="showRetryButton" direction="row" @retry="retry">
            </RetryButton>
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

.messages-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>