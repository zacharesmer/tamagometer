<script lang="ts" setup>
import { fromRecordingConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { TamaMessage } from '@/model';
import { connection } from '@/serial';
import { onMounted, onUnmounted, ref } from 'vue'

let snoopOutput = ref(new Array<TamaMessage>);

snoopOutput.value.push(new TamaMessage("0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101"))
snoopOutput.value.push(new TamaMessage("0000111000000001101111110010001000110001000110010000000000000010000001111000000100000000011001000010001000000000000000000000000000000000000000000000101001010100"))
snoopOutput.value.push(new TamaMessage("0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011"))
snoopOutput.value.push(new TamaMessage("0000111000001001101111110010001000110001000110010000000000000010000001111000000100000011000000000000000000000000000000000000000000000000000000000000000011001111"))

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
            <label>Conversation name/description</label>
            <input v-model="fromRecordingConversation.name" required="true">
            <p>Message 1: {{ fromRecordingConversation.message1.getBitstring() }}</p>
            <p>Message 2: {{ fromRecordingConversation.message2.getBitstring() }}</p>
            <p>Message 3: {{ fromRecordingConversation.message3.getBitstring() }}</p>
            <p>Message 4: {{ fromRecordingConversation.message4.getBitstring() }}</p>
            <button type="submit">Save conversation</button>
        </form>
        <!-- <button @click="stopSnooping">Stop snooping</button> -->
    </div>

    <table>
        <tbody>
            <tr>
                <th></th>
                <th></th>
            </tr>
            <template v-for="(message, index) in snoopOutput">
                <tr>
                    <td>{{ index }}</td>
                    <td>
                        <span>{{ message.getBitstring() }}</span>
                        <div class="set-message-buttons-container">
                            <button class="round-button"
                                @click="() => { fromRecordingConversation.message1.init(message.getBitstring()) }">1</button>
                            <button class="round-button"
                                @click="() => { fromRecordingConversation.message2.init(message.getBitstring()) }">2</button>
                            <button class="round-button"
                                @click="() => { fromRecordingConversation.message3.init(message.getBitstring()) }">3</button>
                            <button class="round-button"
                                @click="() => { fromRecordingConversation.message4.init(message.getBitstring()) }">4</button>
                        </div>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>

<style scoped>
.set-message-buttons-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}
</style>