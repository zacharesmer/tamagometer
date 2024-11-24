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
    <RouterLink class="navlink first-link" to="/conversation">Edit</RouterLink>
    <RouterLink class="navlink middle-link" to="/record">Record</RouterLink>
    <RouterLink class="navlink middle-link" to="/saved">View Saved</RouterLink>
    <div v-if="showSettings" class="settings-link settings-link-active" @click="() => { showSettings = !showSettings }"
      aria-expanded="true" aria-controls="settings-panel">Settings ▾
    </div>
    <div v-else class="settings-link" @click="() => { showSettings = !showSettings }" aria-expanded="false"
      aria-controls="settings-panel">Settings ▸</div>
  </nav>
  <Settings v-show="showSettings" id="settings-panel"></Settings>
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
  width: 10em;
  height: 4em;
  line-height: 4em;

  background-color: var(--light-green);
  border-style: none;
  border-radius: 0% 30% / 70%;

  border-color: var(--pink);

  color: inherit;
  text-decoration: none;
  font-weight: bold;
  text-align: center;

  margin: 5px;
}

.router-link-active {
  background-color: var(--pink);
  border-radius: 30%/70% 0%;
  /* border-radius: 0% 30% / 70%; */

}

.settings-link {
  width: 10em;
  height: 4em;
  line-height: 4em;
  margin-left: auto;
}

.settings-link-active {
  border-radius: 30%/70% 0%;
  /* border-radius: 0% 30% / 70%; */

}

.web-serial-compatibility-warning {
  background-color: var(--pink);
  padding: 10px;
  font-weight: bold
}
</style>
