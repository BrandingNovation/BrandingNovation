import { Server } from 'socket.io';
import { createServer } from 'http';
import type { FastifyInstance } from 'fastify';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
    nodeId?: string;
  };
}

interface WorkflowEdit {
  type: 'node_add' | 'node_update' | 'node_delete' | 'edge_add' | 'edge_delete' | 'cursor_move';
  userId: string;
  timestamp: number;
  data: any;
  workflowId: string;
}

interface CollaborationRoom {
  workflowId: string;
  users: Map<string, CollaborationUser>;
  recentEdits: WorkflowEdit[];
}

class CollaborationService {
  private io: Server;
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join workflow room
      socket.on('join_workflow', (data: { workflowId: string; userName: string }) => {
        const { workflowId, userName } = data;
        
        // Leave any existing rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join new room
        socket.join(workflowId);

        // Initialize room if it doesn't exist
        if (!this.rooms.has(workflowId)) {
          this.rooms.set(workflowId, {
            workflowId,
            users: new Map(),
            recentEdits: []
          });
        }

        const room = this.rooms.get(workflowId)!;
        
        // Add user to room
        const user: CollaborationUser = {
          id: socket.id,
          name: userName || `User ${socket.id.slice(0, 6)}`,
          color: this.userColors[room.users.size % this.userColors.length]
        };

        room.users.set(socket.id, user);

        // Notify others of new user
        socket.to(workflowId).emit('user_joined', user);

        // Send current users to new user
        socket.emit('room_users', Array.from(room.users.values()));

        // Send recent edits to sync the workflow
        socket.emit('workflow_sync', {
          recentEdits: room.recentEdits.slice(-50) // Last 50 edits
        });

        console.log(`User ${user.name} joined workflow ${workflowId}`);
      });

