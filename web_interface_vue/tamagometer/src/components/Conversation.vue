<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
import { editingConversation, selectedConversation } from '@/conversation'
import { dbConnection } from '@/database';
import { onMounted, ref } from 'vue'

const editingName = ref(false)
const newName = ref(editingConversation.name ? editingConversation.name.toString() : "")

function saveName() {
    console.log(newName.value)
    editingConversation.name = newName.value;
    editingName.value = false;
}

// Write the current conversation to the database. 
// Update the selected conversation to the newly created one
function saveNewConversation() {
    editingConversation.name = newName.value;
    dbConnection.set(editingConversation.toStored()).then(response => {
        selectedConversation.initFromStored(editingConversation.toStored())
    })
}

onMounted(() => {
    console.log(editingConversation.name)
})

</script>


<template>
    <div v-if="editingName">
        <input v-model="newName">
        <button @click="saveName">OK</button>
        <button @click="editingName = false">Cancel</button>
    </div>
    <div v-else>
        <h2>{{ editingConversation.name }}</h2>
        <button @click="() => { newName = editingConversation.name; editingName = true }">Edit name</button>
    </div>
    <div>
        <button @click="editingConversation.startConversation">Start interaction</button>
        <button @click="editingConversation.awaitConversation">Wait for interaction</button>
        <button @click="editingConversation.stopWaiting">Stop waiting</button>
    </div>
    <BitstringInput :model="editingConversation.message1" bitstring-id="editingConversationMessage1"></BitstringInput>
    <BitstringInput :model="editingConversation.message2" bitstring-id="editingConversationMessage2"></BitstringInput>
    <BitstringInput :model="editingConversation.message3" bitstring-id="editingConversationMessage3"></BitstringInput>
    <BitstringInput :model="editingConversation.message4" bitstring-id="editingConversationMessage4"></BitstringInput>
    <div>
        <input v-model="newName">
        <button @click="saveNewConversation">Save as new conversation</button>
    </div>
</template>

<style></style>