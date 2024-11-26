<script lang="ts" setup>
import { StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { ref } from 'vue';
import ImportExport from './ImportExport.vue';
import SavedConversationList from './SavedConversationList.vue';

const conversations = ref<StoredConversation[]>([])


async function refreshDb() {
    console.log("Getting the stuff from the database...")
    dbConnection.getAll().then(response => {
        conversations.value = response
    })
}

</script>

<template>
    <h2>Saved Conversations</h2>
    <div class="saved-import-container">
        <SavedConversationList :conversations="conversations" @refresh-db="refreshDb"></SavedConversationList>
        <ImportExport @refresh-db="refreshDb"></ImportExport>
    </div>
</template>

<style scoped>
.saved-import-container {
    display: flex;
    align-items: start;
    gap: 10rem;
}
</style>