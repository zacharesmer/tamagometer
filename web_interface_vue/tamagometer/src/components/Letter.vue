<script lang="ts" setup>
import { TamaBits, TamaLetter } from '@/model';
import { computed } from 'vue';
import BitChunk from './BitChunk.vue';

const props = defineProps({
    model: { type: TamaLetter, required: true },
})

const symbol = computed({
    get: () => {
        // return props.model.getSymbol()
        return parseInt(props.model.getBitstring(), 2)
    },
    set: (newValue: number) => {
        console.log(newValue)
        props.model.init(newValue.toString(2).padStart(8, "0"))
    }
});

</script>



<template>
    <BitChunk :model="model"></BitChunk>
    <!-- <div class="symbol">{{ model.getSymbol() }}</div> -->
    <select v-model="symbol">
        <option v-for="key in model.lettersSymbols.keys()" :value="key">{{ model.lettersSymbols.get(key) }}
        </option>
    </select>
</template>

<style></style>