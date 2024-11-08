<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import { connection } from './serial.ts';
import BitstringInput from './components/BitstringInput.vue';
import UnknownByte from './components/BitChunk.vue';
</script>

<template>
  <div><button @click="connection.init()">Connect</button>
    <button @click="connection.readOneCommandCancellable()">Read a command</button>
  </div>
  <BitstringInput></BitstringInput>
  <!-- <UnknownByte bits="10101000"></UnknownByte> -->
</template>

<style scoped></style>
