// Global Constants
const sessionTokenKey = "GS_ASSIGNMENT_BOT_Session";
const sessionUserKey = "GS_ASSIGNMENT_USER_Session";
const FullScreenUIModelId = "GS_ASSIGNMENT_Model";
let userNames = [];

/**
 * 
 * @param {String} role - user | ai
 * @param {String} content 
 * 
 * @returns {String} message Id
 */
function injectMessage(role, content) {
    const elem = document.getElementById("messages");
    const m_id = genrateRandomToken()
    const message = document.createElement('div');
    message.classList.add("message", `${role}`, "w-full")
    //message.setAttribute("id", messageID.toString())
    // user
    const messageTemplate = `
        <div class="wrapper w-full flex ${role === "user" ? "pl-10" : "flex-row-reverse pr-10"} gap-1 items-end">
            <div class="content ${role === "user" ? "bg-primary/10" : "bg-primary/30"} py-3 px-3 hypen-auto rounded-xl w-full">
                <p id="${m_id}" class="text-sm">
                    ${content}
                </p>
            </div>
            <div class="avatar w-10">
                <div class="h-10 w-10 ${role === "user" ? "bg-primary/10" : "bg-primary/30"} rounded-full flex justify-center items-center text-xl font-bold">
                    ${role === "user" ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="8" r="5" /> <path d="M20 21a8 8 0 1 0-16 0" /> </svg> ' : ' <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 8V4H8" /> <rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /> <path d="M20 14h2" /> <path d="M15 13v2" /> <path d="M9 13v2" /> </svg> '}
                </div>
            </div>
        </div>`
    message.innerHTML = messageTemplate;
    elem.append(message);
    autoScrollToBottom(elem);
    return m_id;
}

/**
 * ### Update Message By Message Id
 * @param {String} messageID 
 * @param {String} content
 */
function injectMessageById(messageID, content) {
    const elem = document.getElementById("messages");
    const message = document.getElementById(messageID);
    message.innerHTML = content
    autoScrollToBottom(elem);
}

// Model operations
function injectFullScreenUiModel(mid, model, canCancel) {
    var elem = document.createElement('div');
    elem.id = FullScreenUIModelId.concat(mid);
    elem.classList.add('fsmodel');
    elem.innerHTML = model;
    document.getElementById('modelArea').appendChild(elem);
    document.getElementById('modelArea').style.display = "block";
    if (canCancel) {
        document.getElementById('modelArea').onkeydown = (key) => {
            if (key.keyCode === 27) {
                cancelFullScreenUIModel(mid)
            }
        }
    }
}

function createSessionModel() {
    sessionModelString = `<div class="w-full rounded-xl mt-16 flex justify-center">
    <div class="w-fit bg-slate-200 p-3 px-8 rounded-xl text-slate-500">
        <div class="text-2xl font-medium text-center">
            New Session
        </div>
        <div class="mt-8 text-sm text-slate-500">
            <div id="secretFrame" class="transition duration-300 ease-in-out">

            </div>
        </div>
    </div>
</div>`
    injectFullScreenUiModel("sessionModelBase", sessionModelString, false);
    injectSecretOptions();
}

function cancelFullScreenUIModel(mid) {
    if (!mid) {
        console.error("element not found.");
    } else {
        var elem = document.getElementById(FullScreenUIModelId.concat(mid));
        if (elem) {
            document.getElementById('modelArea').removeChild(elem);
            document.getElementById('modelArea').style.display = "none";
        } else {
            console.error("element not found .");
        }
    }
}

function cleanModelArea() {
    document.getElementById('modelArea').innerHTML = "";
    document.getElementById('modelArea').style.display = "none";
}

