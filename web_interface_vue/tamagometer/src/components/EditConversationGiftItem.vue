<script lang="ts" setup>
import { computed } from 'vue';

import EditConversationBitChunk from './EditConversationBitChunk.vue';

import { TamaGiftItem } from '@/model';

const props = defineProps({
    model: { type: TamaGiftItem, required: true },
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
    return "/tamagometer/item-sprites/" + props.model.getName().toLowerCase().replace(/ /g, "_") + "_sprite.png"
})

</script>



<template>
    <div :class="['chunk-container', 'appearance-container', model.differs() ? 'changed' : '']">
        <label>Gift Item</label>
        <EditConversationBitChunk :known="true" :model="model"></EditConversationBitChunk>
        <img :src="imageSource" width="">
        <select v-model="character" class="symbol" aria-label="Gift Item selector">
            <option v-for="[key, value] in model.gift_items" :value="key">{{ value }}
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
    height: 40px;
}
</style>