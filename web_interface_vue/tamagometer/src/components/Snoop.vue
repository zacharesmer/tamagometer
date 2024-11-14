<script lang="ts" setup>
import { connection } from '@/serial';
import { ref } from 'vue'

let snoopOutput = ref([""])

let cancelSnoop = false;

function stopSnooping() {
    console.log("Snooping is cancelled :(")
    cancelSnoop = true;
    connection.stopListening();
}

async function snoop() {
    // stop any existing listening 
    stopSnooping()
    console.log("Snooping");
    cancelSnoop = false;
    // wait for cancelSnoop to be set
    try {
        while (true) {
            if (cancelSnoop) {
                break;
            }
            let snoopedMessage = await connection.readOneCommandCancellable(null);
            // console.log(snoopedMessage)

            if (snoopedMessage != null) {
                snoopOutput.value.push(snoopedMessage)
            }
        }
    } catch (e) {
        console.log(e)
    }

    cancelSnoop = false;
}
</script>

<template>
    <button @click="snoop">Snoop on a conversation</button>
    <button @click="stopSnooping">Stop snooping</button>
    <div v-for="message in snoopOutput">{{ message }}</div>
</template>