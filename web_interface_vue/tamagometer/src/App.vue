<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SettingsMenu from './components/SettingsMenu.vue';
import { makeSerialWorker, connectToPort } from './serialworkerinterface';
import AppButtonRequestSerial from './components/AppButtonRequestSerial.vue';
import { portNeedsToBeRequested } from './state';

const webSerialSupported = ref("serial" in navigator)

onMounted(async () => {
    makeSerialWorker()
    // In the case where a port is already available, go ahead and connect to it without requesting a new port
    connectToPort(false).then(success => portNeedsToBeRequested.value = !success)
})

</script>

<template>
    <div id="body-container">
        <div v-if="!webSerialSupported" class="web-serial-compatibility-warning">
            <p>Web serial API is not supported in your browser.</p>
            <p>You will not be able to connect to a device to send or receive infrared signals.
            </p>
            <p> <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility">
                    Find a compatible browser in the Mozilla developer docs</a></p>
        </div>
        <div class="top-bar">
            <nav>
                <RouterLink class="navlink first-link" to="/conversation/">Edit</RouterLink>
                <div class="dropdown">
                    <RouterLink class="dropdown navlink middle-link" to="/record">Record</RouterLink>
                    <ul class="dropdown-content">
                        <li>
                            <RouterLink class="navlink middle-link" to="/record/bootstrap">One Tamagotchi</RouterLink>
                        </li>
                        <li>
                            <RouterLink class="navlink middle-link" to="/record/snoop">Two Tamagotchis</RouterLink>
                        </li>
                    </ul>
                </div>
                <RouterLink class="navlink middle-link" to="/saved">View Saved</RouterLink>
                <RouterLink class="navlink middle-link" to="/help">Help</RouterLink>
            </nav>
            <details>
                <summary>
                    <span>Settings</span>
                    <svg class="round-button-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M45.9794 12.754C41.76 11.7491 37.3586 11.7487 33.139 12.7527L32.5499 20.1481C31.3889 20.564 30.2562 21.0866 29.1664 21.7158C28.0766 22.345 27.0577 23.0646 26.117 23.8621L19.4177 20.6745C16.4383 23.8267 14.2379 27.6385 12.9983 31.7951L19.108 36.0027C18.8878 37.2158 18.7741 38.4577 18.7741 39.7158C18.7741 40.9743 18.8879 42.2167 19.1082 43.4302L13.0001 47.6367C14.2407 51.7931 16.4421 55.6047 19.4225 58.7563L26.1181 55.5704C27.0585 56.3676 28.077 57.0869 29.1664 57.7158C30.2562 58.345 31.3888 58.8676 32.5498 59.2835L33.1384 66.6728C37.3584 67.677 41.7602 67.6766 45.98 66.6715L46.5686 59.2832C47.7292 58.8673 48.8615 58.3448 49.951 57.7158C51.0405 57.0868 52.0591 56.3674 52.9996 55.5702L59.6922 58.7546C62.6725 55.6025 64.8737 51.7906 66.1139 47.6338L60.0093 43.4297C60.2296 42.2163 60.3433 40.9742 60.3433 39.7158C60.3433 38.4579 60.2296 37.2162 60.0095 36.0032L66.1157 31.798C64.8765 27.6411 62.6763 23.8288 59.697 20.6762L53.0007 23.8624C52.0599 23.0648 51.0409 22.3451 49.951 21.7158C48.8615 21.0868 47.7291 20.5643 46.5685 20.1484L45.9794 12.754Z" />
                        <path
                            d="M34.3622 30.7155C37.5776 28.8591 41.5391 28.8591 44.7545 30.7155C47.9699 32.572 49.9506 36.0027 49.9506 39.7155C49.9506 43.4284 47.9699 46.8591 44.7545 48.7155C41.5391 50.572 37.5776 50.572 34.3622 48.7155C31.1468 46.8591 29.166 43.4284 29.166 39.7155C29.166 36.0027 31.1468 32.572 34.3622 30.7155Z" />
                    </svg>
                </summary>
                <SettingsMenu id="settings-panel"></SettingsMenu>
            </details>
        </div>
        <main>
            <AppButtonRequestSerial></AppButtonRequestSerial>
            <RouterView />
        </main>
        <footer>
            <p>This site is hosted using GitHub Pages. <a href="https://github.com/zacharesmer/tamagometer">View the
                    source
                    code</a></p>
            <p>Tamagotchi sprites are from the <a href="https://tamagotchi.fandom.com/">Tamagotchi Wiki</a>. Icons are
                from <a href="https://glyphs.fyi/">Glyphs.fyi</a></p>
        </footer>
    </div>
</template>

<style scoped>
#body-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    max-width: 180ch;
    margin-left: auto;
    margin-right: auto;

    min-height: 95vh;
}

footer {
    margin-top: auto;
    border-top: solid;
    border-width: thin;
}

/* The nav bar and the settings menu */
.top-bar {
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
}

nav {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.navlink {
    width: 10rem;
    height: 4rem;
    line-height: 4rem;
    display: block;

    background-color: var(--vanilla);
    border-style: solid;
    border-color: var(--dark-blue);
    border-width: thin;
    border-radius: 0% 30% / 70%;

    color: inherit;
    text-decoration: none;
    font-weight: bold;
    text-align: center;
}

.navlink:hover {
    border-radius: 30%/70% 0%;
    transition: .1s;
}

.router-link-active {
    background-color: var(--pink);
    border-radius: 30%/70% 0%;
    /* border-radius: 0% 30% / 70%; */
}

.dropdown {
    position: relative;
    z-index: 3;
}

.dropdown-content {
    transition: height .2s ease;
    list-style: none;
    /* display: none; */
    opacity: 0;
    visibility: hidden;
    height: 0;
    text-wrap: nowrap;
    padding: 0;
    margin: 0;
}

.dropdown:hover .dropdown-content,
.dropdown:focus-within .dropdown-content {
    /* display: block; */
    height: 10rem;
    opacity: 1;
    visibility: visible;
}

.dropdown-content>li:nth-child(1) {
    transform: translate(0px, -4rem);
    transition: all .2s ease;
    z-index: 2;
    position: relative;
}

.dropdown:hover .dropdown-content>li:nth-child(1),
.dropdown:focus-within .dropdown-content>li:nth-child(1) {
    transform: translate(0, 0);
}

.dropdown-content>li:nth-child(2) {
    transform: translate(0px, -8rem);
    transition: all .2s ease;
    z-index: 1;
    position: relative;
}

.dropdown:hover .dropdown-content>li:nth-child(2),
.dropdown:focus-within .dropdown-content>li:nth-child(2) {
    transform: translate(0, 0);
}

/* For the settings disclosure menu */
details {
    flex-grow: .5;
    padding: 1rem;
}

details>summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;

    /* turn off the little triangle */
    list-style: none;

}

/* turn off the little triangle but in webkit */
details>summary::-webkit-details-marker {
    display: none;
}

@keyframes spin-settings {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

details>summary>svg,
details>summary>span {
    cursor: pointer;
}

details>summary>svg:hover {
    animation: spin-settings .5s;
}

/* The reason this is not `details > summary:hover > svg` is that the summary is invisibly very 
wide so it was spinning when hovering over blank space*/
details>summary>span:hover~svg {
    animation: spin-settings .5s;
}

.web-serial-compatibility-warning {
    background-color: var(--pink);
    padding: 10px;
    font-weight: bold
}

.request-port-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 2rem;
}
</style>
