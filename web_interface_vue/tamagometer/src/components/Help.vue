<script lang="ts" setup>
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { ref, useTemplateRef } from 'vue';
import { activeConversation as conversation } from '@/state';
import { getPortOrNeedToRetry } from '@/serial';

import StatusIndicator from './StatusIndicator.vue';

let workerPromise: Promise<void>
let worker: Worker
const workerHasBeenSetup = ref(false);

const needToRetry = ref(false)
const statusIndicator = useTemplateRef("statusIndicator")

onBeforeRouteLeave(async (to, from, next) => {
    if (workerHasBeenSetup.value) {
        worker.postMessage({ kind: "stopWork" })
        await workerPromise.catch(r => {
            console.log(r)
        })
    }
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
    worker.postMessage({
        kind: "conversation",
        message1: message1Bitstring,
        message2: message2Bitstring,
        conversationType: "start"
    })
}

function reloadPage() {
    window.location.reload()
}

</script>


<template>
    <div class="body-text-container">
        <div class="setup-container">
            <h2>Hardware Setup</h2>
            <p>You can use the Tamagometer with a Flipper Zero or a Raspberry Pi Pico (or probably other boards
                that can run Micropython, but they have not been tested).</p>
            <h3>Flipper Zero Setup</h3>
            <p>Install the <a href="https://github.com/zacharesmer/tamagometer-companion-flipper/tree/main"
                    target="_blank">Tamagometer Companion app</a>, and make sure it is open on your Flipper.</p>
            <h3>DIY device Setup (Raspberry Pi Pico or other)</h3>
            <p><a href="https://github.com/zacharesmer/tamagometer?tab=readme-ov-file#hardware" target="_blank">Follow
                    the instructions here</a> to connect the infrared receiver and transmitter, and load the
                firmware onto the board.</p>
            <h2>Demo: Test it out!</h2>
            <ol>
                <li>Connect the Flipper Zero or DIY device to your computer. Ensure you are using a USB cable that is
                    set up for data transfer (not just charging).</li>
                <li>Press the "Connect" button below (on the other pages the device should connect automatically so
                    there's no button)</li>
                <li>If prompted, select the serial port/COM port corresponding to your device. If nothing pops up, you
                    have probably connected before and the device was saved.</li>
                <li>On your Tamagotchi, wait for a visit (heart menu -&gt; visit; the screen should say "Stand by")</li>
                <li>After connecting, there will be some buttons for different visiting animations below. Click one to
                    start a visit!</li>
                <li>Watch your Tamagotchi screen!</li>
            </ol>
        </div>
        <div class="interactive-container">
            <StatusIndicator ref="statusIndicator"></StatusIndicator>
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
            <div v-else>
                <div v-if="needToRetry" class="retry">
                    <p>Could not connect to serial.</p>
                    <button @click="setUpWorker">Retry</button>
                    <p>Or if that doesn't work</p>
                    <button @click="reloadPage">Refresh the page</button>
                </div>
                <div class="visits-container" v-else>
                    <div class="demo-visit-button-and-desc-row">
                        <!-- <div class="demo-visit-desc">Visit 1: Jump around and spin!</div> -->
                        <button class="icon-label-button" @click="() => {
                            startConversation(
                                '0000111000000000001100011011111000011110000001110000100010000000011111111000000100000010000000000010001000000000000000000000000000000000000000000001010011100010',
                                '0000111000001000001100011011111000011110000001110000100010000000011111111000000100000001000000000000000000000000000000000000000000000000000000000000000010110011'
                            )
                        }">
                            <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
                            </svg>
                            <span>Jump around!</span>
                        </button>
                    </div>
                    <div class="demo-visit-button-and-desc-row">
                        <!-- <div class="demo-visit-desc">Visit 2: Jump on scale!</div> -->
                        <button class="icon-label-button" @click="() => {
                            startConversation(
                                '0000111000000000110111100101101000101011000001110000100010000000011111111000000100000010000000000010001100000000000001100000000000000000000000000001111001001001',
                                '0000111000001000110111100101101000101011000001110000100010000000011111111000000100000000000000000000000000000000000000000000000000000000000000000000000000001000'
                            )
                        }">
                            <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
                            </svg>
                            <span>Jump on scale!</span>
                        </button>
                    </div>
                    <div class="demo-visit-button-and-desc-row">
                        <!-- <div class="demo-visit-desc">Visit 3: Music notes!</div> -->
                        <button class="icon-label-button" @click="() => {
                            startConversation(
                                '0000111000000000110111100101101000101001000001110000100010000000011111111000000100000010000000000010001100000000000001100000000000000000000000000000101000110011',
                                '0000111000001000110111100101101000101001000001110000100010000000011111111000000100000011000000000000000000000000000000000000000000000000000000000000000000001001'
                            )
                        }">
                            <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
                            </svg>
                            <span>Music Notes!</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="troubleshooting-container">

            <h2><strong>Troubleshooting</strong></h2>
            <h3>Issue: The device is not listed in the browser prompt for serial connections
            </h3>
            <ol>
                <li>
                    Ensure you are using a USB cable that supports data transfer. Many cables are for power
                    only, so your device might charge/turn on but be unable to communicate with the computer.
                </li>
                <li>On Windows, check that you have the appropriate driver(s) for your device installed on your
                    computer.</li>
                <li>On Linux, make sure your user account has permission to access the serial port. Check that you're in
                    the <code>dialout</code> group, and that <code>brltty</code> is not running and monopolizing the
                    serial ports.</li>
            </ol>

            <h3>Issue: Tamagotchi screen says "FAIL"</h3>
            <ol>
                <li>
                    When you wait for a visit on the tamagotchi (step 4 above), make sure you're not pressing B on the
                    page where it says "Stand
                    by".
                    It needs to be on "Stand by" so your tamagotchi can respond to the website initiating a visit.
                </li>
                <li>
                    Make sure your Tamagotchi is close to and pointed towards your transmitter device.
                </li>
            </ol>
            <h3>Other</h3>
            <p>At least for now, all input to and output from the serial device (Flipper or pico) is being printed to
                the browser console. Use the chrome devtools to see what's going on with the connection. Refreshing the
                page may also help.</p>
        </div>
    </div>

</template>

<style scoped>
.body-text-container {
    display: flex;
    flex-direction: column;
    max-width: 100ch;
    margin: 0 auto;
    line-height: 1.8;
}

.retry {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.visits-container {
    display: flex;
    gap: 1rem;
}

.interactive-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
</style>