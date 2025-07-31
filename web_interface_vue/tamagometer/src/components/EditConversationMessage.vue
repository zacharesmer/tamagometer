<script lang="ts" setup>
import { computed } from 'vue'
import EditConversationBitChunk from './EditConversationBitChunk.vue';
import { TamaMessage, TamaMessage3, TamaMessage4 } from '@/model';
import EditConversationNameBits from './EditConversationNameBits.vue'
import EditConversationChecksumBits from './EditConversationChecksumBits.vue';
import EditConversationAppearance from './EditConversationAppearance.vue';
import EditConversationDeviceID from './EditConversationDeviceID.vue';
import EditConversationGiftItem from './EditConversationGiftItem.vue';
import EditConversationGiftActivity from './EditConversationGiftActivity.vue';
import EditConversationVisitActivity from './EditConversationVisitActivity.vue';
import EditConversationType from './EditConversationType.vue';
import EditConversationGame from './EditConversationGame.vue';
import EditConversationWager from './EditConversationWager.vue';

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
      <EditConversationBitChunk :known="true" :model="message.hardcodedThing" />
      <EditConversationType :model="message.conversationType"
        v-if="(message instanceof TamaMessage3) || (message instanceof TamaMessage4)" />
      <EditConversationBitChunk :known="true" :model="message.unknown1" v-else />
      <EditConversationDeviceID :known="true" :model="message.deviceID" />
      <EditConversationAppearance :model="message.appearance" />
      <EditConversationNameBits :model="message.name" />
      <EditConversationBitChunk :model="message.unknown3" />
      <EditConversationVisitActivity :model="message.visitActivity" v-if="(message instanceof TamaMessage3)" />
      <EditConversationBitChunk :model="message.unknown4" />
      <EditConversationBitChunk :model="message.unknown5" />
      <EditConversationBitChunk :model="message.unknown6" />
      <EditConversationGiftItem :model="message.giftitem" v-if="(message instanceof TamaMessage4)" />
      <EditConversationBitChunk :model="message.unknown7" v-else />
      <EditConversationGiftActivity :model="message.giftactivity" v-if="(message instanceof TamaMessage4)" />
      <EditConversationBitChunk :model="message.unknown8" v-else />
      <EditConversationWager :model="message.wager" v-if="(message instanceof TamaMessage3)" />
      <EditConversationBitChunk :model="message.unknown9" v-else />
      <EditConversationBitChunk :model="message.unknown10" />
      <EditConversationGame :model="message.gameType" />
      <EditConversationBitChunk :model="message.unknown11" />
      <EditConversationChecksumBits :bits="message.getChecksumString(message.getBitsNoChecksum())" />
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