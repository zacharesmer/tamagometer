<script lang="ts" setup>


const props = defineProps({
    value: { type: Number, required: true },
    changed: { type: Boolean, required: true }
})

</script>

<template>
    <button :class="['bit', (value === 0? 'zero' : 'one'), changed ? 'changed' : '']">
        {{ value }}
    </button>
</template>

<style>
.bit {
    display: inline;
    /* padding: 5px; */
    margin: 1px;

    height: 2rem;
    width: 2rem;

    border-width: medium;
    border-style: solid;
    border-color: var(--dark-blue);
    border-radius: 50%;
}

.changed {
    /* border-width: 2px; */
    border-style: dashed;
}

.one {
    background-color: var(--pink);

}

.zero {
    background-color: var(--vanilla);
}
</style>