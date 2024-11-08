<script lang="ts" setup>

import { computed } from 'vue'
const props = defineProps({
    value: { type: Number, required: true },
})

</script>

<template>
    <div v-if="value === 1" class="bit one">
        {{ value }}
    </div>
    <div v-else-if="value === 0" class="bit zero">
        {{ value }}
    </div>
    <div v-else class="bit invalid">
    </div>
</template>

<style>
.bit {
    display: inline;
    padding: 5px;
    margin: 1px;
    border: solid;
}

.one {
    background-color: lightblue;

}

.zero {
    background-color: papayawhip;
}
</style>