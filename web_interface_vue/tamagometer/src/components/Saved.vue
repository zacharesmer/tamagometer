<script lang="ts" setup>
import { selectedConversation, editingConversation, StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { readSync } from 'fs';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

const conversations = ref<StoredConversation[]>([])
const router = useRouter()
const importFileChooser = useTemplateRef("importConversationFileChooser")

async function refreshDb() {
    console.log("Getting the stuff from the database...")
    dbConnection.getAll().then(response => {
        conversations.value = response
    })
}

onMounted(() => {
    refreshDb()
})

function openForEditing(c: StoredConversation): void {
    console.log("opening " + c.name)
    selectedConversation.initFromStored(c)
    editingConversation.initFromStored(c)
    router.push("/conversation")
}

// Typescript doesn't like the autoincrementing ID key, but it's a number
// @ts-ignore
function deleteConversation(dbId) {
    console.log(typeof (dbId))
    if (typeof (dbId) === "number") {
        dbConnection.del(dbId)
        refreshDb()
    }
}

async function exportConversations() {
    const allConversations = await dbConnection.getAll()
    // remove the IDs in the export, because I don't want to overwrite when it's imported
    const allConversationsNoIDs = allConversations.map(c => { delete c.id; return c })
    console.log(allConversationsNoIDs)
    const objectURL = URL.createObjectURL(new Blob([JSON.stringify(allConversationsNoIDs)], { type: "application/json" }))

    var element = document.createElement('a');
    element.setAttribute('href', objectURL);
    element.setAttribute('download', "Tamagotchi recordings " + new Date(Date.now()).toLocaleDateString());
    element.style.display = 'none';
    element.click();

    URL.revokeObjectURL(objectURL)
}

async function importConversation() {
    let file: File
    // These should not actually be null because this is a callback for a button, so 
    // if someone clicks the button, the page must have loaded and been mounted already
    if (importFileChooser.value !== null && importFileChooser.value.files !== null) {
        let conversationsToAdd: StoredConversation[]
        try {
            console.log(importFileChooser.value.files[0])
            file = importFileChooser.value.files[0]
            const reader = new FileReader()

            reader.addEventListener("load", (event) => {
                console.log(reader.result)
                if (reader !== null && reader.result !== null) {
                    conversationsToAdd = JSON.parse(reader.result.toString())
                    for (let i = 0; i < conversationsToAdd.length; i++) {
                        dbConnection.set(conversationsToAdd[i])
                    }
                    if (importFileChooser !== null && importFileChooser.value !== null) {
                        importFileChooser.value.value = ""
                    }
                    refreshDb()
                }
            })

            reader.readAsText(file)
        } catch (e) {
            console.error(e)
        }
    }

}

</script>

<template>
    <h2>Saved</h2>
    <div>
        <form @submit.prevent="importConversation">
            <input type="submit" value="Import">
            <input id="import-conversation-file-chooser" type="file" required="true" accept=".json"
                ref="importConversationFileChooser">
            <!-- <label for="import-conversation-file-chooser">Import</label> -->

        </form>
        <button @click="exportConversations">Export</button>
    </div>

    <div v-for="c in conversations">
        <span>{{ new Date(c.timestamp).toLocaleString() }} {{ c.name }}</span>
        <button @click="openForEditing(c)">Open in editor</button>
        <!-- ignoring for now because typecript doesn't like the auto-incrementing key -->
        <!-- @vue-ignore -->
        <button @click="deleteConversation(c.id)">Delete</button>
    </div>
</template>