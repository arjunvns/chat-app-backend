const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow frontend from anywhere (Netlify later)
        methods: ["GET", "POST"]
    }
});

// ================== BASIC ROUTE ==================

app.get("/", (req, res) => {
    res.send("✅ Chat backend is running");
});

// ================== DATA ==================

let users = [];          // connected users
let activeUsers = [];   // usernames in use
let chatHistory = [];   // stored messages

// ================== SOCKET.IO ==================

io.on("connection", socket => {
    console.log("User connected:", socket.id);

    // -------- Typing indicator --------
    socket.on("typing", data => {
        socket.to(data.room).emit("showTyping", data.username);
    });

    // -------- File sharing --------
    socket.on("sendFile", data => {
        io.to(data.room).emit("receiveFile", data);
    });

    // -------- Join Room --------
    socket.on("joinRoom", ({ username, room }) => {

        if (activeUsers.includes(username)) {
            socket.emit("loginError", "Username already in use");
            return;
        }

        activeUsers.push(username);
        socket.join(room);

        users.push({ id: socket.id, username, room });

        // Send previous messages
        chatHistory.forEach(msg => {
            if (msg.room === room) {
                socket.emit("receiveMessage", msg);
            }
        });

        // Update users list
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

        if (user) {
            activeUsers = activeUsers.filter(u => u !== user.username);
            users = users.filter(u => u.id !== socket.id);

            const roomUsers = users.filter(u => u.room === user.room);
            io.to(user.room).emit("usersList", roomUsers);

            io.to(user.room).emit("receiveMessage", {
                username: "System",
                text: `${user.username} left the chat`,
                time: new Date().toLocaleTimeString()
            });
        }
    });
});

// ================== SERVER START ==================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
