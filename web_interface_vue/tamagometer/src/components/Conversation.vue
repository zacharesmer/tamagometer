<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
import { editingConversation } from '@/conversation'

</script>

<!-- The conversation ID and conversation index is used to save the text box values to localStorage so that they'll persist when the page is reloaded-->

<template>
    <h2>{{ editingConversation.name }}</h2>
    <div>
        <button @click="editingConversation.startConversation">Start interaction</button>
        <button @click="editingConversation.awaitConversation">Wait for interaction</button>
        <button @click="editingConversation.stopWaiting">Stop waiting</button>
    </div>
    <BitstringInput :model="editingConversation.message1" bitstring-id="editingConversationMessage1"></BitstringInput>
    <BitstringInput :model="editingConversation.message2" bitstring-id="editingConversationMessage2"></BitstringInput>
    <BitstringInput :model="editingConversation.message3" bitstring-id="editingConversationMessage3"></BitstringInput>
    <BitstringInput :model="editingConversation.message4" bitstring-id="editingConversationMessage4"></BitstringInput>

</template>

<style></style>