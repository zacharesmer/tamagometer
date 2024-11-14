<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import { connection } from './serial.ts';
import Conversation from './components/Conversation.vue'
import Snoop from './components/Snoop.vue';
import Settings from './components/Settings.vue';


</script>

<template>
  <div id="body-container">
    <div>
      <button id="connect-button" @click="connection.init(); $emit('update:')">Connect</button>
    </div>
    <Settings></Settings>
    <Snoop></Snoop>
    <Conversation conversation-id="SingletonConvo"></Conversation>
  </div>
</template>

<style>
.hidden {
  display: none;
}

#body-container {
  max-width: 180ch;
}

#connect-button {
  font-size: xx-large;
}
</style>
