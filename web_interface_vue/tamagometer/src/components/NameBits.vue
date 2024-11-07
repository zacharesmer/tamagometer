<script lang="ts" setup>

import { computed } from 'vue'
import Bit from './Bit.vue'
import { TamaName } from '@/model';

const props = defineProps({
    model: {type: TamaName, required:true},
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
    <span v-for="(item, index) in bitList" :index="index" @click="(i) => {}">{{ item }}</span>
</div>
</template>