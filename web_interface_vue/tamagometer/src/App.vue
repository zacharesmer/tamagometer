<script setup lang="ts">
// import BitstringInput from './components/BitstringInput.vue';
import { ref } from 'vue'
import Settings from './components/Settings.vue';

let showSettings = ref(false)
let webSerialSupported = ("serial" in navigator)

</script>

<template>
  <div v-if="!webSerialSupported" class="web-serial-compatibility-warning">
    <p>Web serial API is not supported in your browser.</p>
    <p>You will not be able to connect to a device to send or receive infrared signals.
    </p>
    <p> <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility">
        Find a compatible browser in the Mozilla developer docs</a></p>
  </div>
  <nav>
    <RouterLink class="navlink" to="/conversation">Conversation</RouterLink>
    <RouterLink class="navlink" to="/record">Record</RouterLink>
    <RouterLink class="navlink" to="/saved">View Saved</RouterLink>
    <div v-if="showSettings" class="settings-link" @click="() => { showSettings = !showSettings }">Settings ▾</div>
    <div v-else class="settings-link" @click="() => { showSettings = !showSettings }">Settings ▸</div>
  </nav>
  <Settings v-show="showSettings"></Settings>
  <main>
    <RouterView />
  </main>
</template>

<style>
.hidden {
  display: none;
}

#body-container {
  max-width: 180ch;
}

#connect-button {
  font-size: xx-large;
}

nav {
  display: flex;
  flex-direction: row;
}

.navlink {
  padding: 10px;
  margin: 5px;
  background-color: papayawhip;
  border: solid;

  color: inherit;
  text-decoration: none;
}

.router-link-active {
  background-color: lightblue;
}

.settings-link {
  padding: 10px;
  margin: 5px;
  background-color: papayawhip;
  border: solid;
}

.settings-link-active {
  background-color: lightblue;
}

.web-serial-compatibility-warning {
  background-color: lightpink;
  padding: 10px;
}
</style>
