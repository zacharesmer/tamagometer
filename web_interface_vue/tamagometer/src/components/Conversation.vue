<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue';
import BitstringInput from './BitstringInput.vue';
import { activeConversation } from '@/conversation'

</script>

<!-- The conversation ID and conversation index is used to save the text box values to localStorage so that they'll persist when the page is reloaded-->

<template>
    <div>
        <button @click="activeConversation.startConversation">Start interaction</button>
        <button @click="activeConversation.awaitConversation">Wait for interaction</button>
        <button @click="activeConversation.stopWaiting">Stop waiting</button>
    </div>
    <BitstringInput :model="activeConversation.message1" bitstring-id="idk1"></BitstringInput>
    <BitstringInput :model="activeConversation.message2" bitstring-id="idk2"></BitstringInput>
    <BitstringInput :model="activeConversation.message3" bitstring-id="idk3"></BitstringInput>
    <BitstringInput :model="activeConversation.message4" bitstring-id="idk4"></BitstringInput>

</template>

<style></style>