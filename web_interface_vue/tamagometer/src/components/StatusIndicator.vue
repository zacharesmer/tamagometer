<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const statusCenterHidden = ref(true)
const statusInnerWaveHidden = ref(true)
const statusOuterWaveHidden = ref(true)

defineExpose(
    { animateStatusIndicator }
)

// Animate showing the status indicator, then hide it again
// This animation is meant to have a period of about 1 second
function animateStatusIndicator() {
    statusCenterHidden.value = false
    setTimeout(() => { statusInnerWaveHidden.value = false }, 100)
    setTimeout(() => { statusInnerWaveHidden.value = false }, 200)
    setTimeout(() => { statusOuterWaveHidden.value = false }, 300)
    setTimeout(() => { statusOuterWaveHidden.value = true }, 400)
    setTimeout(() => { statusInnerWaveHidden.value = true }, 500)
    setTimeout(() => { statusInnerWaveHidden.value = true }, 600)
    setTimeout(() => { statusCenterHidden.value = true }, 700)
}

</script>

<template>
    <svg class="round-button-icon recording-status" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path :class="{ hidden: statusCenterHidden }"
            d="M48 40C48 44.4183 44.4183 48 40 48C35.5817 48 32 44.4183 32 40C32 35.5817 35.5817 32 40 32C44.4183 32 48 35.5817 48 40Z" />
        <path :class="{ hidden: statusOuterWaveHidden }"
            d="M17.3726 62.6274C14.4011 59.6559 12.044 56.1283 10.4359 52.2458C8.8277 48.3634 8 44.2023 8 40C8 35.7977 8.82771 31.6365 10.4359 27.7541C12.044 23.8717 14.4011 20.344 17.3726 17.3726" />
        <path :class="{ hidden: statusOuterWaveHidden }"
            d="M62.6275 62.6274C65.5989 59.6559 67.956 56.1283 69.5642 52.2458C71.1723 48.3634 72 44.2023 72 40C72 35.7977 71.1723 31.6365 69.5642 27.7541C67.956 23.8717 65.5989 20.344 62.6274 17.3726" />
        <path :class="{ hidden: statusInnerWaveHidden }"
            d="M25.8579 54.1422C24.0007 52.285 22.5275 50.0802 21.5224 47.6537C20.5173 45.2272 20 42.6265 20 40C20 37.3736 20.5173 34.7729 21.5224 32.3464C22.5275 29.9199 24.0007 27.7151 25.8579 25.8579" />
        <path :class="{ hidden: statusInnerWaveHidden }"
            d="M54.1421 54.1422C55.9993 52.285 57.4725 50.0802 58.4776 47.6537C59.4826 45.2272 60 42.6265 60 40C60 37.3736 59.4826 34.7729 58.4775 32.3464C57.4725 29.9199 55.9993 27.7151 54.1421 25.8579" />
    </svg>
</template>

<style scoped>
.recording-status {
    /* background-color: red; */
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    transition: opacity .5s;
    opacity: 50;
}

.hidden {
    display: none;
}
</style>