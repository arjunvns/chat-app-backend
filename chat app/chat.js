const socket = io();

let username = "";
let room = "";

function joinRoom(){

    const user = document.getElementById("username");
    const roomInput = document.getElementById("room");

    if(!user || !roomInput){
        alert("Input not found! Check IDs in HTML");
        return;
    }

    username = user.value.trim();
    room = roomInput.value.trim();

    if(username === "" || room === ""){
        alert("Please enter username and room");
        return;
    }

    console.log("Joining:", username, room);

    // ask server to join (auth handled there)
    socket.emit("joinRoom", { username, room });

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("chatBox").style.display = "block";
}


// ====================== SEND MESSAGE ======================

function sendMessage(){

    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;

    if(message === "") return;

    socket.emit("sendMessage",{
        username,
        room,
        text: message,
        time: new Date().toLocaleTimeString()
    });

    messageInput.value = "";
}


// ====================== RECEIVE MESSAGE ======================

socket.on("receiveMessage", data => {

    const msgDiv = document.createElement("div");

    msgDiv.innerHTML = `
        <b>${data.username}</b>: 
        <span>${data.text}</span>
        <small style="margin-left:5px;">${data.time}</small>
        <button onclick="editMsg(this)">✏</button>
        <button onclick="deleteMsg(this)">🗑</button>
    `;

    const messagesBox = document.getElementById("messages");
    messagesBox.appendChild(msgDiv);

    messagesBox.scrollTop = messagesBox.scrollHeight;
});


// ====================== EMOJI ======================

function addEmoji(emoji){
    document.getElementById("messageInput").value += emoji;
}


// ====================== ONLINE USERS ======================

socket.on("usersList", list => {
    document.getElementById("users").innerHTML =
        "Online: " + list.map(u => u.username).join(", ");
});


// ====================== DELETE ======================

function deleteMsg(btn){
    btn.parentElement.remove();
}


// ====================== EDIT ======================

function editMsg(btn){
    let span = btn.parentElement.querySelector("span");
    let newText = prompt("Edit message:", span.innerText);
    if(newText){
        span.innerText = newText;
    }
}


// ====================== TYPING INDICATOR ======================

document.getElementById("messageInput").addEventListener("input", ()=>{
    socket.emit("typing", { username, room });
});

socket.on("showTyping", name=>{
    const box = document.getElementById("typingStatus");

    box.innerText = name + " is typing...";

    clearTimeout(window.typingTimer);
    window.typingTimer = setTimeout(()=>{
        box.innerText = "";
    }, 800);
});


// ====================== LOGIN ERROR ======================

socket.on("loginError", msg=>{
    alert(msg);
});
function sendFile(){

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        socket.emit("sendFile",{
            username,
            room,
            fileName: file.name,
            fileType: file.type,
            fileData: reader.result
        });
    };

    reader.readAsDataURL(file);

    fileInput.value = "";
}


// Receive file
socket.on("receiveFile", data => {

    const msgDiv = document.createElement("div");

    // Image preview
    if(data.fileType.startsWith("image")){

        msgDiv.innerHTML = `
            <b>${data.username}</b><br>
            <img src="${data.fileData}" style="max-width:200px;border-radius:8px">
        `;

    } else {

        // Normal file download
        msgDiv.innerHTML = `
            <b>${data.username}</b><br>
            <a href="${data.fileData}" download="${data.fileName}">
                📥 Download ${data.fileName}
            </a>
        `;
    }

    document.getElementById("messages").appendChild(msgDiv);
});
