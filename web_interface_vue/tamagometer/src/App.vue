<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import { connection } from './serial.ts';
import { pageSettings } from './settings.ts';
import Conversation from './components/Conversation.vue'
import Snoop from './components/Snoop.vue';

</script>

<template>
  <div><button @click="connection.init(); $emit('update:')">Connect</button>
    <!-- <button @click="connection.readOneCommandCancellable()">Read a command</button> -->
  </div>
  <div>
    <input type="checkbox" v-model="pageSettings.hideKnownBits">Hide bits in known sections</input>
  </div>
  <Snoop></Snoop>
  <Conversation conversation-id="SingletonConvo"></Conversation>
</template>

<style>
.hidden {
  display: none;
}
</style>
