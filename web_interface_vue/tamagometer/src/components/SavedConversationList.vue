<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { StoredConversation } from '@/conversation';
import { dbConnection } from '@/database';
import { starterPack } from '@/starterpack';

const emit = defineEmits(['refreshDb'])

const router = useRouter()

defineProps(
    {
        conversations: { type: Array<StoredConversation>, required: true }
    }
)

onMounted(() => {
    emit("refreshDb")
})

function openForEditing(c: StoredConversation): void {
    // @ts-ignore
    console.log("opening " + c.id)
    // @ts-ignore
    router.push({ path: "conversation", query: { dbid: c.id } })
}

// Typescript doesn't like the autoincrementing ID key, but it's a number
// @ts-ignore
function deleteConversation(dbId) {
    if (typeof (dbId) === "number") {
        dbConnection.del(dbId)
        emit("refreshDb")
    }
}

function importStarterPack() {
    let dbPromises = []
    for (let i = 0; i < starterPack.length; i++) {
        dbPromises.push(dbConnection.set(starterPack[i]))
    }
    Promise.all(dbPromises).then(r => emit("refreshDb"))
}

</script>

<template>
    <div class="component-container">
        <h2>Saved Conversations</h2>
        <div class="table-container">
            <table v-if="conversations.length !== 0">
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
            <div v-else>
                <p>No conversations saved yet.</p>
                <button @click="importStarterPack" class="icon-label-button">
                    <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 35H62V63H18V35Z" />
                        <path d="M18 49H62" />
                        <path d="M40 63V35" />
                        <path
                            d="M24.8564 26.2584C27.0983 22.2231 32.9017 22.2231 35.1435 26.2584L39.8168 34.6702C39.899 34.8182 39.792 35 39.6227 35H30C25.5135 35 22.6776 30.1803 24.8564 26.2584Z" />
                        <path
                            d="M55.1436 26.2584C52.9017 22.2231 47.0983 22.2231 44.8565 26.2584L40.1832 34.6702C40.101 34.8182 40.208 35 40.3773 35H50C54.4865 35 57.3224 30.1803 55.1436 26.2584Z" />
                    </svg>
                    <span>Get started with some examples</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    text-align: center;
}

th {
    position: sticky;
    top: 0;
}

.table-container {
    max-height: 70vh;
    overflow-y: auto;
}
</style>