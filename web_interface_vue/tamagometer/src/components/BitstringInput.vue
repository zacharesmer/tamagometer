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
      message.init(newValue)
    }
  }
})

// watch(bitstring, () => {
//   localStorage.setItem(props.bitstringId, bitstring.value)
// })

// onMounted(() => {
//   const stored = localStorage.getItem(props.bitstringId)
//   console.log(stored)
//   if (stored !== null) {
//     bitstring.value = stored
//     console.log(bitstring.value)
//   }
// })

defineExpose({
  bitstring
})

</script>

<template>
  <div class="bitstring-display-container">
    <input type="textarea" class="bitstring-input" v-model="bitstring">
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
    <p v-else>Add a recorded signal to get started. You can record signals from a tamagotchi using the "snoop on
      conversation" button</p>
  </div>

</template>

<style scoped>
.bitstring-input {
  width: 161ch;
  font-family: monospace;
}

.bit-chunk-container {
  display: flex;
  flex-wrap: wrap;
}

.bitstring-display-container {
  padding: 20px 10px;
  margin: 5px;
  border: solid;
}
</style>