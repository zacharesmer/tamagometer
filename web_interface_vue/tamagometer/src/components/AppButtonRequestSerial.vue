<script setup lang="ts">
import { portNeedsToBeRequested } from '@/state';
import { connectToPort } from '@/serialworkerinterface';


</script>

<template>
    <div v-if="portNeedsToBeRequested" class="request-port-container">
        <button class="icon-label-button"
            @click="connectToPort(true).then(success => portNeedsToBeRequested = !success)">
            <svg class="round-button-icon" transform="rotate(90)" viewBox="0 0 80 80" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M26 48L26 58C26 65.732 32.268 72 40 72C47.732 72 54 65.732 54 58V48" />
                <path d="M26 32L26 22C26 14.268 32.268 8 40 8C47.732 8 54 14.268 54 22V32" />
                <path d="M40 53L40 27" />
            </svg>
            <span>
                Click here to connect to a serial device
            </span>
        </button>
    </div>
</template>