<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import BitstringInput from './BitstringInput.vue';
import { connection } from '@/serial';

const props = defineProps({
    // this is used in BitstringInput to store the bitstrings on a page refresh
    conversationId: { type: String, required: true },
})

let message1 = useTemplateRef("message1")
let message2 = useTemplateRef("message2")
let message3 = useTemplateRef("message3")
let message4 = useTemplateRef("message4")


// Send messages 1 and 3 from the conversation UI
async function startConversation() {
    // this is kind of silly because these won't be null as soon as the stuff is mounted, and the button
    // to make this happen also can't be clicked until then, but typescript doesn't know that
    if (message1.value !== null && message2.value !== null && message3.value !== null && message4.value !== null) {
        let received1 = await connection.sendCommandUntilResponse(message1.value.bitstring);
        if (received1 === null) {
            console.error("Response 1 not received")
            return;
        }
        console.log(`received ${received1}`)
        let received2 = await connection.sendCommandUntilResponse(message3.value.bitstring, 3);
        if (received2 === null) {
            console.error("Response 2 not received")
            return;
        }
        console.log(`received ${received2}`)
        // not a typo, I'm setting every other message
        message2.value.bitstring = received1
        message4.value.bitstring = received2
    }
}

// Respond with messages 2 and 4 from the conversation UI
async function awaitConversation() {
    // this is kind of silly because these won't be null as soon as the stuff is mounted, and the button
    // to make this happen also can't be clicked until then, but typescript doesn't know that
    if (message1.value !== null && message2.value !== null && message3.value !== null && message4.value !== null) {
        // wait for a first message or until it's cancelled
        let received1 = await connection.readOneCommandCancellable();
        if (received1 === null) {
            console.error("Cancelled, message 1 not received")
            return;
        }
        console.log(`Received ${received1}`);
        await connection.sendCommand(message2.value.bitstring);
        // send the response and await a second message, repeat up to 3 times if necessary
        let received2 = await connection.readOneCommandCancellable(3);
        if (received2 === null) {
            console.error("Message 2 not received")
            return;
        }
        console.log(`received ${received2}`);
        // send the final message 2 times just in case. The repeat is probably not 
        // necessary but my transmitter is a little wonky
        await connection.sendCommandNTimes(message4.value.bitstring, 2);
        message1.value.bitstring = received1
        message3.value.bitstring = received2
    }
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