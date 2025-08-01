<script lang="ts" setup>
import { computed } from 'vue';

import EditConversationBitChunk from './EditConversationBitChunk.vue';

import { TamaGiftActivity } from '@/model';

const props = defineProps({
    model: { type: TamaGiftActivity, required: true },
})

const character = computed({
    get: () => {
        // return props.model.getSymbol()
        return parseInt(props.model.getBitstring(), 2) % 10
    },
    set: (newValue: number) => {
        // console.log(newValue)
        props.model.update(newValue.toString(2).padStart(8, "0"), false)
    }
});


</script>



<template>
    <div :class="['chunk-container', 'appearance-container', model.differs() ? 'changed' : '']">
        <label>Pre-Gift Activity</label>
        <EditConversationBitChunk :known="true" :model="model"></EditConversationBitChunk>
        <select v-model="character" class="symbol" aria-label="Gift Item selector">
            <option v-for="[key, value] in model.activities" :value="key">{{ value }}
            </option>
        </select>
    </div>
</template>

<style scoped>

.symbol {
    font-size: large;
}

img {
    image-rendering: pixelated;
    height: 40px;
}
</style>