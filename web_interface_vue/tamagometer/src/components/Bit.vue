<script lang="ts" setup>

import { computed } from 'vue'

</script>

<template>
    <div class="bit">    
        <slot></slot>
    </div>
</template>

<style>
.bit{
    display: inline;
    margin-top: 10px;
    }
</style>