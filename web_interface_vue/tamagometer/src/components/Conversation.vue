<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import BitstringInput from './BitstringInput.vue';
import { connection } from '@/serial';

const props = defineProps({
    conversationId: { type: String, required: true },
})

let messages: any[] = []
for (let i = 1; i <= 4; i++) {
    messages.push(useTemplateRef("message" + i))
}

// get whatever bitstrings are stored in the child components so I can send them over serial
function getBitstrings() {
    for (let i = 0; i < messages.length; i++) {
        console.log(messages[i].value.bitstring)
    }
}

async function startConversation() {
    let response1 = await connection.sendCommandUntilResponse(messages[1].value.bitstring);
    if (response1 === null) {
        console.error("Response 1 not received")
        return;
    }
    console.log(`received ${response1}`)
    let response2 = await connection.sendCommandUntilResponse(messages[3].value.bitstring, 3);
    if (response2 === null) {
        console.error("Response 2 not received")
        return;
    }
    console.log(`received ${response2}`)
}

function awaitConversation() {

}

const initiateConversation = true

</script>

<!-- The conversation ID and conversation index is used to save the text box values to localStorage so that they'll persist when the page is reloaded-->

<template>
    <BitstringInput ref="message1" :bitstring-id="conversationId + '1'"></BitstringInput>
    <BitstringInput ref="message3" :bitstring-id="conversationId + '3'"></BitstringInput>
    <BitstringInput ref="message2" :bitstring-id="conversationId + '2'"></BitstringInput>
    <BitstringInput ref="message4" :bitstring-id="conversationId + '4'"></BitstringInput>
    <div v-if="initiateConversation">
        <button @click="startConversation">Start interaction</button>
        <button @click="awaitConversation">Wait for interaction</button>
    </div>
</template>

<style></style>