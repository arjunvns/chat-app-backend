const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend files
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "chat.html"));
});

// ================== DATA ==================

let users = [];          // connected users (socket based)
let activeUsers = [];   // usernames in use
let chatHistory = [];   // saved messages

// ================== SOCKET ==================

io.on("connection", socket => {

    // -------- Typing indicator --------
    socket.on("typing", data => {
        socket.to(data.room).emit("showTyping", data.username);
    });
    socket.on("sendFile", data => {
    io.to(data.room).emit("receiveFile", data);
});


    // -------- Join Room --------
    socket.on("joinRoom", ({ username, room }) => {

        // simple username protection
        if(activeUsers.includes(username)){
            socket.emit("loginError", "Username already in use");
            return;
        }

        activeUsers.push(username);

        socket.join(room);

        users.push({ id: socket.id, username, room });

        // Send old messages
        chatHistory.forEach(msg => {
            if(msg.room === room){
                socket.emit("receiveMessage", msg);
            }
        });

        // Update online users list
        const roomUsers = users.filter(u => u.room === room);
        io.to(room).emit("usersList", roomUsers);

        // Notify join
        socket.to(room).emit("receiveMessage", {
            username: "System",
            text: `${username} joined the chat`,
            time: new Date().toLocaleTimeString()
        });
    });


    // -------- Send Message --------
    socket.on("sendMessage", data => {

        chatHistory.push(data);

        io.to(data.room).emit("receiveMessage", data);
    });


    // -------- Disconnect --------
    socket.on("disconnect", () => {

        const user = users.find(u => u.id === socket.id);

        if(user){

            // remove username from active list
            activeUsers = activeUsers.filter(u => u !== user.username);

            // remove from users array
            users = users.filter(u => u.id !== socket.id);

            // update users list
            const roomUsers = users.filter(u => u.room === user.room);
            io.to(user.room).emit("usersList", roomUsers);

            // notify leave
            io.to(user.room).emit("receiveMessage", {
                username: "System",
                text: `${user.username} left the chat`,
                time: new Date().toLocaleTimeString()
            });
        }
    });

});

// ================== SERVER ==================

server.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
