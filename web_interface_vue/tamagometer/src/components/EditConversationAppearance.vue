<script lang="ts" setup>
import { computed } from 'vue';

import EditConversationBitChunk from './EditConversationBitChunk.vue';

import { TamaAppearance } from '@/model';

const props = defineProps({
    model: { type: TamaAppearance, required: true },
})

const character = computed({
    get: () => {
        // return props.model.getSymbol()
        return parseInt(props.model.getBitstring(), 2)
    },
    set: (newValue: number) => {
        // console.log(newValue)
        props.model.update(newValue.toString(2).padStart(8, "0"), false)
    }
});

const imageSource = computed(() => {
    return "/tamagometer/character-sprites/" + props.model.getName().toLowerCase() + "_sprite.png"
})

</script>



<template>
    <div :class="['chunk-container', 'appearance-container', model.differs() ? 'changed' : '']">
        <label>Character</label>
        <EditConversationBitChunk :known="true" :model="model"></EditConversationBitChunk>
        <img :src="imageSource">
        <select v-model="character" class="symbol" aria-label="Character selector">
            <option v-for="[key, value] in model.characterNames" :value="key">{{ value }}
            </option>
        </select>
    </div>
</template>

<style scoped>
.appearance-container {}


.symbol {
    font-size: large;
}

img {
    image-rendering: pixelated;
    width: 40px;
    height: 40px;
}
</style>