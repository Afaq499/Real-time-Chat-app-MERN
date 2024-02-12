const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

require('./connection/mongoDb');

const SaveMessage = require('./Message/save-message');
const GetMessages = require('./Message/get-messages');
const leaveRoom = require('./utils/leave-room');

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let allUsers = [];

io.on('connection', (socket) => {
  // console.log(`User connected ${socket.id}`);

  socket.on('join_room', async (data) => {
    const { username, room } = data;
    socket.join(room);

    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);

    const last100Messages = await GetMessages(room);
    if (last100Messages?.length) socket.emit('last_100_messages', last100Messages);

    let createdAt = Date.now();
    socket.to(room).emit('receive_message', {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      createdAt,
    });
    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      createdAt,
    });
  });
  socket.on('get_chat_room_info', async ({ room }) => {
    const last100Messages = await GetMessages(room);
    socket.emit('last_100_messages', last100Messages);
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);
  });
  socket.on('send_message', (data) => {
    const { message, username, room } = data;
    io.in(room).emit('receive_message', data); // Send to all users in room, including sender
    SaveMessage({ message, username, room });
  });
  socket.on('leave_room', (data) => {
    const { username, room } = data;
    socket.leave(room);
    const createdAt = Date.now();
    // Remove user from memory
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit('chatroom_users', allUsers);
    socket.to(room).emit('receive_message', {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      createdAt,
    });
    console.log(`${username} has left the chat`);
  });
  // socket.on('disconnect', () => {
  //   console.log('User disconnected from the chat');
  //   const user = allUsers.find((user) => user.id == socket.id);
  //   if (user?.username) {
  //     allUsers = leaveRoom(socket.id, allUsers);
  //     socket.to(chatRoom).emit('chatroom_users', allUsers);
  //     socket.to(chatRoom).emit('receive_message', {
  //       message: `${user.username} has disconnected from the chat.`,
  //     });
  //   }
  // });
});

server.listen(4000, () => 'Server is running on port 4000');