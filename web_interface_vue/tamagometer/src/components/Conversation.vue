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
    <div v-if="editingName" class="name-input-container">
        <input class="name-input" v-model="newName">
        <button class="round-button" @click="saveName">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5442 40.3106L30.1005 55.867C30.8816 56.648 32.1479 56.648 32.929 55.867L65.4559 23.3401" />
            </svg>
        </button>
        <button class="round-button" @click="editingName = false">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M56 64L24 16" />
                <path d="M24 64L56 16" />
            </svg>
        </button>
    </div>
    <div v-else class="name-input-container">
        <h2>{{ editingConversation.name }}</h2>
        <button class="round-button" @click="() => { newName = editingConversation.name; editingName = true }">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M38.4 20.7417H14C12.8954 20.7417 12 21.6371 12 22.7417V66.7417C12 67.8463 12.8954 68.7417 14 68.7417H58C59.1046 68.7417 60 67.8463 60 66.7417V42.342" />
                <path
                    d="M68.0145 21.8972C68.7943 21.1174 68.7943 19.8532 68.0145 19.0734L62.3577 13.4166C61.5753 12.6342 60.3069 12.6342 59.5246 13.4166L30.6996 42.2416C28.1991 44.7421 26.5974 48.0005 26.1449 51.5077L25.7115 54.8664C25.6479 55.359 26.0674 55.7785 26.56 55.715L29.9187 55.2816C33.4259 54.829 36.6844 53.2273 39.1849 50.7268L68.0145 21.8972Z" />
                <path d="M52.1455 20.8037L60.6261 29.2843" />
            </svg>
        </button>
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
        <input class="name-input" v-model="newName">
        <button @click="saveNewConversation">Save as new conversation</button>
    </div>
</template>

<style scoped>
.name-input {
    /* match the h2 style */
    font-size: 1.5em;
}

.name-input-container>h2 {
    margin: 0;
}

.name-input-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 1em;
}

.round-button {
    width: 2.5 em;
    height: 2.5 em;
    border-radius: 50%;
    border-style: none;
    /* background-color: var(--light-green); */
}

.round-button-icon {
    width: 2em;
    height: 2em;
}

path {
    stroke: var(--dark-blue);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: .5em;
}
</style>