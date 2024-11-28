<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue';
import { pageSettings } from '@/state';

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

const showBits = computed(() => {
    return !(pageSettings.hideKnownBits)
})

</script>

<template>
    <div class="chunk-container checksum-container">
        <label>Checksum</label>
        <div v-if="showBits">
            <bit v-for="(item, index) in bitList" :value="parseInt(item)" :changed="false"></bit>
        </div>
        <div>{{ parseInt(bits, 2) }}</div>
    </div>
</template>

<style>
/* reuses some style from BitChunk.vue */
.checksum-container {
    /* display: flex;
    flex-direction: column;
    align-items: center;
    border: solid; */
}
</style>