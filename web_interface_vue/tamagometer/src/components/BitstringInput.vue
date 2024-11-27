<script lang="ts" setup>
import { computed } from 'vue'
import BitChunk from './BitChunk.vue';
import { TamaMessage } from '@/model';
import NameBits from './NameBits.vue'
import ChecksumBits from './ChecksumBits.vue';
import Appearance from './Appearance.vue';
import DeviceID from './DeviceID.vue';

let props = defineProps({
  bitstringId: { type: String, required: true },
  model: { type: TamaMessage, required: true }
})

let message = props.model

let bitstring = computed({
  get() {
    // console.log(`Getting bit string, ${message.value.getBitstring()}`)
    return message.getBitstring()
  },
  set(newValue) {
    // console.log("New value: " + newValue)
    if (/[10]{160}/.test(newValue)) {
      // console.log(`Setting value ${newValue}`)
      message.update(newValue)
    }
  }
})

</script>

<template>
  <div class="bitstring-display-container">
    <div class="bit-chunk-container" v-if="bitstring.length === 160">
      <!-- To add a new chunk also update model.ts -->
      <BitChunk :known="true" :model="message.hardcodedThing"></BitChunk>
      <BitChunk :model="message.unknown1"></BitChunk>
      <DeviceID :known="true" :model="message.deviceID"></DeviceID>
      <Appearance :model="message.appearance"></Appearance>
      <NameBits :model="message.name"></NameBits>
      <BitChunk :model="message.unknown3"></BitChunk>
      <BitChunk :model="message.unknown4"></BitChunk>
      <BitChunk :model="message.unknown5"></BitChunk>
      <BitChunk :model="message.unknown6"></BitChunk>
      <BitChunk :model="message.unknown7"></BitChunk>
      <BitChunk :model="message.unknown8"></BitChunk>
      <BitChunk :model="message.unknown9"></BitChunk>
      <BitChunk :model="message.unknown10"></BitChunk>
      <BitChunk :model="message.unknown11"></BitChunk>

      <ChecksumBits :bits="message.getChecksumString(message.getBitsNoChecksum())"></ChecksumBits>
    </div>
    <p v-else>Open a recorded signal in "View Saved", or record a new one in the "Record" tab.</p>
    <input type="textarea" class="bitstring-input" v-model="bitstring">
  </div>

</template>

<style scoped>
.bitstring-input {
  width: 161ch;
  font-family: monospace;
  /* background-color: var(--light-gray); */
}

.bit-chunk-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.bitstring-display-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  padding: 2rem 1rem;
}
</style>