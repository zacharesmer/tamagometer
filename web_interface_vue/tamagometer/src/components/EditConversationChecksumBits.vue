<script lang="ts" setup>

import { computed } from 'vue'
import EditConversationBit from './EditConversationBit.vue';
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
            <EditConversationBit v-for="(item, index) in bitList" :value="parseInt(item)" :changed="false">
            </EditConversationBit>
        </div>
        <div>{{ parseInt(bits, 2) }}</div>
    </div>
</template>

