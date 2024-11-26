<script lang="ts" setup>
import { ref, useTemplateRef, nextTick } from "vue"

// emitting signals decouples this from the database and makes it more reusable
const emit = defineEmits<{
    saveName: [newName: string]
    saveNewConversation: [newName: string]
}>()

const props = defineProps({
    initialName: { type: String, required: true },
}
)

// controls if we're in the editing view or not
const editingName = ref(false)

// Some of this is cursed because I'm doing a lot to emulate the normal 
// regular behavior of form/event based design
const newName = ref(props.initialName)
// this will hold the name any time someone starts editing so it can be reverted
let previousName = props.initialName

const nameInputField = useTemplateRef("name-input-field")

function startEditingName() {
    previousName = newName.value
    editingName.value = true
    // wait for the text input to render then focus on it
    nextTick().then(() => {
        if (nameInputField !== null && nameInputField.value !== null) {
            nameInputField.value.focus()
            nameInputField.value.select()
        }
    })
}

function cancelEditingName() {
    newName.value = previousName
    editingName.value = false
}

function saveName() {
    emit('saveName', newName.value)
    editingName.value = false
}

// Save the name and the conversation to cover cases where this is called while editing
function saveNewConversation() {
    editingName.value = false
    emit("saveName", newName.value)
    emit("saveNewConversation", newName.value)
}

// Allow keyboard shortcuts to cancel/save the name
function handleKeyUp(e: KeyboardEvent) {
    console.log(e)
    if (e.key === "Escape") {
        cancelEditingName()
        editingName.value = false;
    } else if (e.key === "Enter") {
        saveName()
    }
}
</script>

<template>
    <div v-if="editingName" class="name-input-container">
        <input class="name-input" v-model="newName" @keyup="(e) => { handleKeyUp(e) }" ref="name-input-field">
        <span class="name-editing-buttons">
            <button class="round-button" @click="saveName">
                <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M14.5442 40.3106L30.1005 55.867C30.8816 56.648 32.1479 56.648 32.929 55.867L65.4559 23.3401" />
                </svg>
            </button>
            <button class="round-button" @click="cancelEditingName">
                <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M56 64L24 16" />
                    <path d="M24 64L56 16" />
                </svg>
            </button>
            <button @click="saveNewConversation">Save as new conversation</button>
        </span>
    </div>
    <div v-else class="name-input-container">
        <h2 @click="startEditingName">{{ newName }}</h2>
        <span class="name-editing-buttons">
            <button class="icon-label-button" @click="startEditingName">
                <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M38.4 20.7417H14C12.8954 20.7417 12 21.6371 12 22.7417V66.7417C12 67.8463 12.8954 68.7417 14 68.7417H58C59.1046 68.7417 60 67.8463 60 66.7417V42.342" />
                    <path
                        d="M68.0145 21.8972C68.7943 21.1174 68.7943 19.8532 68.0145 19.0734L62.3577 13.4166C61.5753 12.6342 60.3069 12.6342 59.5246 13.4166L30.6996 42.2416C28.1991 44.7421 26.5974 48.0005 26.1449 51.5077L25.7115 54.8664C25.6479 55.359 26.0674 55.7785 26.56 55.715L29.9187 55.2816C33.4259 54.829 36.6844 53.2273 39.1849 50.7268L68.0145 21.8972Z" />
                    <path d="M52.1455 20.8037L60.6261 29.2843" />
                </svg>
                <span>Edit name</span>
            </button>
            <button @click="saveNewConversation">Save as new conversation</button>
        </span>
    </div>
</template>

<style scoped>
.name-input {
    /* match the h2 style */
    font-size: 1.5rem;
}

.name-input-container>h2 {
    margin: 0;
    font-size: 1.5rem;
}

.name-input-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    width: fit-content;
}

.name-editing-buttons {
    display: flex;
    /* align-items: center; */
    gap: 1rem;
}
</style>