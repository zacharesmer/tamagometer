<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
// import { editingConversation, selectedConversation } from '@/conversation'
import { dbConnection } from '@/database';
import ConversationButtons from './ConversationButtons.vue';
import ConversationNameInput from './ConversationNameInput.vue';
import { useRoute } from 'vue-router';
import { onBeforeUnmount, onMounted, } from 'vue';
import { activeConversation as conversation } from '@/state';

import { toast } from 'vue3-toastify'

const route = useRoute()

onMounted(async () => {
    // TODO this might be a good place to check if the current conversation should be saved before overwriting it
    if (route.params.dbId) {
        const dbId = parseInt(route.params.dbId as string)
        const stored = await dbConnection.get(dbId)
        conversation.initFromStored(stored)
    }
})

onBeforeUnmount(() => {
    conversation.stopWaiting()
})

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

</script>


<template>
    <div v-if=" ! conversation.oneOrMoreMessagesAreInvalid()">
        <div class="name-buttons-container">
            <ConversationNameInput class="name-input"
                @save-new-conversation="(newName) => { saveNewConversation(newName) }"
                @save-name="(newName) => { saveName(newName) }" :name="conversation.name">
            </ConversationNameInput>
            <ConversationButtons class="conversation-buttons"
                @start-conversation="() => { conversation.startConversation() }"
                @await-conversation="() => { conversation.awaitConversation() }"
                @stop-waiting="() => { conversation.stopWaiting() }">
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