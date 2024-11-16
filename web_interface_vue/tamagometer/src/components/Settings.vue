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
        <input id="hide-known-bits-checkbox" type="checkbox" v-model="pageSettings.hideKnownBits"></input>
        <label for="hide-known-bits-checkbox">Hide bit buttons in known sections</label>
    </div>
</template>