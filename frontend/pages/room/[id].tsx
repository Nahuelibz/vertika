import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import Board from '@/components/Board';
import GameInfo from '@/components/GameInfo';
import { GameState, Position, Player } from '@/types/game';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const newSocket = io(apiUrl);
    
    newSocket.on('connect', () => {
      // Intentar unirse a sala existente o crear nueva
      newSocket.emit('joinRoom', id);
    });
    
    newSocket.on('roomCreated', ({ player }: { player: Player }) => {
      setMyPlayer(player);
      setWaiting(true);
    });
    
    newSocket.on('playerJoined', ({ player }: { player: Player }) => {
      setMyPlayer(player);
      setWaiting(false);
    });
    
    newSocket.on('gameStart', (state: GameState) => {
      setGameState(state);
      setWaiting(false);
    });
    
    newSocket.on('gameUpdate', (state: GameState) => {
      setGameState(state);
    });
    
    newSocket.on('error', (message: string) => {
      setError(message);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [id]);
  
  const handleCellClick = (pos: Position) => {
    if (!socket || !gameState || !myPlayer) return;
    if (gameState.currentPlayer !== myPlayer) return;
    
    if (gameState.validMoves.length === 0) {
      socket.emit('requestMoves', { roomId: id });
    } else {
      const isValid = gameState.validMoves.some(m => m.row === pos.row && m.col === pos.col);
      if (isValid) {
        socket.emit('move', { roomId: id, position: pos });
      }
    }
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push('/online')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  if (waiting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Sala: {id}</h2>
          <p className="text-center mb-4">Esperando al otro jugador...</p>
          <p className="text-center text-sm text-gray-600">
            Comparte este ID con tu oponente
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-center font-mono">
            {id}
          </div>
        </div>
      </div>
    );
  }
  
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Sala Online</h1>
        <p className="text-center text-gray-600 mb-6">
          Eres el Jugador {myPlayer} - ID: {id}
        </p>
        
        <GameInfo currentPlayer={gameState.currentPlayer} winner={gameState.winner} />
        
        {gameState.currentPlayer !== myPlayer && !gameState.winner && (
          <div className="mt-4 text-center text-lg text-gray-600">
            Esperando movimiento del oponente...
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <Board gameState={gameState} onCellClick={handleCellClick} />
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/online')}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
