<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import {connection} from './serial.ts';
import BitstringInput from './components/BitstringInput.vue';
import UnknownByte from './components/UnknownBits.vue';
</script>

<template>
  <button @click="connection.init()">Connect</button>
  <button @click="connection.readOneCommandCancellable()">Read a command</button>
  <BitstringInput></BitstringInput>
  <!-- <UnknownByte bits="10101000"></UnknownByte> -->
</template>

<style scoped>
</style>
