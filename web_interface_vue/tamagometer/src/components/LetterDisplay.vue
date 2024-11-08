<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue'
import {TamaLetter} from '@/model'

const props = defineProps({
    model: {type: TamaLetter, required:true},
})

const bitList = computed(() => {
    let l = []; 
    for (let i=0; i<props.model.getBitstring().length; i++){
        l.push(props.model.getBitstring()[i])
    }; 
    return l})

</script>

<template>
    <div>
    <bit v-for="(item, index) in bitList" @click="()=>{model.flipBit(index); $emit('update:modelValue');}">{{ item }}</bit>
</div>
</template>