function showAlert(msg, type) {
    var elem = document.getElementById("alertbar");
    var message = document.getElementById("alerttxt");
    elem.style.opacity = 1;
    elem.style.transition = "all 0.4s ease-in-out";
    elem.style.height = "50px";
    message.innerHTML = msg;
    if (type === 'error') {
        elem.classList.add('alert')
    } else if (type === 'success') {
        elem.classList.add('success')
    } else if (type === 'warn') {
        elem.classList.add('warn')
    } else {
        // none
    }
    setTimeout(() => {
        slideUp();
    }, 3500);
}
// Model operations ends here 

// MODELS 
function confirmModel(mid, title, desc, icon, cancelBtn, proceedBtn) {
    let model = `
    <div class="relative px-4 min-h-screen md:flex md:items-center md:justify-center">
      <div class="bg-primary rounded-lg md:max-w-md md:w-80 md:mx-auto p-4 fixed inset-x-0 bottom-0 z-50 mb-4 mx-4 md:relative">
        <div class="md:flex md:justify-start justify-center">
          <div class="text-white rounded-full border border-gray-300 flex items-center justify-center w-12 h-12 flex-shrink-0">
            ${icon}
          </div>
          <div class="mt-4 md:mt-0 md:ml-4 text-center md:text-left">
            <p class="font-bold text-white">${title}</p>
            <p class="text-sm text-textcolor mt-1">${desc}
            </p>
          </div>
        </div>
        <div class="text-center md:text-right mt-6 md:flex md:justify-end">
          <button onClick="${proceedBtn.method}" class="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 ${proceedBtn.bgColor} ${proceedBtn.textColor} rounded-lg font-semibold text-sm md:ml-2 md:order-2">${proceedBtn.title}</button>
          <button onClick="cancelFullScreenUIModel('${mid}')" class="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-primary rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1">${cancelBtn}</button>
        </div>
      </div>
    </div>`;
    injectFullScreenUiModel(mid, model);
}

async function injectSessionModelToSecretFrame(havesecret) {
    const secret = await getSecret();
    const sessionModel = `<div class="text-base pl-3"> ${havesecret ? 'What\'s the secret:' : 'Here\'s the secret:'} </div>
    <div class="flex w-full max-w-3xl p-1 gap-1">
    <input
        class="${havesecret ? "py-2" : "p-1"} px-4 text-sm w-full border-2 border-slate-300 rounded-xl focus:outline-none focus:border-slate-400 text-slate-600 text-center"
        type="text" name="secretGenrator" id="secretGenratorInput" autocomplete="off" value="${havesecret ? "" : secret}" ${havesecret ? "" : "disabled"}>
    ${havesecret ? "" : '<button onclick="injectSecret()" class="border-2 border-slate-300 bg-slate-300 font-medium py-2 px-3 rounded-xl text-base capitalize disabled:bg-slate-50 flex justify-center items-center text-slate-600" id="genrateSecretBtn" title="Genrate"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg> </button>'}
    </div>
    <div class="w-full text-xs py-1 pl-3">
        <span>This secret will be used to store your chat.</span>
    </div>
    <div class="mt-6 flex flex-wrap justify-center gap-3 p-3">
        <button onclick="injectSecretOptions()"
            class="border-2 border-slate-300 hover:bg-slate-300 font-medium py-2 px-8 rounded-xl text-base capitalize disabled:bg-slate-50 flex justify-center items-center text-slate-600 bg-slate-200"
            type="submit" id="createSession" title="Genrate">
            Go Back
        </button>
        <button onclick="createSession()"
            class="border-2 border-slate-300 bg-slate-300 font-medium py-2 px-8 rounded-xl text-base capitalize disabled:bg-slate-50 flex justify-center items-center text-slate-600 hover:bg-slate-200"
            type="submit" id="createSession" title="Genrate">
            Continue
        </button>
    </div>`

    const frame = document.getElementById("secretFrame");
    frame.innerHTML = sessionModel;
}

