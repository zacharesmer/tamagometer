<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { pageSettings } from '@/settings';

onMounted(() => {
    if (localStorage.getItem("hideKnownBits") === "true") {
        pageSettings.hideKnownBits = true;
    } else {
        pageSettings.hideKnownBits = false;
    }
})

watch(pageSettings, () => {
    localStorage.setItem("hideKnownBits", pageSettings.hideKnownBits.toString())
})
</script>

<template>
    <div>
        <input type="checkbox" v-model="pageSettings.hideKnownBits">Hide bits in known
        sections</input>
    </div>
</template>