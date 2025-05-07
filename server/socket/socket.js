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
      socket.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    socket.on('private_message', async ({ to, content }) => {
      const message = {
        from: socket.user._id,
        to,
        content,
        timestamp: new Date(),
      };
      io.to(to).emit('private_message', message);
      // Save message to DB (if required later)
    });
    socket.on('join_group', (groupId) => {
        socket.join(groupId);
      });
      socket.on('group_message', ({ groupId, content }) => {
        const message = {
          from: socket.user._id,
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

export const getIO = () => io;