<script lang="ts" setup>

const props = defineProps({
    value: { type: Number, required: true },
})

</script>

<template>
    <button v-if="value === 1" class="bit one">
        {{ value }}
    </button>
    <button v-else-if="value === 0" class="bit zero">
        {{ value }}
    </button>
    <button v-else class="bit invalid">
    </button>
</template>

<style>
.bit {
    display: inline;
    /* padding: 5px; */
    margin: 1px;

    height: 2em;
    width: 2em;

    border-width: 2px;
    border-style: solid;
    border-color: var(--dark-blue);
    border-radius: 50%;
}

.edited-bit {
    border-width: 2px;
    border-style: dotted;
}

.one {
    background-color: var(--light-blue);

}

.zero {
    background-color: var(--vanilla);
}
</style>