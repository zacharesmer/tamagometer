<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import { connection } from './serial.ts';
import Conversation from './components/Conversation.vue'
import Snoop from './components/Snoop.vue';

</script>

<template>
  <div><button @click="connection.init()">Connect</button>
    <button @click="connection.readOneCommandCancellable()">Read a command</button>
  </div>
  <Snoop></Snoop>
  <Conversation conversation-id="SingletonConvo"></Conversation>
</template>

<style scoped></style>
