<script lang="ts" setup>

import { TamaName } from '@/model';
import Letter from './Letter.vue'
const props = defineProps({
    model: { type: TamaName, required: true },
})


</script>

<template>
    <div class="chunk-container name-container">
        <label>Name</label>
        <div class="letters-container">
            <Letter v-for="letter in model.letters" :model="letter"></Letter>
        </div>
    </div>
</template>

<style>
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