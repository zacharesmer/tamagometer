<script lang="ts" setup>
import BitstringInput from './BitstringInput.vue';
// import { editingConversation, selectedConversation } from '@/conversation'
import { dbConnection } from '@/database';
import ConversationButtons from './ConversationButtons.vue';
import ConversationNameInput from './ConversationNameInput.vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { onMounted, ref, useTemplateRef } from 'vue';
import { activeConversation as conversation } from '@/state';
import { getPortOrNeedToRetry } from '@/serial';

import { toast } from 'vue3-toastify'
import StatusIndicator from './StatusIndicator.vue';

const route = useRoute()
let workerPromise: Promise<void>
let worker: Worker
const workerHasBeenSetup = ref(false);

const needToRetry = ref(false)
const statusIndicator = useTemplateRef("statusIndicator")

// onMounted(async () => {
//     if (route.query.dbid) {
//         const dbId = parseInt(route.query.dbid as string)
//         const stored = await dbConnection.get(dbId)
//         conversation.initFromStored(stored)
//     }
//     setUpWorker()
// })

onBeforeRouteLeave(async (to, from, next) => {
    worker.postMessage({ kind: "stopWork" })
    await workerPromise.catch(r => {
        console.log(r)
    })
    next()
})

async function setUpWorker() {
    // console.log("Setting up conversation worker...")
    needToRetry.value = await getPortOrNeedToRetry()
    workerPromise = new Promise((resolve, reject) => {
        worker = new Worker(new URL("@/conversationWorker.ts", import.meta.url), { type: "module" })
        workerHasBeenSetup.value = true;
        worker.onmessage = (e: MessageEvent) => {
            const message = e.data as FromConversationWorker
            switch (message.kind) {
                // Update the UI with the responses
                case "conversationResponse": {
                    // console.log(message.response1, message.response2)
                    console.log(message)
                    // conversation.message2.update(message.response1)
                    // conversation.message4.update(message.response2)
                    // Why is this vvvv never true??
                    if (message.responseTo == "initiate") {
                        console.log("Updating messages 2 and 4...")
                        conversation.message2.update(message.response1)
                        conversation.message4.update(message.response2)
                    }
                    if (message.response2 == "await") {
                        console.log("Updating messages 1 and 3...")
                        conversation.message1.update(message.response1)
                        conversation.message3.update(message.response2)
                    }
                    break
                }
                case "workerDone": {
                    // console.log("Worker is done")
                    resolve()
                    break
                }
                case "workerError": {
                    needToRetry.value = true
                    reject(message.error)
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
        worker.onerror = (e) => { console.error("Error in listening worker:", e) }
        worker.postMessage({ kind: "connectSerial" })
    })
}

function startConversation(message1Bitstring: string, message2Bitstring: string) {
    // TODO: I need something to prevent spamming the button. Maybe a promise in the 
    // webworker so it will just ignore any messages until the conversation is complete or cancelled?
    // console.log("Starting conversation...")


    worker.postMessage({
        kind: "conversation",
        message1: message1Bitstring,
        message2: message2Bitstring,
        conversationType: "start"
    })
}

function awaitConversation() {
    worker.postMessage({
        kind: "conversation",
        message1: conversation.message2.getBitstring(),
        message2: conversation.message4.getBitstring(),
        conversationType: "wait"
    })
}

function stopWaiting() {
    worker.postMessage({ kind: "stopWaitingForConversation" })
}

// Write the current conversation to the database. 
// Update the selected conversation to the newly created one
function saveNewConversation(newName: string) {
    if (conversation.oneOrMoreMessagesAreInvalid()) {
        toast("Could not save conversation without all messages", { type: 'error' })
        return
    }
    const toastId = toast("Saving...")
    conversation.name = newName;
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
    conversation.name = newName;
}

function reloadPage() {
    window.location.reload()
}

const emit = defineEmits(["startConversation", "awaitConversation", "stopWaiting"])

</script>


<template>
    <div>
        <div>
            <div>
                <div>Welcome to the Tamagometer Quick Demo! This page lets you quickly test your setup and make a fake
                    Tamagotchi visit your real-world virtual pet!</div>
                <div>&nbsp;</div>
                <div>You can use Tamagometer with either a Flipper Zero, or a custom-built MicroPython RP2040 device.
                </div>
                <div>&nbsp;</div>
                <div><strong>To use with a Flipper Zero</strong>, ensure you have the Tamagometer app installed and
                    running.</div>
                <div>&nbsp;</div>
                <div><strong>To use with an RP2040 device</strong>, assemble and flash the device according to the
                    specification in GitHub.</div>
                <div>&nbsp;</div>
                <div><strong>Instructions:</strong></div>
                <ol>
                    <li>Connect your Flipper Zero or RP2040 to your computer. Ensure you are using a high-quality USB
                        cable.</li>
                    <li>Press "Connect"</li>
                    <li>If prompted, select the COM port corresponding to your device in the bubble that pops up. If no
                        bubble pops up, you have probably already connected before.&nbsp;</li>
                    <li>On your Tamagotchi, start listening for a visit (heart menu -&gt; visit; get to the page where
                        it says "Stand by")</li>
                    <li>After connecting, press one of the "Start Interaction" buttons below.</li>
                    <li>Watch your Tamagotchi screen!</li>
                </ol>
                <div>&nbsp;</div>

            </div>
        </div>


        <div class="">

            <StatusIndicator ref="statusIndicator"></StatusIndicator>
            <div v-if="needToRetry" class="retry">
                <p>Could not connect to serial.</p>
                <button @click="setUpWorker">Retry</button>
                <p>Or if that doesn't work</p>
                <button @click="reloadPage">Refresh the page</button>
            </div>


            <div v-if="!workerHasBeenSetup">
                <button class="icon-label-button" @click="() => { setUpWorker() }">
                    <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M26 48L26 58C26 65.732 32.268 72 40 72C47.732 72 54 65.732 54 58V48" />
                        <path d="M26 32L26 22C26 14.268 32.268 8 40 8C47.732 8 54 14.268 54 22V32" />
                        <path d="M40 53L40 27" />
                    </svg>
                    <span>Connect!</span>
                </button>

            </div>
            <div class="visits-container" v-else>

                <div class="demo-visit-button-and-desc-row">
                    <div class="demo-visit-desc">Visit 1: Jump around and spin!</div>
                    <button class="icon-label-button"
                        @click="() => { startConversation('0000111000000000001100011011111000011110000000110000000000001101000010001010000000000010000000000010001000000000000000000000000000000000000000000001010000001011', '0000111000001000001100011011111000011110000000110000000000001101000010001010000000000001000000000000000000000000000000000000000000000000000000000000000011011100') }">
                        <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
                        </svg>
                        <span>Start interaction!</span>
                    </button>
                </div>
                <div class="demo-visit-button-and-desc-row">
                    <div class="demo-visit-desc">Visit 2: Jump on scale!</div>
                    <button class="icon-label-button"
                        @click="() => { startConversation('0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000001111001101001', '0000111000001000110111100101101000110010100010001000100010001000100010001000100000000000000000000000000000000000000000000000000000000000000000000000000000101000') }">
                        <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
                        </svg>
                        <span>Start interaction!</span>
                    </button>
                </div>
                <div class="demo-visit-button-and-desc-row">
                    <div class="demo-visit-desc">Visit 3: Music notes!</div>
                    <button class="icon-label-button"
                        @click="() => { startConversation('0000111000000000110111100101101000110010100010001000100010001000100010001000100000000010000000000010001100000000000001100000000000000000000000000000101001010101', '0000111000001000110111100101101000110010100010001000100010001000100010001000100000000011000000000000000000000000000000000000000000000000000000000000000000101011') }">
                        <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
                        </svg>
                        <span>Start interaction!</span>
                    </button>
                </div>
            </div>
            <div>&nbsp;</div>

            <div><strong>Troubleshooting:</strong></div>
            <div>&nbsp;</div>
            <div>Issue: My browser prompts me to select a device to connect to, but there are no devices listed
            </div>
            <div>Solution: 1) Ensure you are using a high-quality USB cable that supports data transfer. Many cables
                are for power only, so your device might charge/turn on without actually working. 2) Ensure you have
                the appropriate driver(s) for your device installed on your computer.</div>
            <div>&nbsp;</div>
            <div>
                <div>Issue: My Tamagotchi shows "Fail"</div>
                <div>Solution: 1) When you start listening for a visit (step 4 above), make sure you do NOT press B
                    on the page where it says "Stand by". You need it to be on "Stand by" when you go to step 5. 2) Confirm your Tamagotchi is close to and pointed towards your transmitter device.
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.name-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    padding-bottom: 1rem;
    align-items: center;
}

.retry {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.messages-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.demo-visit-button-and-desc-row{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    /* padding: 1rem; */
}

.visits-container {
    display: flex;
    gap: 1rem;
}
</style>