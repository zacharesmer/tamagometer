<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
import { editingConversation } from '@/conversation'

import ConversationButtons from './ConversationButtons.vue';
import ConversationNameInput from './ConversationNameInput.vue';

</script>


<template>
    <div class="name-buttons-container">
        <ConversationNameInput class="name-input"></ConversationNameInput>
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
    padding: 1em 5em;
}

.messages-container {
    display: flex;
    flex-direction: column;
}

.message {
    width: 95%;
    border-style: solid;
    border-width: thin;
}

.from-tama1 {
    background-color: var(--light-blue);
    border-radius: 3em 3em 3em 0em;
    align-self: start;
}

.from-tama2 {
    background-color: var(--light-green);
    border-radius: 3em 3em 0em 3em;
    align-self: end;
}
</style>