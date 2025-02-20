<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

import { StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';

const emit = defineEmits(['refreshDb'])

const importFileChooser = useTemplateRef("importConversationFileChooser")
let conversationsFromFile = new Array<StoredConversation>()
const howManyConversationsFromFile = ref(0)

// Any time the file input changes, update the list of conversations from the file
// and how many were in it
function fileChanged() {
    if (importFileChooser.value !== null && importFileChooser.value.files !== null) {
        // console.log(importFileChooser.value.files[0])
        const file = importFileChooser.value.files[0]
        getConversationsFromFile(file).then(r => {
            conversationsFromFile = r
            howManyConversationsFromFile.value = conversationsFromFile.length
        }).catch(r => {
            console.error(r)
            resetFileChooser()
        })
    }
}

function getConversationsFromFile(file: File): Promise<Array<StoredConversation>> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        let conversationsFromFile = []
        reader.addEventListener("load", (event) => {
            // console.log(reader.result)
            if (reader !== null && reader.result !== null) {
                try {
                    conversationsFromFile = JSON.parse(reader.result.toString())
                    resolve(conversationsFromFile)
                } catch (r) {
                    reject(r)
                }
            } else {
                reject("Could not read file")
            }
        })
        reader.readAsText(file)
    })
}

function resetFileChooser() {
    if (importFileChooser.value !== null && importFileChooser.value.value !== null) {
        conversationsFromFile = []
        importFileChooser.value.value = ""
        howManyConversationsFromFile.value = 0;
    }
}

async function importConversationsFromFileChooser() {
    // conversationsFromFile is set any time the selected file changes so it doesn't need to 
    // be updated manually here
    let dbPromises = []
    for (let i = 0; i < conversationsFromFile.length; i++) {
        dbPromises.push(dbConnection.set(conversationsFromFile[i]))
    }
    Promise.all(dbPromises).then(r => emit("refreshDb"))
}


async function exportConversations() {
    const allConversations = await dbConnection.getAll()
    // remove the IDs in the export, because I don't want to overwrite when it's imported
    const allConversationsNoIDs = allConversations.map(c => { delete c.id; return c })
    // console.log(allConversationsNoIDs)
    const objectURL = URL.createObjectURL(new Blob([JSON.stringify(allConversationsNoIDs)], { type: "application/json" }))

    var element = document.createElement('a');
    element.setAttribute('href', objectURL);
    element.setAttribute('download', `Tamagotchi recordings ${new Date(Date.now()).toLocaleDateString()}.tgir`);

    element.style.display = 'none';
    element.click();

    URL.revokeObjectURL(objectURL)
}
</script>

<template>
    <div class="import-export">
        <h2>Import/Export</h2>
        <p>The saved conversations are stored in a local IndexedDB. If you clear your cookies/cache/local storage they
            will be lost. </p>
        <p>Export a file to back up your recordings or share them with someone else.</p>
        <form @submit.prevent="importConversationsFromFileChooser">
            <!-- <label class="fake-button-for-file-chooser" for="import-conversation-file-chooser">Import</label> -->
            <input id="import-conversation-file-chooser" type="file" required="true" accept=".json,.tgir"
                ref="importConversationFileChooser" @change="fileChanged">
            <button class="icon-label-button" type="submit">Import {{
                howManyConversationsFromFile
                }} conversations</button>
        </form>
        <button class="export-button icon-label-button" @click="exportConversations">Export</button>
    </div>
</template>

<style scoped>
h2 {
    text-align: center;
}

.import-export {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: start;
    /* padding: 1rem; */
    max-width: 40rem;
}

form {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 1rem;
}

.fake-button-for-file-chooser {
    background-color: var(--light-gray);
}
</style>