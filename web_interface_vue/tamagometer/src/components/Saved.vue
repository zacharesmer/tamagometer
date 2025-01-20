<script lang="ts" setup>
import { StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { ref } from 'vue';
import SavedImportExport from './SavedImportExport.vue';
import SavedConversationList from './SavedConversationList.vue';

const conversations = ref<StoredConversation[]>([])


async function refreshDb() {
    // console.log("Getting the stuff from the database...")
    dbConnection.getAll().then(response => {
        conversations.value = response
    })
}

</script>

<template>
    <div class="saved-import-container">
        <SavedConversationList :conversations="conversations" @refresh-db="refreshDb"></SavedConversationList>
        <SavedImportExport @refresh-db="refreshDb"></SavedImportExport>
    </div>
</template>

<style scoped>

.saved-import-container {
    display: flex;
    align-items: start;
    justify-content:space-around;
    flex-wrap: wrap-reverse;
    gap: 2rem 10rem;
}
</style>