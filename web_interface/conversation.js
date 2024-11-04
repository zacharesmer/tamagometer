import { sendCommand, readOneCommandCancellable, stopListening } from "./serial.js";

let savedMessage1, savedMessage2, savedMessage3, savedMessage4;

document.getElementById("save-message-bitstrings").addEventListener("click", loadMessages);

async function loadMessages() {
    // TODO: literally any validation whatsoever
    // this is all front end baybeeee! I don't have a server to care about.
    // putting incorrect values in here is only potentially hurting your pico
    savedMessage1 = document.getElementById("message1").value;
    savedMessage2 = document.getElementById("message2").value;
    savedMessage3 = document.getElementById("message3").value;
    savedMessage4 = document.getElementById("message4").value;
    console.log("Saved messages");
    // console.log(`Saved message 1: ${savedMessage1} and message 2: ${savedMessage2}`);
}

document.getElementById("initiate-visit").addEventListener("click", async () => {
    const errorLog = document.getElementById("visit-error");
    const output = document.getElementById("visit-output");
    try {
        console.log(`Sending ${savedMessage1}`)
        // Send message 1
        sendCommand(savedMessage1);
        // listen for a response
        let response1 = await readOneCommand();
        output.innerText += response1.join("") + "\n"
        console.log(`received ${response1}`)
        // send message 2
        console.log(`Sending ${savedMessage3}`)
        sendCommand(savedMessage3);
        // listen for a response
        let response2 = await readOneCommand();
        output.innerText += response1.join("") + "\n"
        console.log(`received ${response2}`)
    } catch (error) {
        errorLog.innerText = error;
    }
});

document.getElementById("wait-for-visit").addEventListener("click", async () => {
    const errorLog = document.getElementById("visit-error");
    const output = document.getElementById("visit-output");
    try {
        // listen 
        let response1 = await readOneCommand();
        output.innerText += response1 + "\n"
        console.log(`received ${response1}`)
        // Send message 1
        console.log(`Sending ${savedMessage2}`)
        sendCommand(savedMessage2);
        // listen for a response
        let response2 = await readOneCommand();
        output.innerText += response1 + "\n"
        console.log(`received ${response2}`)
        // send message 2
        console.log(`Sending ${savedMessage4}`)
        sendCommand(savedMessage4);

    } catch {
        errorLog.innerText = error;
    }
});

document.getElementById("snoop").addEventListener("click", async () => {
    console.log("Snooping");
    for (let i = 0; i < 4; i++) {
        let message = await readOneCommand();
        document.getElementById("snoop-output").innerText += message.join("") + "\n";
    }
});