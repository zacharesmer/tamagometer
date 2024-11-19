<script lang="ts" setup>
import { fromRecordingConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { TamaMessage } from '@/model';
import { connection } from '@/serial';
import { onMounted, onUnmounted, ref } from 'vue'

let snoopOutput = ref(new Array<TamaMessage>)

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
                snoopOutput.value.push(new TamaMessage(snoopedMessage))
            }
        }
    } catch (e) {
        console.error(e)
    }

    cancelSnoop = false;
}

const savedConversationName = ref("")

async function saveConversation() {
    // Name is required
    if (fromRecordingConversation.name !== "") {
        await dbConnection.set(fromRecordingConversation.toStored())
    }
}

onMounted(async () => {
    await snoop()
})

onUnmounted(() => {
    stopSnooping()
})

</script>

<template>
    <div>
        <form @submit.prevent="saveConversation">
            <label for="save-recorded-conversation-name">Conversation name/description</label>
            <input v-model="fromRecordingConversation.name" id="save-recorded-conversation-name" required="true">
            <p>Message 1: {{ fromRecordingConversation.message1.getBitstring() }}</p>
            <p>Message 2: {{ fromRecordingConversation.message2.getBitstring() }}</p>
            <p>Message 3: {{ fromRecordingConversation.message3.getBitstring() }}</p>
            <p>Message 4: {{ fromRecordingConversation.message4.getBitstring() }}</p>
            <input type="submit" value="Save conversation"></input>
        </form>
        <!-- <button @click="stopSnooping">Stop snooping</button> -->
    </div>
    <ol v-for="(message, index) in snoopOutput">
        <div>{{ index }}</div>
        <div>{{ message.getBitstring() }}</div>
        <button @click="() => { fromRecordingConversation.message1.init(message.getBitstring()) }">Set Message
            1</button>
        <button @click="() => { fromRecordingConversation.message2.init(message.getBitstring()) }">Set Message
            2</button>
        <button @click="() => { fromRecordingConversation.message3.init(message.getBitstring()) }">Set Message
            3</button>
        <button @click="() => { fromRecordingConversation.message4.init(message.getBitstring()) }">Set Message
            4</button>
    </ol>
</template>