<script lang="ts" setup>
import EditConversationMessage from './EditConversationMessage.vue';
import EditButtonsTxRx from './EditButtonsTxRx.vue';
import AppInputConversationName from './AppInputConversationName.vue';
import AppStatusIndicator from './AppStatusIndicator.vue';
import AppButtonRetry from './AppButtonRetry.vue';

import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify'

import { dbConnection } from '@/database';
import { serialWorker, haveConversation, stopTask, connectSerial } from '@/serialworkerinterface';
import { activeConversation as conversation } from '@/state';


const showRetryButton = ref(false)

const statusIndicator = useTemplateRef("statusIndicator")

const show1 = ref(true)
const show2 = ref(true)
const show3 = ref(true)
const show4 = ref(true)

const nameDirtyComputed = computed({ get: () => { return conversation.nameDirty() }, set: () => { } })

onMounted(async () => {
    const route = useRoute()
    if (route.query.dbid) {
        if (unsavedChanges()) {
            // timeout is necessary because without it, the message displays before opening the edit page
            // that's not what the Vue lifecycle documentation suggests should happen in onMounted, but hey, whatever
            // also I tried nextTick, doesn't help
            setTimeout(async () => {
                let go_on = window.confirm("Open conversation has unsaved changes. Open anyway?")
                if (go_on) {
                    const dbId = parseInt(route.query.dbid as string)
                    const stored = await dbConnection.get(dbId)
                    conversation.initFromStored(stored)
                    console.log(conversation.name)
                }
            }, 20)
        }
        else {
            const dbId = parseInt(route.query.dbid as string)
            const stored = await dbConnection.get(dbId)
            conversation.initFromStored(stored)
            console.log(conversation.name)
        }
    }
    serialWorker.addEventListener("message", conversationEventListener)
})

onBeforeRouteLeave(async (to, from) => {
    stopTask().catch(r => { })
    serialWorker.removeEventListener("message", conversationEventListener)
})

function unsavedChanges(): boolean {
    return conversation.differs() && conversation.initialized()
}

// Conversation-specific message handling. More general message handling is in serial.ts
function conversationEventListener(e: MessageEvent) {
    const message = e.data as FromWorker
    switch (message.kind) {
        // Update the UI with the responses
        // In some distant future it could make sense for these responses to be passed through the `resolve` 
        // of the promise. 
        case "conversationResponse": {
            // console.log(message.response1, message.response2)
            // console.log(message)
            if (message.responseTo == "initiate") {
                console.log("Updating messages 2 and 4...")
                conversation.message2.update(message.response1)
                conversation.message4.update(message.response2)
            }
            if (message.responseTo == "await") {
                console.log("Updating messages 1 and 3...")
                conversation.message1.update(message.response1)
                conversation.message3.update(message.response2)
            }
            break
        }
        case "animate": {
            if (message.animation === "statusIndicator") {
                statusIndicator.value?.animateStatusIndicator()
            }
            break
        }
    }
}

async function startConversation() {
    // console.log("Starting conversation...")
    await haveConversation(
        conversation.message1.getBitstring(),
        conversation.message3.getBitstring(),
        'initiate'
    ).catch(r => { showRetryButton.value = true })
}

async function awaitConversation() {
    await haveConversation(
        conversation.message2.getBitstring(),
        conversation.message4.getBitstring(),
        "await",
    ).catch(r => { showRetryButton.value = true })
}

function stopWaiting() {
    stopTask().catch(r => { })
}

// Write the current conversation to the database. 
// Update the selected conversation to the newly created one
function saveNewConversation(newName: string) {
    if (conversation.oneOrMoreMessagesAreInvalid()) {
        toast("Could not save conversation without all messages", { type: 'error' })
        return
    }
    const toastId = toast("Saving...")
    conversation.setName(newName);
    dbConnection.set(conversation.toStored()).then(async dbId => {
        const stored = await dbConnection.get(dbId)
        conversation.initFromStored(stored)
        toast.update(toastId, {
            render: "Saved",
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: 'success',
            isLoading: false,
        })
    })
}

function saveName(newName: string) {
    // console.log(newName)
    conversation.setName(newName)
}

function retry() {
    showRetryButton.value = false
    connectSerial()
}

</script>


<template>
    <div v-if="!conversation.oneOrMoreMessagesAreInvalid()">
        <div :class="['name-buttons-container']">
            <AppInputConversationName class="name-input"
                @save-new-conversation="(newName) => { saveNewConversation(newName) }"
                @save-name="(newName) => { saveName(newName) }" :name="conversation.name"
                :nameDirty="nameDirtyComputed">
            </AppInputConversationName>
            <AppStatusIndicator ref="statusIndicator"></AppStatusIndicator>
            <AppButtonRetry v-if="showRetryButton" direction="row" @retry="retry">
            </AppButtonRetry>
            <EditButtonsTxRx v-else class="conversation-buttons" @start-conversation="() => { startConversation() }"
                @await-conversation="() => { awaitConversation() }" @stop-waiting="() => { stopWaiting() }">
            </EditButtonsTxRx>
        </div>
        <details class="show-which-messages-container">
            <summary>
                Choose messages to show
            </summary>
            <div class="which-messages-checkboxes-container">
                <div>
                    <input type="checkbox" v-model="show1" id="show-message-1"><label for="show-message-1">Message
                        1</label></input>
                </div>
                <div>
                    <input type="checkbox" v-model="show2" id="show-message-2"><label for="show-message-2">Message
                        2</label></input>
                </div>
                <div>
                    <input type="checkbox" v-model="show3" id="show-message-3"><label for="show-message-3">Message
                        3</label></input>
                </div>
                <div>
                    <input type="checkbox" v-model="show4" id="show-message-4"><label for="show-message-4">Message
                        4</label></input>
                </div>
            </div>
        </details>

        <div class="messages-container">
            <EditConversationMessage :model="conversation.message1" bitstring-id="editingConversationMessage1"
                class="message from-tama1" v-if="show1" />
            <EditConversationMessage :model="conversation.message2" bitstring-id="editingConversationMessage2"
                class="message from-tama2" v-if="show2" />
            <EditConversationMessage :model="conversation.message3" bitstring-id="editingConversationMessage3"
                class="message from-tama1" v-if="show3" />
            <EditConversationMessage :model="conversation.message4" bitstring-id="editingConversationMessage4"
                class="message from-tama2" v-if="show4" />
        </div>
    </div>
    <div v-else>
        <h2>No conversation selected.</h2>
    </div>
</template>

<style scoped>
.name-buttons-container {
    height: 6rem;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    padding-bottom: 1rem;
    align-items: center;
}

.messages-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.show-which-messages-container {
    padding: 0 0 1rem 1rem;
}

.which-messages-checkboxes-container {
    padding: 1rem;
    display: flex;
    flex-direction: row;
    gap: 1rem;
}
</style>