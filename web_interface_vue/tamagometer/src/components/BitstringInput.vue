<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import UnknownBits from './UnknownBits.vue';
import { TamaMessage, TamaName } from '@/model';
import NameBits from './NameBits.vue'
import ChecksumBits from './ChecksumBits.vue';

let message = ref(new TamaMessage(null))

let bitstring = computed({
  get() {
    console.log(`Getting bit string, ${message.value.getBitstring()}`)
    return message.value.getBitstring()
  }, 
  set(newValue) {
    if (/[10]{160}/.test(newValue)){
      console.log(`Setting value ${newValue}`)
      message.value.init(newValue)
    }
  } 
})

// watch(bitstring, () => {
//   if (bitstring.value.length === 160 && /[10]{160}/.test(bitstring.value)){
//     message.value.init(bitstring.value)
//   }
// })

</script>

<template>
  <input class="bitstring-input" v-model="bitstring">
  <UnknownBits :model="message.unknown1"></UnknownBits>
  <NameBits :model="message.name"></NameBits>
  <UnknownBits :model="message.unknown2"></UnknownBits>
  <ChecksumBits :bits="message.getChecksumString(message.getBitsNoChecksum())"></ChecksumBits>
  <!-- <p>{{ message.getBitstring() }}</p> -->
</template>

<style scoped>
.bitstring-input {
  width: 170ch;
}
</style>