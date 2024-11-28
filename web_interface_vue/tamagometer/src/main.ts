import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import Conversation from './components/Conversation.vue'
import Settings from './components/Settings.vue'
import Snoop from './components/Snoop.vue'
import Saved from './components/Saved.vue'

const routes = [
    // { path: '/', component: TBD},
    { path: '/conversation/:dbId?', component: Conversation },
    { path: '/settings', component: Settings },
    { path: '/record', component: Snoop },
    { path: '/saved', component: Saved }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
