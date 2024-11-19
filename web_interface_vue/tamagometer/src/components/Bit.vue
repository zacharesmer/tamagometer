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
    padding: 5px;
    margin: 1px;
    border: solid;
}

.one {
    background-color: lightblue;

}

.zero {
    background-color: papayawhip;
}
</style>