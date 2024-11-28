<script lang="ts" setup>


const props = defineProps({
    value: { type: Number, required: true },
    changed: { type: Boolean, required: true }
})

</script>

<template>
    <button :class="['round-button', 'bit', (value === 0? 'zero' : 'one'), changed ? 'changed' : '']">
        {{ value }}
    </button>
</template>

<style>
.bit {
    height: 2rem;
    width: 2rem;
    line-height: 2rem;
}

.one {
    background-color: var(--pink);

}

.zero {
    background-color: var(--vanilla);
}
</style>