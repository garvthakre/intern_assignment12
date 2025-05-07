// socket/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { logger } from '../services/logger.service.js';

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
      // Handle both auth methods - from handshake and from message
      let token = socket.handshake.auth.token;
      
      if (!token && socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token;
      }
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      // Remove Bearer prefix if present
      if (token.startsWith('Bearer ')) {
        token = token.slice(7);
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      logger.info(`Socket authenticated: ${user.name} (${user._id})`);
      next();
    } catch (err) {
      logger.error(`Socket authentication error: ${err.message}`);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Send authentication success message
    socket.emit('message', {
      type: 'auth_success',
      userId: socket.user._id.toString(),
      name: socket.user.name
    });

    // Handle user's socket ID for private messaging
    socket.join(socket.user._id.toString());
    
    // Handle messages from client
    socket.on('message', handleClientMessage(socket));
    
    // Handle socket events with consistent error handling
    socket.on('private_message', handlePrivateMessage(socket));
    socket.on('join_group', handleJoinGroup(socket));
    socket.on('leave_group', handleLeaveGroup(socket));
    socket.on('group_message', handleGroupMessage(socket));
    
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.name} (${socket.user._id})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.user.name}: ${error.message}`);
    });
  });

  return io;
};

// Handle raw message events (for web clients)
const handleClientMessage = (socket) => (data) => {
  try {
    // Parse message if it's a string
    const message = typeof data === 'string' ? JSON.parse(data) : data;
    
    switch (message.type) {
      case 'private_message':
        handlePrivateMessage(socket)(message);
        break;
      case 'join_group':
        handleJoinGroup(socket)(message.groupId);
        break;
      case 'leave_group':
        handleLeaveGroup(socket)(message.groupId);
        break;
      case 'group_message':
        handleGroupMessage(socket)(message);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    logger.error(`Error handling client message: ${error.message}`);
    socket.emit('message', {
      type: 'error',
      message: 'Invalid message format'
    });
  }
};

// Handle private messaging
const handlePrivateMessage = (socket) => ({ to, content }) => {
  try {
    if (!to || !content) {
      return socket.emit('message', {
        type: 'error',
        message: 'Recipient ID and content are required'
      });
    }

    const message = {
      type: 'private_message',
      from: {
        _id: socket.user._id,
        name: socket.user.name
      },
      to,
      content,
      timestamp: new Date(),
    };
    
    socket.to(to).emit('message', message);
    logger.info(`Private message sent: ${socket.user.name} to ${to}`);
    
    // You could save to database here
  } catch (error) {
    logger.error(`Error sending private message: ${error.message}`);
    socket.emit('message', {
      type: 'error',
      message: 'Failed to send private message'
    });
  }
};

// Handle joining a group
const handleJoinGroup = (socket) => (groupId) => {
  try {
    if (!groupId) {
      return socket.emit('message', {
        type: 'error',
        message: 'Group ID is required'
      });
    }
    
    socket.join(groupId);
    logger.info(`${socket.user.name} joined group: ${groupId}`);
    
    socket.emit('message', {
      type: 'group_joined',
      groupId
    });
  } catch (error) {
    logger.error(`Error joining group: ${error.message}`);
    socket.emit('message', {
      type: 'error',
      message: 'Failed to join group'
    });
  }
};

// Handle leaving a group
const handleLeaveGroup = (socket) => (groupId) => {
  try {
    if (!groupId) {
      return socket.emit('message', {
        type: 'error',
        message: 'Group ID is required'
      });
    }
    
    socket.leave(groupId);
    logger.info(`${socket.user.name} left group: ${groupId}`);
    
    socket.emit('message', {
      type: 'group_left',
      groupId
    });
  } catch (error) {
    logger.error(`Error leaving group: ${error.message}`);
    socket.emit('message', {
      type: 'error',
      message: 'Failed to leave group'
    });
  }
};

// Handle group messaging
const handleGroupMessage = (socket) => ({ groupId, content }) => {
  try {
    if (!groupId || !content) {
      return socket.emit('message', {
        type: 'error',
        message: 'Group ID and content are required'
      });
    }

    const message = {
      type: 'group_message',
      from: {
        _id: socket.user._id,
        name: socket.user.name
      },
      groupId,
      content,
      timestamp: new Date(),
    };
    
    socket.to(groupId).emit('message', message);
    logger.info(`Group message sent to ${groupId} by ${socket.user.name}`);
    
    // You could save to database here
  } catch (error) {
    logger.error(`Error sending group message: ${error.message}`);
    socket.emit('message', {
      type: 'error',
      message: 'Failed to send group message'
    });
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};