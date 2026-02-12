import { useState } from 'react';
import { useRouter } from 'next/router';

export default function OnlineGame() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Juego Online</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              const id = Math.random().toString(36).substring(7);
              router.push(`/room/${id}`);
            }}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crear Sala
          </button>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ID de sala"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              onClick={() => roomId && router.push(`/room/${roomId}`)}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Unirse
            </button>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
