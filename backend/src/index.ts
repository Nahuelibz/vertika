import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameRoom } from './gameRoom';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map<string, GameRoom>();

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('createRoom', (roomId: string) => {
    const room = new GameRoom(roomId);
    rooms.set(roomId, room);
    socket.join(roomId);
    room.addPlayer(socket.id, 'P1');
    socket.emit('roomCreated', { roomId, player: 'P1' });
  });
  
  socket.on('joinRoom', (roomId: string) => {
    const room = rooms.get(roomId);
    if (room && !room.isFull()) {
      socket.join(roomId);
      room.addPlayer(socket.id, 'P2');
      io.to(roomId).emit('gameStart', room.getState());
    } else {
      socket.emit('error', 'Sala no disponible');
    }
  });
  
  socket.on('move', ({ roomId, position }) => {
    const room = rooms.get(roomId);
    if (room) {
      const newState = room.makeMove(socket.id, position);
      io.to(roomId).emit('gameUpdate', newState);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
