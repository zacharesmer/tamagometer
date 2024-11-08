<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue'
import { TamaName } from '@/model';
import Letter from './Letter.vue'
const props = defineProps({
    model: { type: TamaName, required: true },
})


</script>

<template>
    <div class="name-container">
        <Letter v-for="letter in model.letters" :model="letter"></Letter>
    </div>
</template>

<style>
.name-container {
    display: flex;
    flex-direction: row;
}

.letter {
    display: flex;
    flex-direction: column;
    border: solid;
    align-items: center;
}

.symbol {
    font-size: xx-large;
}
</style>