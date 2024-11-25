<script lang="ts" setup>
import { selectedConversation, editingConversation, StoredConversation } from '@/conversation';
import { useRouter } from 'vue-router';
import { dbConnection } from '@/database';
import { onMounted } from 'vue';


defineProps(
    {
        conversations: { type: Array<StoredConversation>, required: true }
    }
)

const emit = defineEmits(['refreshDb'])

const router = useRouter()

function openForEditing(c: StoredConversation): void {
    console.log("opening " + c.name)
    selectedConversation.initFromStored(c)
    editingConversation.initFromStored(c)
    router.push("/conversation")
}

// Typescript doesn't like the autoincrementing ID key, but it's a number
// @ts-ignore
function deleteConversation(dbId) {
    if (typeof (dbId) === "number") {
        dbConnection.del(dbId)
        emit("refreshDb")
    }
}

onMounted(() => {
    emit("refreshDb")
})

</script>

<template>
    <table>
        <tbody>
            <tr>
                <th>Name</th>
                <th></th>
                <th>Date/Time</th>
                <th></th>
            </tr>
            <tr v-for="c in conversations">

                <td>
                    {{ c.name }}
                </td>
                <td>
                    <button class="round-button" @click="openForEditing(c)">
                        <svg class="round-button-icon" viewBox="0 0 80 80" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M38.4 20.7417H14C12.8954 20.7417 12 21.6371 12 22.7417V66.7417C12 67.8463 12.8954 68.7417 14 68.7417H58C59.1046 68.7417 60 67.8463 60 66.7417V42.342" />
                            <path
                                d="M68.0145 21.8972C68.7943 21.1174 68.7943 19.8532 68.0145 19.0734L62.3577 13.4166C61.5753 12.6342 60.3069 12.6342 59.5246 13.4166L30.6996 42.2416C28.1991 44.7421 26.5974 48.0005 26.1449 51.5077L25.7115 54.8664C25.6479 55.359 26.0674 55.7785 26.56 55.715L29.9187 55.2816C33.4259 54.829 36.6844 53.2273 39.1849 50.7268L68.0145 21.8972Z" />
                            <path d="M52.1455 20.8037L60.6261 29.2843" />
                        </svg>
                    </button>
                </td>
                <td>
                    {{ new Date(c.timestamp).toLocaleString() }}
                </td>
                <td>
                    <!-- @vue-ignore -->
                    <button class="round-button" @click="deleteConversation(c.id)">
                        <svg class="round-button-icon" viewBox="0 0 80 80" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M61 20L56.3735 64.4144C56.1612 66.4521 54.4437 68 52.395 68H27.605C25.5563 68 23.8388 66.4521 23.6265 64.4144L19 20" />
                            <path d="M65 20H15" />
                            <path d="M27.8555 19.9986L33.926 12.3865H46.0747L52.1452 19.9986" />
                        </svg>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
table {
    border-collapse: collapse;
}

th {
    border: solid thin;
    padding: 1em;
}

td {
    border: solid thin;
    padding: 1em;
}

tr:nth-child(even) {
    background-color: var(--light-green);
}

tr:nth-child(odd) {
    background-color: var(--light-blue);
}

tr:nth-child(1) {
    background-color: var(--light-gray);
}
</style>