<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue'
import { TamaBits } from '@/model'
import { pageSettings } from '@/state';

const props = defineProps({
    model: { type: TamaBits, required: true },
    known: { type: Boolean, required: false, default: false }
})

const bitList = computed(() => {
    let l = [];
    for (let i = 0; i < props.model.getBitstring().length; i++) {
        l.push(props.model.getBitstring()[i])
    };
    // console.log(l)
    return l
})

const showBits = computed(() => {
    return !(props.known && pageSettings.hideKnownBits)
})

</script>

<template>
    <div class="bits-container" v-if="showBits">
        <bit v-for="(item, index) in bitList" @click="() => { model.flipBit(index); $emit('update:modelValue'); }"
            :value="parseInt(item)" :changed="model.differsAt(index)"></bit>
    </div>
</template>

<style>
.bits-container {
    display: flex;
    gap: .1rem;
}
</style>