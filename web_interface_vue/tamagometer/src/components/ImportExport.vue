<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

import { StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';

const emit = defineEmits(['refreshDb'])

const importFileChooser = useTemplateRef("importConversationFileChooser")
let conversationsFromFile = new Array<StoredConversation>
const howManyConversationsFromFile = ref(0)

// Any time the file input changes, read the file 
function fileChanged() {
    if (importFileChooser.value !== null && importFileChooser.value.files !== null) {
        // console.log(importFileChooser.value.files[0])
        const file = importFileChooser.value.files[0]
        const reader = new FileReader()
        reader.addEventListener("load", (event) => {
            // console.log(reader.result)
            if (reader !== null && reader.result !== null) {
                conversationsFromFile = JSON.parse(reader.result.toString())
                howManyConversationsFromFile.value = conversationsFromFile.length
            }
        })
        reader.readAsText(file)
    }
}

async function importConversations() {
    for (let i = 0; i < conversationsFromFile.length; i++) {
        await dbConnection.set(conversationsFromFile[i])
    }
    if (importFileChooser.value !== null && importFileChooser.value.value !== null) {
        conversationsFromFile = []
        importFileChooser.value.value = ""
        howManyConversationsFromFile.value = conversationsFromFile.length;
    }
    emit("refreshDb")
}


async function exportConversations() {
    const allConversations = await dbConnection.getAll()
    // remove the IDs in the export, because I don't want to overwrite when it's imported
    const allConversationsNoIDs = allConversations.map(c => { delete c.id; return c })
    console.log(allConversationsNoIDs)
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
        <form @submit.prevent="importConversations">
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
/* #import-conversation-file-chooser {
    opacity: 0;
    width: 1px;
    height: 1px;
} */

.import-export {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: start;
    padding: 1em;
}

form {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 1em;
}

.fake-button-for-file-chooser {
    background-color: var(--light-gray);
}
</style>