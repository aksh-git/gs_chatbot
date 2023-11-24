const socket = io();

function displayMessage(role, message) {
    return injectMessage(role, message);
}

const messageInput = document.getElementById("messageInput")

let messageID;

// Message Form handler
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = messageInput.value;
    // validations
    if (message.trim().length <= 2) {
        return messageInput.focus();
    }
    if (message.length >= 200) {
        return showAlert("Message is too long.",'warn')
    }

    displayMessage("user", message); // Display user's message in the chat

    messageInput.value = "";

    messageID = displayMessage("ai", "Thinking...") // saving message id for later updates
    let token = checkToken();

    socket.emit("sendMessage", { message, token }, (error) => {
        if (error) {
            console.error(error)
            injectMessageById(messageID, "Something went wrong. please try again later.")
        }
        messageInput.value = "";
        messageInput.focus();
    });
});

async function fetchUsername() {
    try {
        const response = await fetch('api/user/randomUser', {
            method: 'GET'
        });
        const result = await response.json();
        if (result.success) {
            return result.username;
        } else {
            showAlert(result.error, 'error')
            return false;
        }
    } catch (error) {
        showAlert("Something went wrong.", 'error')
        return false;
    }
}


function createNewSession(alias, secret) {
    socket.emit('createSession', { alias, secret }, (error) => {
        if (error) {
            console.error(error);
            sessionResponse(false, {})
        }
    })
}

socket.on("response", (response) => {
    injectMessageById(messageID, response.message.content)
});

socket.on("sessionResponse", (response) => {
    const token = response.token;
    sessionResponse(true, token);
})