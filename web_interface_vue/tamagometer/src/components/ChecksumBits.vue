<script lang="ts" setup>

import { computed } from 'vue'

const props = defineProps({
    bits: {type: String, required:true},
})

const bitList = computed(() => {
    let l = []; 
    for (let i=0; i<props.bits.length; i++){
        l.push(props.bits[i])
    }; 
    return l})


</script>

<template>
    <div>
    <span v-for="(item, index) in bitList">{{ item }}</span>
</div>
</template>