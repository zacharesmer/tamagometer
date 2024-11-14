<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue';
import { pageSettings } from '@/settings';

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

const bitClass = computed(() => {
    pageSettings.hideKnownBits ? "hidden" : ""
})


</script>

<template>
    <div class="chunk-container">
        <bit :class="bitClass" v-for="(item, index) in bitList" :value="parseInt(item)"></bit>
    </div>
</template>

<style>
/* reuse style from BitChunk.vue */
</style>