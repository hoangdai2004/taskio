import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";

const port = process.env.PORT || 5001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token) {
      const cookieHeader = socket.handshake.headers?.cookie;
      if (cookieHeader) {
        const tokenCookie = cookieHeader
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("token="));
        if (tokenCookie) {
          token = tokenCookie.split("=")[1];
        }
      }
    }

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.user.userId;
  console.log(`User ${userId} connected: ${socket.id}`);
  socket.join(`user_${userId}`);

  const currentCount = onlineUsers.get(userId) || 0;
  onlineUsers.set(userId, currentCount + 1);
  if (currentCount === 0) {
    io.emit("user_status", { userId, online: true });
  }

  socket.emit("online_users", Array.from(onlineUsers.keys()));

  socket.on("join_channel", (channelId) => {
    const id = Number(channelId);
    if (!id || isNaN(id)) return;
    socket.join(`channel_${id}`);
    console.log(`Socket ${socket.id} joined channel_${id}`);
    import('fs').then(fs => fs.appendFileSync('socket.log', `Socket ${socket.id} joined channel_${id}\n`)).catch(console.error);
  });

  socket.on("leave_channel", (channelId) => {
    const id = Number(channelId);
    if (!id || isNaN(id)) return;
    socket.leave(`channel_${id}`);
    console.log(`Socket ${socket.id} left channel_${id}`);
  });

  socket.on("typing", ({ channelId, userId, fullName }) => {
    if (!channelId) return;
    socket.to(`channel_${channelId}`).emit("typing", { channelId, userId, fullName });
  });

  socket.on("stop_typing", ({ channelId }) => {
    if (!channelId) return;
    socket.to(`channel_${channelId}`).emit("user_stop_typing", { userId: socket.user.userId });
  });

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected: ${socket.id}`);
    
    const currentCount = onlineUsers.get(userId) || 0;
    if (currentCount <= 1) {
      onlineUsers.delete(userId);
      io.emit("user_status", { userId, online: false });
    } else {
      onlineUsers.set(userId, currentCount - 1);
    }
  });
});

app.set("io", io);
global.io = io;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});