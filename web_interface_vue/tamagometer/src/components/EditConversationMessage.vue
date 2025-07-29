<script lang="ts" setup>
import { computed } from 'vue'
import EditConversationBitChunk from './EditConversationBitChunk.vue';
import { TamaMessage } from '@/model';
import EditConversationNameBits from './EditConversationNameBits.vue'
import EditConversationChecksumBits from './EditConversationChecksumBits.vue';
import EditConversationAppearance from './EditConversationAppearance.vue';
import EditConversationDeviceID from './EditConversationDeviceID.vue';
import EditConversationGiftItem from './EditConversationGiftItem.vue';

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
      <EditConversationBitChunk :known="true" :model="message.hardcodedThing"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown1"></EditConversationBitChunk>
      <EditConversationDeviceID :known="true" :model="message.deviceID"></EditConversationDeviceID>
      <EditConversationAppearance :model="message.appearance"></EditConversationAppearance>
      <EditConversationNameBits :model="message.name"></EditConversationNameBits>
      <EditConversationBitChunk :model="message.unknown3"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown4"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown5"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown6"></EditConversationBitChunk>
      <EditConversationGiftItem :model="message.giftitem"></EditConversationGiftItem>
      <EditConversationBitChunk :model="message.unknown8"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown9"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown10"></EditConversationBitChunk>
      <EditConversationBitChunk :model="message.unknown11"></EditConversationBitChunk>

      <EditConversationChecksumBits :bits="message.getChecksumString(message.getBitsNoChecksum())">
      </EditConversationChecksumBits>
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