<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import { connection } from './serial.ts';
import Conversation from './components/Conversation.vue'
import { onMounted } from 'vue';

</script>

<template>
  <div><button @click="connection.init()">Connect</button>
    <button @click="connection.readOneCommandCancellable()">Read a command</button>
  </div>
  <Conversation conversation-id="SingletonConvo"></Conversation>
</template>

<style scoped></style>
