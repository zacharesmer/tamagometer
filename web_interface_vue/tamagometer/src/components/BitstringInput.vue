<script lang="ts" setup>
import { ref, computed, defineProps, watch, onMounted } from 'vue'
import BitChunk from './BitChunk.vue';
import { TamaMessage, TamaName } from '@/model';
import NameBits from './NameBits.vue'
import ChecksumBits from './ChecksumBits.vue';

let props = defineProps({
  bitstringId: { type: String, required: true }
})



let message = ref(new TamaMessage(null))

let bitstring = computed({
  get() {
    console.log(`Getting bit string, ${message.value.getBitstring()}`)
    return message.value.getBitstring()
  },
  set(newValue) {
    if (/[10]{160}/.test(newValue)) {
      console.log(`Setting value ${newValue}`)
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
  <input class="bitstring-input" v-model="bitstring">
  <BitChunk :model="message.unknown1"></BitChunk>
  <NameBits :model="message.name"></NameBits>
  <BitChunk :model="message.unknown2"></BitChunk>
  <ChecksumBits :bits="message.getChecksumString(message.getBitsNoChecksum())"></ChecksumBits>
  <!-- <p>{{ message.getBitstring() }}</p> -->
</template>

<style scoped>
.bitstring-input {
  width: 170ch;
}
</style>