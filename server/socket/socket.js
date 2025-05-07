import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // Handle user's socket ID for private messaging
    socket.join(socket.user._id.toString());
    
    socket.on('private_message', async ({ to, content }) => {
      const message = {
        from: {
          _id: socket.user._id,
          name: socket.user.name
        },
        to,
        content,
        timestamp: new Date(),
      };
      
      socket.to(to).emit('private_message', message);
      // Save message to DB (if required later)
    });
    
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
      console.log(`${socket.user.name} joined group: ${groupId}`);
    });
    
    socket.on('group_message', ({ groupId, content }) => {
      const message = {
        from: {
          _id: socket.user._id,
          name: socket.user.name
        },
        groupId,
        content,
        timestamp: new Date(),
      };
      
      io.to(groupId).emit('group_message', message);
      // Save message to DB if needed
    }); 
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};