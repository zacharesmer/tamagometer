<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { pageSettings } from '@/state';

onMounted(() => {
    if (localStorage.getItem("persistSettings") == "true") {
        pageSettings.persistSettings = true;
        if (localStorage.getItem("hideKnownBits") === "true") {
            pageSettings.hideKnownBits = true;
        } else {
            pageSettings.hideKnownBits = false;
        }
    }
})

watch(pageSettings, () => {
    if (pageSettings.persistSettings === true) {
        localStorage.setItem("hideKnownBits", pageSettings.hideKnownBits.toString())
        localStorage.setItem("persistSettings", pageSettings.persistSettings.toString())
    }
})
</script>

<template>
    <div class="settings-container">

        <label for="hide-known-bits-checkbox">
            <input id="hide-known-bits-checkbox" type="checkbox" v-model="pageSettings.hideKnownBits"></input>
            Hide bit buttons in known sections
        </label>
        <label for="persist-settings-checkbox">
            <input id="persist-settings-checkbox" type="checkbox" v-model="pageSettings.persistSettings"></input>
            Remember settings after page reload (uses local storage)</label>
    </div>
</template>

<style scoped>
.settings-container {
    display: flex;
    flex-direction: column;
}
</style>