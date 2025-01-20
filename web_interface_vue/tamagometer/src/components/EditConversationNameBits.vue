<script lang="ts" setup>

import { TamaName } from '@/model';
import EditConversationLetter from './EditConversationLetter.vue'
const props = defineProps({
    model: { type: TamaName, required: true },
})


</script>

<template>
    <div :class="['chunk-container', 'name-container', model.differs() ? 'changed' : '']">
        <label>Name</label>
        <div class="letters-container">
            <EditConversationLetter v-for="letter in model.letters" :model="letter"></EditConversationLetter>
        </div>
    </div>
</template>

<style scoped>
.letters-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: .2rem;
}

.name-container {
    /* display: flex;
    flex-direction: column;
    align-items: center;
    border: solid; */
}
</style>