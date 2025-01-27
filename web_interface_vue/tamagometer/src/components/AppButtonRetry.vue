<script setup lang="ts">

const emit = defineEmits([
    "retry"
])

const props = defineProps(
    // default is row, like flex box
    { direction: { type: String, required: false } }
)

function reloadPage() {
    window.location.reload()
}
</script>

<template>
    <div :class="{ 'retry': true, 'retry-column': props.direction == 'column' }">
        <p>Could not connect to serial.</p>
        <button @click="emit('retry')" class="icon-label-button">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M36.584 14.2891C34.1761 14.5544 31.7967 15.1589 29.5185 16.1025C23.1799 18.7281 18.144 23.764 15.5184 30.1025C12.8929 36.4411 12.8929 43.563 15.5184 49.9015C16.9662 53.3967 19.1468 56.4958 21.8746 59.013" />
                <path
                    d="M42.418 65.7113C44.8258 65.446 47.2053 64.8415 49.4835 63.8978C55.822 61.2723 60.858 56.2363 63.4835 49.8978C66.109 43.5593 66.109 36.4373 63.4835 30.0988C62.0358 26.6037 59.8551 23.5046 57.1273 20.9873" />
                <path
                    d="M36.584 23.4037V6.5961C36.584 4.89999 38.6347 4.05057 39.834 5.24991L47.4627 12.8786C48.6342 14.0502 48.6342 15.9497 47.4627 17.1212L39.834 24.7499C38.6347 25.9492 36.584 25.0998 36.584 23.4037Z" />
                <path
                    d="M42.418 56.5961V73.4037C42.418 75.0998 40.3673 75.9492 39.168 74.7499L31.5393 67.1212C30.3678 65.9497 30.3678 64.0502 31.5393 62.8786L39.168 55.2499C40.3673 54.0506 42.418 54.9 42.418 56.5961Z" />
            </svg>
            <span>Retry</span>
        </button>
        <p>Or if that doesn't work</p>
        <button @click="reloadPage" class="icon-label-button">
            <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M36.9629 14.3008C34.5917 14.5721 32.2491 15.1726 30.0048 16.1022C23.6662 18.7277 18.6303 23.7637 16.0048 30.1022C13.3793 36.4407 13.3793 43.5626 16.0048 49.9012C18.6303 56.2397 23.6662 61.2757 30.0048 63.9012C36.3433 66.5267 43.4652 66.5267 49.8038 63.9012C56.1423 61.2757 61.1783 56.2397 63.8038 49.9012L64.1755 49.0037C64.3357 48.6171 64.4851 48.2273 64.6237 47.8347" />
                <path
                    d="M36.98 14.2984C37.01 14.2949 37.0401 14.2916 37.0702 14.2883M37.0703 6.5961V23.4037C37.0703 25.0998 39.1209 25.9492 40.3202 24.7499L47.9489 17.1212C49.1205 15.9497 49.1205 14.0502 47.9489 12.8786L40.3203 5.24991C39.1209 4.05057 37.0703 4.89999 37.0703 6.5961Z" />
            </svg>
            <span>Refresh the page</span>
        </button>
    </div>
</template>

<style scoped lang="css">
.retry {
    display: flex;
    gap: 1rem;
}

.retry-column {
    flex-direction: column;
    align-items: center;
}
</style>