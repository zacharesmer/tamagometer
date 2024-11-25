<script lang="ts" setup>
import { selectedConversation, editingConversation, StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import ImportExport from './ImportExport.vue';

const conversations = ref<StoredConversation[]>([])
const router = useRouter()


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


</script>

<template>
    <h2>Saved</h2>
    <ImportExport @refresh-db="refreshDb" ></ImportExport>
    <table>
        <tbody>
            <tr>
                <th>Name</th>
                <th></th>
                <th>Date/Time</th>
                <th></th>
            </tr>
            <tr v-for="c in conversations">

                <td>
                    {{ c.name }}
                </td>
                <td>
                    <button @click="openForEditing(c)">Open in editor</button>
                </td>
                <td>
                    {{ new Date(c.timestamp).toLocaleString() }}
                </td>
                <td>
                    <!-- @vue-ignore -->
                    <button @click="deleteConversation(c.id)">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style>
tr:nth-child(even) {
    background-color: papayawhip;
}
</style>