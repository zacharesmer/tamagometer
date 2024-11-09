<script lang="ts" setup>
import { connection } from '@/serial';
import { ref } from 'vue'

let snoopOutput = ref([""])

let cancelSnoop = false;

function stopSnooping() {
    cancelSnoop = true;
    connection.stopListening();
}

async function snoop() {
    console.log("Snooping");
    cancelSnoop = false;
    // wait for 4 messages, or for cancelSnoop to be set
    for (let i = 0; i < 4; i++) {
        if (cancelSnoop) {
            console.log("Snooping is cancelled :(")
            break;
        }
        let snoopedMessage = await connection.readOneCommandCancellable(null);
        console.log(snoopedMessage)

        if (snoopedMessage != null) {
            snoopOutput.value.push(snoopedMessage)
        }
    }
    cancelSnoop = false;
}
</script>

<template>
    <button @click="snoop">Snoop on a conversation</button>
    <button @click="stopSnooping">Stop snooping</button>
    <div v-for="message in snoopOutput">{{ message }}</div>
</template>