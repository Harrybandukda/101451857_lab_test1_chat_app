import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; 
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import GroupMessage from './models/GroupMessage.js';
import User from './models/User.js'; 

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());
app.use(express.static('views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
    return User.findOne({});
  })
  .then(user => {
    if (user) {
      console.log('Successfully fetched a user from the database');
    } else {
      console.log('No users found in the database, but connection is working');
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const userRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join room', ({ username, room }) => {
    socket.join(room);
    userRooms.set(socket.id, { username, room });
    
    io.to(room).emit('user joined', {
      username,
      message: `${username} has joined the room`
    });
  });

  socket.on('chat message', async ({ username, room, message }) => {
    const groupMessage = new GroupMessage({
      from_user: username,
      room,
      message
    });
    await groupMessage.save();
    
    io.to(room).emit('chat message', {
      username,
      message,
      timestamp: new Date()
    });
  });

  socket.on('typing', ({ username, room }) => {
    socket.to(room).emit('user typing', { username });
  });

  socket.on('stop typing', ({ room }) => {
    socket.to(room).emit('user stop typing');
  });

  socket.on('disconnect', () => {
    const userInfo = userRooms.get(socket.id);
    if (userInfo) {
      const { username, room } = userInfo;
      io.to(room).emit('user left', {
        username,
        message: `${username} has left the room`
      });
      userRooms.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
