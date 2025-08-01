<script lang="ts" setup>
import { computed } from 'vue';

import EditConversationBitChunk from './EditConversationBitChunk.vue';

import { TamaGame } from '@/model';

const props = defineProps({
    model: { type: TamaGame, required: true },
})

const character = computed({
    get: () => {
        // return props.model.getSymbol()
        return parseInt(props.model.getBitstring(), 2)
    },
    set: (newValue: number) => {
        // console.log(newValue)
        props.model.update(newValue.toString(2).padStart(3, "0"), false)
    }
});


</script>

<template>
    <div :class="['chunk-container', 'appearance-container', model.differs() ? 'changed' : '']">
        <label>Game Type</label>
        <EditConversationBitChunk :known="true" :model="model"></EditConversationBitChunk>
        <select v-model="character" class="symbol" aria-label="Conversation Type selector">
            <option v-for="[key, value] in model.games" :value="key">{{ value }}
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