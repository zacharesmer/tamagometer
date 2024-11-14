<script lang="ts" setup>
import { ref, computed, defineProps, watch, onMounted } from 'vue'
import BitChunk from './BitChunk.vue';
import { TamaMessage, TamaName } from '@/model';
import NameBits from './NameBits.vue'
import ChecksumBits from './ChecksumBits.vue';
import Appearance from './Appearance.vue';

let props = defineProps({
  bitstringId: { type: String, required: true }
})



let message = ref(new TamaMessage(null))

let bitstring = computed({
  get() {
    // console.log(`Getting bit string, ${message.value.getBitstring()}`)
    return message.value.getBitstring()
  },
  set(newValue) {
    if (/[10]{160}/.test(newValue)) {
      // console.log(`Setting value ${newValue}`)
      message.value.init(newValue)
    }
  }
})


watch(bitstring, () => {
  localStorage.setItem(props.bitstringId, bitstring.value)
})

onMounted(() => {
  const stored = localStorage.getItem(props.bitstringId)
  if (stored !== null) {
    bitstring.value = stored
  }
})

defineExpose({
  bitstring
})

</script>

<template>
  <div class="bitstring-display-container">
    <input class="bitstring-input" v-model="bitstring">
    <div class="bit-chunk-container">
      <!-- To add a new chunk also update model.ts -->
      <BitChunk :model="message.hardcodedThing"></BitChunk>
      <BitChunk :model="message.unknown1"></BitChunk>
      <BitChunk :model="message.id1"></BitChunk>
      <BitChunk :model="message.id2"></BitChunk>
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
  </div>

</template>

<style scoped>
.bitstring-input {
  width: 170ch;
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