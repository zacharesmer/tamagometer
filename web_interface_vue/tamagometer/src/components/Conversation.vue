<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import BitstringInput from './BitstringInput.vue';
import { connection } from '@/serial';

const props = defineProps({
    conversationId: { type: String, required: true },
})

// current implementation of this is a total footgun
// TODO fix it because accessing it with `messages.get("message1").value.bitstring` 
// is a total abomination
let messages: Map<string, any> = new Map

for (let i = 1; i <= 4; i++) {
    messages.set("message" + i, useTemplateRef("message" + i))
}

// get whatever bitstrings are stored in the child components so I can send them over serial
function getBitstrings() {
    for (let i = 1; i <= messages.keys.length; i++) {
        console.log(messages.get("message" + i).value.bitstring)
    }
}

async function startConversation() {
    let response1 = await connection.sendCommandUntilResponse(messages.get("message1").value.bitstring);
    if (response1 === null) {
        console.error("Response 1 not received")
        return;
    }
    console.log(`received ${response1}`)
    let response2 = await connection.sendCommandUntilResponse(messages.get("message3").value.bitstring, 3);
    if (response2 === null) {
        console.error("Response 2 not received")
        return;
    }
    console.log(`received ${response2}`)
}

async function awaitConversation() {
    // wait for a first message or until it's cancelled
    let message1 = await connection.readOneCommandCancellable();
    if (message1 === null) {
        console.error("Cancelled, message 1 not received")
        return;
    }
    console.log(`Received ${message1}`);
    await connection.sendCommand(messages.get("message2").value.bitstring);
    // send the response and await a second message, repeat up to 3 times if necessary
    let message2 = await connection.readOneCommandCancellable(3);
    if (message2 === null) {
        console.error("Message 2 not received")
        return;
    }
    console.log(`received ${message2}`);
    // send the final message 2 times just in case. The repeat is probably not 
    // necessary but my transmitter is a little wonky
    await connection.sendCommandNTimes(messages.get("message4").value.bitstring, 2);
}


</script>

<!-- The conversation ID and conversation index is used to save the text box values to localStorage so that they'll persist when the page is reloaded-->

<template>
    <BitstringInput ref="message1" :bitstring-id="conversationId + '1'"></BitstringInput>
    <BitstringInput ref="message2" :bitstring-id="conversationId + '3'"></BitstringInput>
    <BitstringInput ref="message3" :bitstring-id="conversationId + '2'"></BitstringInput>
    <BitstringInput ref="message4" :bitstring-id="conversationId + '4'"></BitstringInput>
    <div>
        <button @click="startConversation">Start interaction</button>
        <button @click="awaitConversation">Wait for interaction</button>
    </div>
</template>

<style></style>