      // Handle workflow edits
      socket.on('workflow_edit', (edit: Omit<WorkflowEdit, 'userId' | 'timestamp'>) => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        const room = this.rooms.get(workflowRoom);
        if (!room) return;

        const fullEdit: WorkflowEdit = {
          ...edit,
          userId: socket.id,
          timestamp: Date.now()
        };

        // Add to recent edits
        room.recentEdits.push(fullEdit);
        
        // Keep only last 100 edits
        if (room.recentEdits.length > 100) {
          room.recentEdits = room.recentEdits.slice(-100);
        }

        // Broadcast to all other users in the room
        socket.to(workflowRoom).emit('workflow_edit', fullEdit);

        console.log(`Workflow edit in ${workflowRoom}: ${edit.type}`);
      });

      // Handle cursor movements
      socket.on('cursor_move', (cursor: { x: number; y: number; nodeId?: string }) => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        const room = this.rooms.get(workflowRoom);
        if (!room || !room.users.has(socket.id)) return;

        // Update user cursor
        const user = room.users.get(socket.id)!;
        user.cursor = cursor;

        // Broadcast cursor position to others
        socket.to(workflowRoom).emit('user_cursor', {
          userId: socket.id,
          cursor,
          user: { id: user.id, name: user.name, color: user.color }
        });
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { nodeId: string }) => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        const room = this.rooms.get(workflowRoom);
        if (!room || !room.users.has(socket.id)) return;

        const user = room.users.get(socket.id)!;
        
        socket.to(workflowRoom).emit('user_typing', {
          userId: socket.id,
          nodeId: data.nodeId,
          user: { id: user.id, name: user.name, color: user.color }
        });
      });

      socket.on('typing_stop', (data: { nodeId: string }) => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        socket.to(workflowRoom).emit('user_stopped_typing', {
          userId: socket.id,
          nodeId: data.nodeId
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // Remove user from all rooms
        this.rooms.forEach((room, workflowId) => {
          if (room.users.has(socket.id)) {
            const user = room.users.get(socket.id)!;
            room.users.delete(socket.id);

            // Notify others of user leaving
            socket.to(workflowId).emit('user_left', { userId: socket.id });

            // Clean up empty rooms
            if (room.users.size === 0) {
              this.rooms.delete(workflowId);
              console.log(`Cleaned up empty room: ${workflowId}`);
            }

            console.log(`User ${user.name} left workflow ${workflowId}`);
          }
        });
      });

      // Handle workflow locking for exclusive edits
      socket.on('request_edit_lock', (data: { nodeId: string; lockType: 'node' | 'edge' }) => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        const room = this.rooms.get(workflowRoom);
        if (!room || !room.users.has(socket.id)) return;

        const user = room.users.get(socket.id)!;

        // Grant lock (in production, you'd check for conflicts)
        socket.emit('edit_lock_granted', { nodeId: data.nodeId, lockType: data.lockType });

        // Notify others of the lock
        socket.to(workflowRoom).emit('edit_lock_acquired', {
          nodeId: data.nodeId,
          lockType: data.lockType,
          userId: socket.id,
          user: { id: user.id, name: user.name, color: user.color }
        });
      });

      socket.on('release_edit_lock', (data: { nodeId: string; lockType: 'node' | 'edge' }) => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        // Notify others of lock release
        socket.to(workflowRoom).emit('edit_lock_released', {
          nodeId: data.nodeId,
          lockType: data.lockType,
          userId: socket.id
        });
      });

      // Presence awareness - user is active
      socket.on('user_active', () => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        const room = this.rooms.get(workflowRoom);
        if (!room || !room.users.has(socket.id)) return;

        const user = room.users.get(socket.id)!;
        
        socket.to(workflowRoom).emit('user_presence', {
          userId: socket.id,
          status: 'active',
          user: { id: user.id, name: user.name, color: user.color }
        });
      });

      socket.on('user_idle', () => {
        const rooms = Array.from(socket.rooms);
        const workflowRoom = rooms.find(room => room !== socket.id);
        
        if (!workflowRoom) return;

        socket.to(workflowRoom).emit('user_presence', {
          userId: socket.id,
          status: 'idle'
        });
      });
    });
  }

  // Get room statistics
  public getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalUsers: 0,
      roomDetails: [] as Array<{
        workflowId: string;
        userCount: number;
        recentEditCount: number;
      }>
    };

    this.rooms.forEach((room, workflowId) => {
      stats.totalUsers += room.users.size;
      stats.roomDetails.push({
        workflowId,
        userCount: room.users.size,
        recentEditCount: room.recentEdits.length
      });
    });

    return stats;
  }

  // Force disconnect all users from a workflow (admin function)
  public disconnectWorkflow(workflowId: string) {
    if (this.rooms.has(workflowId)) {
      this.io.to(workflowId).emit('forced_disconnect', {
        reason: 'Workflow maintenance'
      });
      this.io.in(workflowId).disconnectSockets();
      this.rooms.delete(workflowId);
    }
  }

  // Broadcast system message to all users in a workflow
  public broadcastToWorkflow(workflowId: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.io.to(workflowId).emit('system_message', {
      message,
      type,
      timestamp: Date.now()
    });
  }
}

export function setupWebSocket(app: FastifyInstance): CollaborationService {
  const httpServer = createServer();
  const collaborationService = new CollaborationService(httpServer);

  // Add WebSocket info endpoint
  app.get('/api/collaboration/stats', async (request, reply) => {
    return collaborationService.getRoomStats();
  });

  // Admin endpoints
  app.post('/api/collaboration/disconnect/:workflowId', async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };
    collaborationService.disconnectWorkflow(workflowId);
    return { success: true, message: `Disconnected all users from workflow ${workflowId}` };
  });

  app.post('/api/collaboration/broadcast/:workflowId', async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };
    const { message, type } = request.body as { message: string; type?: 'info' | 'warning' | 'error' };
    
    collaborationService.broadcastToWorkflow(workflowId, message, type);
    return { success: true, message: 'Broadcast sent' };
  });

  // Start WebSocket server on a different port
  const wsPort = parseInt(process.env.WS_PORT || '3002');
  httpServer.listen(wsPort, () => {
    console.log(`🔗 WebSocket server running on port ${wsPort}`);
  });

  return collaborationService;
}