function injectSecretOptions() {
    const secretOptionsModel = `
    <div class="text-base">
    Do you know the secret:
</div>
<div id="secretOptions" class="space-y-2 my-4">
    <div class="w-full">
        <button onclick="iKnowSecret()"
            class="w-full border-2 border-slate-300 hover:bg-slate-300 font-medium py-2 px-8 rounded-xl text-base capitalize disabled:bg-slate-50 flex justify-center items-center text-slate-600 bg-slate-200"
            type="submit" id="createSession" title="Genrate">
            I Know
        </button>
    </div>
    <div class="w-52 mt-4">
        <button onclick="iDonthaveOne()"
            class="w-full border-2 border-slate-300 bg-slate-300 font-medium py-2 px-4 rounded-xl text-base capitalize disabled:bg-slate-50 flex justify-center items-center text-slate-600 hover:bg-slate-100"
            type="submit" id="createSession" title="Genrate">
            I Don't have one.
        </button>
    </div>
</div>`;
    const frame = document.getElementById("secretFrame");
    frame.innerHTML = secretOptionsModel;
}
// Models ends here

// Helper functions
function genrateRandomToken() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4());
}

const autoScrollToBottom = (element) => {
    element.scrollTop = element.scrollHeight;
}

function formatTime(datetime) {
    let un = 'AM'
    let hours = datetime.getHours()
    let minutes = datetime.getMinutes()
    if (hours > 12) {
        un = 'PM';
        hours = 24 - hours;
    }
    minutes = (minutes < 10) ? '0' + minutes : minutes
    return hours + ":" + minutes + " " + un;
}

function slideUp() {
    var elem = document.getElementById("alertbar");
    elem.style.transition = "all 0.4s ease-in-out";
    elem.style.height = "0px";
    var message = document.getElementById("alerttxt");
    message.innerHTML = "";
    elem.style.opacity = 0;
    if (elem.classList.contains('alert')) {
        elem.classList.remove('alert')
    }
    if (elem.classList.contains('success')) {
        elem.classList.remove('success')
    }
    if (elem.classList.contains('warn')) {
        elem.classList.remove('warn')
    }
}

function isValidUsername(username) {
    const regex = /^[a-z0-9_]+$/;
    return regex.test(username);
}

// Session manager

function clearSessionStorage() {
    sessionStorage.clear()
}

function checkToken() {
    var authtoken = sessionStorage.getItem(sessionTokenKey)
    if (authtoken) {
        return authtoken;
    } else {
        return null;
    }
}

function saveSessionToken(token) {
    sessionStorage.setItem(sessionTokenKey, token);
}

function logout() {
    sessionStorage.removeItem(sessionTokenKey);
    window.location.reload();
}

function createSession() {
    const secret = document.getElementById("secretGenratorInput").value;
    // TODO : Inject loader
    if (secret.trim().length < 8) {
        showAlert("Secret is too short. (min. length : 8)", 'warn');
    } else if (!isValidUsername(secret)) {
        showAlert("In-Valid Secret : Secret can only be created using alpha-numeric digits, underscore '_' and no spaces.", 'error');
    } else {
        createNewSession("AUTO", secret);
    }
}

function sessionResponse(staus, token) {
    if (staus) {
        saveSessionToken(token)
        cleanModelArea()
        showAlert("Logged-in successfully.", 'success');
        loadOlderChat();
    } else {
        showAlert("error", "Unable to create a session.");
    }
    //TODO : destroy loader
}

// session manager ends here

async function getSecret() {
    return await fetchUsername()
}



/// Load chats after login
async function loadChatFromDb() {
    const res = await fetch(`/api/user/getChat`, {
        method: 'GET',
        headers: {
            'auth-token': checkToken()
        }
    });
    const result = await res.json()
    return result;
}

function processChats(chatArray) {
    if (chatArray.length === 0) return
    chatArray.map((message) => {
        injectMessage("user", message.user)
        injectMessage("ai", message.assistant)
    })
}

async function loadOlderChat() {
    const result = await loadChatFromDb()
    if (result.success) {
        processChats(result.data)
    } else {
        showAlert("Something went wrong during loading older chats", 'warn')
    }
}