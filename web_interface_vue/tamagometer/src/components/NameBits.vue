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
        <div>Name: </div>
        <Letter v-for="letter in model.letters" :model="letter"></Letter>
    </div>
</template>

<style>
.name-container {
    display: flex;
    flex-direction: row;
    align-items: center;

}

</style>