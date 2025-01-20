<script lang="ts" setup>
import { TamaLetter } from '@/model';
import { computed } from 'vue';
import EditConversationBitChunk from './EditConversationBitChunk.vue';

const props = defineProps({
    model: { type: TamaLetter, required: true },
})

const symbol = computed({
    get: () => {
        // return props.model.getSymbol()
        return parseInt(props.model.getBitstring(), 2)
    },
    set: (newValue: number) => {
        // console.log(newValue)
        props.model.update(newValue.toString(2).padStart(8, "0"))
    }
});

</script>



<template>
    <div class="letter-container">
        <EditConversationBitChunk :known="true" :model="model"></EditConversationBitChunk>
        <!-- <div class="symbol">{{ model.getSymbol() }}</div> -->
        <select v-model="symbol" class="symbol">
            <option v-for="[key, value] in model.lettersSymbols" :value="key">{{ value }}
            </option>
        </select>
    </div>
</template>

<style scoped>
.letter-container {
    display: flex;
    flex-direction: column;
    /* border: solid; */
    align-items: center;
}


.symbol {
    font-size: xx-large;
}
</style>