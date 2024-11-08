<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue'
import { TamaBits } from '@/model'

const props = defineProps({
    model: { type: TamaBits, required: true },
})

const bitList = computed(() => {
    let l = [];
    for (let i = 0; i < props.model.getBitstring().length; i++) {
        l.push(props.model.getBitstring()[i])
    };
    return l
})

</script>

<template>
    <div class="chunk-container">
        <bit v-for="(item, index) in bitList" @click="() => { model.flipBit(index); $emit('update:modelValue'); }"
            :value="parseInt(item)"></bit>
    </div>
</template>

<style>
.chunk-container {
    padding: 10px;
}
</style>