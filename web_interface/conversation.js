import { TamaMessage } from "./model.js";
import { sendCommand, readOneCommandCancellable, stopListening, sendCommandUntilResponse, readOneCommand, sendCommandNTimes } from "./serial.js";

let savedMessages = [];

document.getElementById("save-message-bitstrings").addEventListener("click", () => {
    saveMessages();
});

async function saveMessages() {
    // TODO: literally any validation whatsoever
    // this is all front end baybeeee! The real "serverless" app
    // putting incorrect values in here is only potentially hurting your pico
    for (let i = 1; i <= 4; i++) {
        let message = document.getElementById(`message${i}`).value;
        savedMessages.push(message);
        console.log(new TamaMessage(message));
        // console.log(new TamaMessage(message).getBitstring());
        // keep the values even if the page reloads
        localStorage.setItem(`savedMessage${i}`, message);
    }
    console.log("Saved messages");
}

window.onload = (e) => {
    recoverMessages();
};

// Initialize the saved messages array to have either the message or null 
// (so indexing into it will work)
async function recoverMessages(params) {
    for (let i = 1; i <= 4; i++) {
        let message = localStorage.getItem(`savedMessage${i}`);
        if (message != null) {
            document.getElementById(`message${i}`).value = message;
            savedMessages.push(message)
            //TODO probably also display the messages
        } else {
            savedMessages.push(null)
        }
    }
}


document.getElementById("initiate-visit").addEventListener("click", async () => {
    const errorLog = document.getElementById("visit-error");
    const output = document.getElementById("visit-output");
    try {
        let response1 = await sendCommandUntilResponse(savedMessages[0], 3);
        if (response1 === null) {
            errorLog.innerText = "Response 1 not received"
            return;
        }
        output.innerText += response1.join("") + "\n"
        console.log(`received ${response1}`)
        // send message 2
        let response2 = await sendCommandUntilResponse(savedMessages[2], 3);
        if (response2 === null) {
            errorLog.innerText = "Response 2 not received"
            return;
        }
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
        // wait for a first message or until it's cancelled
        let message1 = await readOneCommandCancellable();
        if (message1 === null) {
            errorLog.innerText = "Cancelled"
            return;
        }
        console.log(`Received ${message1}`);
        output.innerText += message1.join("") + "\n"
        // send the response and await a second message, repeat up to 3 times if necessary
        await sendCommand(savedMessages[1]);
        let message2 = await readOneCommandCancellable(3);
        if (message2 === null) {
            errorLog.innerText = "Message 2 not received"
            return;
        }
        console.log(`received ${message2}`);
        output.innerText += message2.join("") + "\n";
        // send the final message 2 times just in case. The repeat is probably not 
        // necessary but my transmitter is a little wonky
        await sendCommandNTimes(savedMessages[3], 2);

    } catch (error) {
        errorLog.innerText = error;
    }
});

document.getElementById("snoop").addEventListener("click", async () => {
    await snoop();
});

let cancelSnoop = false;

function stopSnooping() {
    cancelSnoop = true;
    stopListening();
}

document.getElementById("cancel-snoop").addEventListener("click", () => {
    stopSnooping();
});

async function snoop() {
    console.log("Snooping");
    cancelSnoop = false;
    // wait for 4 messages, or for cancelSnoop to be set
    for (let i = 0; i < 4; i++) {
        if (cancelSnoop) {
            break;
        }
        let message = await readOneCommandCancellable();
        if (message != null) {
            document.getElementById("snoop-output").innerText += message.join("") + "\n";
        }
    }
    cancelSnoop = false;
}