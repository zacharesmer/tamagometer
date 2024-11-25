<script lang="ts" setup>
import { ref } from "vue"
import { editingConversation, selectedConversation } from '@/conversation'
import { dbConnection } from '@/database';


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
</script>

<template>
    <div v-if="editingName" class="name-input-container">
        <input class="name-input" v-model="newName">
        <span class="name-editing-buttons">
            <button class="round-button" @click="saveName">
                <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M14.5442 40.3106L30.1005 55.867C30.8816 56.648 32.1479 56.648 32.929 55.867L65.4559 23.3401" />
                </svg>
            </button>
            <button class="round-button" @click="editingName = false">
                <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M56 64L24 16" />
                    <path d="M24 64L56 16" />
                </svg>
            </button>
        </span>
    </div>
    <div v-else class="name-input-container">
        <h2>{{ editingConversation.name }}</h2>
        <span class="name-editing-buttons">
            <button class="round-button" @click="() => { newName = editingConversation.name; editingName = true }">
                <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M38.4 20.7417H14C12.8954 20.7417 12 21.6371 12 22.7417V66.7417C12 67.8463 12.8954 68.7417 14 68.7417H58C59.1046 68.7417 60 67.8463 60 66.7417V42.342" />
                    <path
                        d="M68.0145 21.8972C68.7943 21.1174 68.7943 19.8532 68.0145 19.0734L62.3577 13.4166C61.5753 12.6342 60.3069 12.6342 59.5246 13.4166L30.6996 42.2416C28.1991 44.7421 26.5974 48.0005 26.1449 51.5077L25.7115 54.8664C25.6479 55.359 26.0674 55.7785 26.56 55.715L29.9187 55.2816C33.4259 54.829 36.6844 53.2273 39.1849 50.7268L68.0145 21.8972Z" />
                    <path d="M52.1455 20.8037L60.6261 29.2843" />
                </svg>
            </button>
            <button @click="saveNewConversation">Save as new conversation</button>
        </span>
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
    gap: 1em;
    width: fit-content;
}

.name-editing-buttons {
    display: flex;
    /* align-items: center; */
    gap: 1em;
}
</style>