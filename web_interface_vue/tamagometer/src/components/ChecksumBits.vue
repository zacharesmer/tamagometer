<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue';

const props = defineProps({
    bits: { type: String, required: true },
})

const bitList = computed(() => {
    let l = [];
    for (let i = 0; i < props.bits.length; i++) {
        l.push(props.bits[i])
    };
    return l
})


</script>

<template>
    <div class="chunk-container">
        <bit v-for="(item, index) in bitList" :value="parseInt(item)"></bit>
    </div>
</template>

<style>
/* reuse style from BitChunk.vue */
</style>