<script lang="ts" setup>
import { selectedConversation, editingConversation, StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const conversations = ref<StoredConversation[]>([])
const router = useRouter()


onMounted(() => {
    console.log("Getting the stuff from the database...")
    dbConnection.getAll().then(response => {
        conversations.value = response
    })
})

function openForEditing(c: StoredConversation): void {
    console.log(c)
    selectedConversation.initFromStored(c)
    editingConversation.initFromStored(c)
    router.push("/conversation")
}

</script>

<template>
    <h2>Saved</h2>
    <div v-for="c in conversations">
        <span>{{ new Date(c.timestamp).toLocaleString() }} {{ c.name }}</span>
        <button @click="openForEditing(c)">Open in editor</button>
        <!-- @vue-ignore -->
        <button @click="console.log(c.id)">Delete</button>
    </div>
</template>