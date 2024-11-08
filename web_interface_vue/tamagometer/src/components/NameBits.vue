<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue'
import { TamaName } from '@/model';
import LetterDisplay from './LetterDisplay.vue';

const props = defineProps({
    model: {type: TamaName, required:true},
})

</script>

<template>
    <div>
        <LetterDisplay v-for="(item) in model.letters" :model="item"></LetterDisplay>
    </div>
</template>