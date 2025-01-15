<script lang="ts" setup>
import StatusIndicator from './StatusIndicator.vue';
import RequestSerialButton from './RequestSerialButton.vue';
import RetryButton from './RetryButton.vue';

import { onMounted, ref, useTemplateRef } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import { connectSerial, haveConversation, serialWorker, stopTask } from '@/serial';
import { portNeedsToBeRequested } from '@/state';

const showRetryButton = ref(false)

const statusIndicator = useTemplateRef("statusIndicator")

onMounted(() => {
    serialWorker.addEventListener("message", helpEventListener)
})

onBeforeRouteLeave(async (to, from) => {
    stopTask().catch(r => { })
    serialWorker.removeEventListener("message", helpEventListener)
})

function helpEventListener(e: MessageEvent) {
    const message = e.data as FromWorker
    switch (message.kind) {
        case "animate": {
            if (message.animation === "statusIndicator") {
                statusIndicator.value?.animateStatusIndicator()
            }
            break
        }
    }
}

function startConversation(message1Bitstring: string, message2Bitstring: string) {
    haveConversation(message1Bitstring, message2Bitstring, "initiate").catch(r => { showRetryButton.value = true })
}

function retry() {
    showRetryButton.value = false
    connectSerial()
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
                <li>If you see the "Connect" button above and/or below, press it. The button only appears if there's not
                    a device
                    already connected.</li>
                <li>Select the serial port/COM port corresponding to your device. If there's no button or nothing pops
                    up, you
                    have probably connected before and the device was saved.</li>
                <li>On your Tamagotchi, wait for a visit (heart menu -&gt; visit; the screen should say "Stand by")</li>
                <li>After connecting, there will be some buttons for different visiting animations below. Click one to
                    start a visit!</li>
                <li>Watch your Tamagotchi screen!</li>
            </ol>
        </div>
        <div v-if="portNeedsToBeRequested" class="request-serial-port-container">
            <RequestSerialButton></RequestSerialButton>
        </div>
        <div v-else class="interactive-container">
            <StatusIndicator ref="statusIndicator"></StatusIndicator>
            <RetryButton v-if="showRetryButton" @retry="retry">
            </RetryButton>
            <div v-else class="visits-container">
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
.request-serial-port-container {
    display: flex;
    justify-content: center;
}
</style>