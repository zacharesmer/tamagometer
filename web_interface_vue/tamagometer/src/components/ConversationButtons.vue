<script lang="ts" setup>
const emit = defineEmits(["startConversation", "awaitConversation", "stopWaiting"])</script>

<template>
    <div class="buttons-container">
        <button class="icon-label-button" @click="emit('startConversation')">
            <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M41.789 14.3419C41.052 12.8678 38.9483 12.8678 38.2113 14.3419L13.4474 63.8698C12.7825 65.1996 13.7495 66.7642 15.2362 66.7642L33.9993 66.7642L39.9993 42.7642L45.9993 66.7642H64.7641C66.2508 66.7642 67.2178 65.1996 66.5529 63.8698L41.789 14.3419Z" />
            </svg>
            <span>Start interaction</span>
        </button>
        <button class="icon-label-button" @click="emit('awaitConversation')">
            <svg class="round-button-icon" transform="rotate(45)" viewBox="0 0 80 80" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M69.3061 52.8713C70.3585 50.4788 68.4458 48 65.8321 48H14.1681C11.5544 48 9.64171 50.4788 10.694 52.8713" />
                <path
                    d="M69.3062 52.8716C64.352 64.1353 53.0945 72.0002 40.0001 72.0002C26.9057 72.0002 15.6483 64.1353 10.6941 52.8716" />
                <path d="M40 40L40 48" />
                <path
                    d="M44 36C44 38.2091 42.2091 40 40 40C37.7909 40 36 38.2091 36 36C36 33.7909 37.7909 32 40 32C42.2091 32 44 33.7909 44 36Z" />
                <path
                    d="M24.4115 31C25.9913 28.2637 28.2636 25.9914 31 24.4115C33.7363 22.8317 36.8403 22 40 22C43.1596 22 46.2636 22.8317 49 24.4115C51.7363 25.9914 54.0086 28.2637 55.5884 31" />
                <path
                    d="M12.2872 23.75C15.0958 18.9614 19.1354 14.9849 24 12.2202C28.8647 9.4555 34.3829 8 40 8C45.6172 8 51.1354 9.4555 56 12.2202C60.8647 14.9849 64.9043 18.9614 67.7129 23.75" />
            </svg>
            <span>Wait for interaction</span>
        </button>
        <button class="icon-label-button" @click="emit('stopWaiting')">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M16 18C16 16.8954 16.8954 16 18 16H62C63.1046 16 64 16.8954 64 18V62C64 63.1046 63.1046 64 62 64H18C16.8954 64 16 63.1046 16 62V18Z" />
            </svg>
            <span>Stop waiting</span>
        </button>
    </div>
</template>

<style scoped>
.buttons-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    width: fit-content;
}
</style>