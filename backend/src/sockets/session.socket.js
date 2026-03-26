import jwt from 'jsonwebtoken';

/**
 * Initialize Socket.io event handlers for real-time features.
 * @param {import('socket.io').Server} io - Socket.io server instance
 */
export function initSocketHandlers(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.id} (${socket.user.role})`);

    // Join user's personal room for targeted events
    socket.join(`user:${socket.user.id}`);

    // ─── Mentor Session Events ──────────────────────────────

    /**
     * Student or mentor joins a live mentoring session room.
     */
    socket.on('join:session', ({ sessionId }) => {
      socket.join(`session:${sessionId}`);
      socket.to(`session:${sessionId}`).emit('participant:joined', {
        userId: socket.user.id,
        role: socket.user.role,
        timestamp: new Date().toISOString(),
      });
      console.log(`📚 ${socket.user.role} ${socket.user.id} joined session ${sessionId}`);
    });

    /**
     * Chat message in a mentor session.
     */
    socket.on('message:send', ({ sessionId, message }) => {
      const msgPayload = {
        userId: socket.user.id,
        role: socket.user.role,
        message,
        timestamp: new Date().toISOString(),
      };
      socket.to(`session:${sessionId}`).emit('message:received', msgPayload);
    });

    /**
     * Collaborative whiteboard stroke data.
     */
    socket.on('whiteboard:draw', ({ sessionId, strokeData }) => {
      socket.to(`session:${sessionId}`).emit('whiteboard:update', {
        userId: socket.user.id,
        strokeData,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Either party ends the session.
     */
    socket.on('session:end', ({ sessionId, summary }) => {
      io.to(`session:${sessionId}`).emit('session:ended', {
        endedBy: socket.user.id,
        summary,
        timestamp: new Date().toISOString(),
      });
      // Remove all participants from the room
      io.in(`session:${sessionId}`).socketsLeave(`session:${sessionId}`);
      console.log(`✅ Session ${sessionId} ended by ${socket.user.id}`);
    });

    // ─── Disconnect ─────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.id}`);
    });
  });

  // ─── Server-side Event Emitters ─────────────────────────

  /**
   * Notify student that a mentor match was found.
   * @param {string} studentId
   * @param {object} matchData
   */
  io.matchFound = (studentId, matchData) => {
    io.to(`user:${studentId}`).emit('match:found', matchData);
  };

  /**
   * Notify that a mentor has joined the session.
   * @param {string} sessionId
   * @param {object} mentorData
   */
  io.mentorJoined = (sessionId, mentorData) => {
    io.to(`session:${sessionId}`).emit('mentor:joined', mentorData);
  };

  /**
   * Notify student that offline data sync is complete.
   * @param {string} userId
   * @param {object} syncResult
   */
  io.syncComplete = (userId, syncResult) => {
    io.to(`user:${userId}`).emit('sync:complete', syncResult);
  };

  /**
   * Notify student of new credential issuance.
   * @param {string} studentId
   * @param {object} credentialData
   */
  io.credentialIssued = (studentId, credentialData) => {
    io.to(`user:${studentId}`).emit('credential:issued', credentialData);
  };
}
