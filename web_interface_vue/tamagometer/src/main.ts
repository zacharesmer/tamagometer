import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory, createRouter } from 'vue-router'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import Conversation from './components/Conversation.vue'
import Settings from './components/Settings.vue'
import Snoop from './components/Snoop.vue'
import Saved from './components/Saved.vue'
import Help from './components/Help.vue'

const routes = [
    // { path: '/', component: TBD},
    { path: '/conversation', component: Conversation },
    { path: '/settings', component: Settings },
    { path: '/record', component: Snoop },
    { path: '/saved', component: Saved },
    { path: '/help', component: Help }
]

const router = createRouter({
    history: createWebHistory('/tamagometer/'),
    routes,
})

createApp(App).use(router).use(
    Vue3Toastify, {
        autoClose: 3000,
        icon: false,
        closeButton: false,
    } as ToastContainerOptions
).mount('#app')
