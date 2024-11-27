<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
import { editingConversation, selectedConversation } from '@/conversation'
import { dbConnection } from '@/database';
import ConversationButtons from './ConversationButtons.vue';
import ConversationNameInput from './ConversationNameInput.vue';

// Write the current conversation to the database. 
// Update the selected conversation to the newly created one
function saveNewConversation(newName: string) {
    editingConversation.name = newName;
    dbConnection.set(editingConversation.toStored()).then(response => {
        selectedConversation.initFromStored(editingConversation.toStored())
    })
}

function saveName(newName: string) {
    console.log(newName)
    editingConversation.name = newName;
}

</script>


<template>
    <div class="name-buttons-container">
        <ConversationNameInput class="name-input" @save-new-conversation="(newName) => { saveNewConversation(newName) }"
            @save-name="(newName) => { saveName(newName) }" :initial-name="editingConversation.name">
        </ConversationNameInput>
        <ConversationButtons class="conversation-buttons"></ConversationButtons>
    </div>
    <div class="messages-container">
        <BitstringInput :model="editingConversation.message1" bitstring-id="editingConversationMessage1"
            class="message from-tama1"></BitstringInput>
        <BitstringInput :model="editingConversation.message2" bitstring-id="editingConversationMessage2"
            class="message from-tama2"></BitstringInput>
        <BitstringInput :model="editingConversation.message3" bitstring-id="editingConversationMessage3"
            class="message from-tama1"></BitstringInput>
        <BitstringInput :model="editingConversation.message4" bitstring-id="editingConversationMessage4"
            class="message from-tama2"></BitstringInput>
    </div>
</template>

<style scoped>
.name-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    /* padding: 1rem 5rem; */
}

.messages-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>