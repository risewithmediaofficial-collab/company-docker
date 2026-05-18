// =============================================
// SOCKET.IO CONFIGURATION & EVENT HANDLERS
// =============================================

// Map userId -> socketId for targeted notifications
const userSocketMap = new Map();

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register user with their socket
    socket.on('register', (userId) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} registered on socket ${socket.id}`);
      }
    });

    // Join a project room for real-time collaboration
    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`📋 Socket ${socket.id} joined project room: ${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Join a CRM/lead room
    socket.on('joinCRM', () => {
      socket.join('crm');
    });

    // Typing indicators for chat
    socket.on('typing', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('userTyping', { userId, userName });
    });

    socket.on('stopTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('userStopTyping', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from map
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Attach helper to io for emitting from controllers
  io.sendToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  io.broadcastToProject = (projectId, event, data) => {
    io.to(`project:${projectId}`).emit(event, data);
  };

  io.broadcastToCRM = (event, data) => {
    io.to('crm').emit(event, data);
  };
};

export { userSocketMap };
