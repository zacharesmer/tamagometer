<script lang="ts" setup>
import { TamaAppearance } from '@/model';
import { computed } from 'vue';
import BitChunk from './BitChunk.vue';
import { isAssertsKeyword } from 'typescript';

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
        props.model.init(newValue.toString(2).padStart(8, "0"))
    }
});

const imageSource = computed(() => {
    return "/character-sprites/" + props.model.getName().toLowerCase() + "_sprite.png"
})

</script>



<template>
    <div class="appearance-container">
        <BitChunk :model="model"></BitChunk>
        <!-- <div class="symbol">{{ model.getSymbol() }}</div> -->
        <img :src="imageSource">
        <select v-model="character" class="symbol">
            <option v-for="key in model.characterNames.keys()" :value="key">{{ model.characterNames.get(key) }}
            </option>
        </select>
    </div>
</template>

<style scoped>
.appearance-container {
    display: flex;
    flex-direction: column;
    border: solid;
    align-items: center;
}


.symbol {
    font-size: large;
}

img {
    image-rendering: pixelated;
    width: 40px;
    height: 40px;
}
</style>