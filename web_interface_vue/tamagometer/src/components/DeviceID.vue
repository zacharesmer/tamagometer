<script lang="ts" setup>
import { TamaID } from '@/model';
import { computed } from 'vue';
import BitChunk from './BitChunk.vue';

const props = defineProps({
    model: { type: TamaID, required: true },
})

const idNumber = computed(
    {
        get: () => {
            return props.model.getNumber()
        },
        set: (newValue: number) => {
            if (newValue <= 65535 && newValue >= 0) {
                props.model.init(newValue.toString(2).padStart(16, "0"))
            }
        }
    }
)

</script>



<template>
    <div class="chunk-container id-container">
        <label>Device ID </label>
        <BitChunk :known="true" :model="props.model"></BitChunk>
        <input class="id-number" type="number" min="0" max="65535" step="1" v-model="idNumber">
    </div>
</template>

<style scoped>
.id-container {
    /* display: flex;
    flex-direction: column;
    border: solid;
    align-items: center; */
}

.id-number {
    font-size: large;
}
</style>