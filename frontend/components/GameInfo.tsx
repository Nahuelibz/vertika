import { Player } from '@/types/game';

interface GameInfoProps {
  currentPlayer: Player;
  winner: Player | null;
}

export default function GameInfo({ currentPlayer, winner }: GameInfoProps) {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg shadow-lg border-2 border-gray-200">
      {winner ? (
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            🎉 ¡Victoria! 🎉
          </div>
          <div className={`text-2xl font-bold ${winner === 'P1' ? 'text-blue-600' : 'text-red-600'}`}>
            Jugador {winner} gana
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Turno actual</div>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-8 h-8 rounded-full ${currentPlayer === 'P1' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className={`text-2xl font-bold ${currentPlayer === 'P1' ? 'text-blue-600' : 'text-gray-400'}`}>
              Jugador P1
            </span>
            <span className="text-2xl text-gray-400">vs</span>
            <span className={`text-2xl font-bold ${currentPlayer === 'P2' ? 'text-red-600' : 'text-gray-400'}`}>
              Jugador P2
            </span>
            <div className={`w-8 h-8 rounded-full ${currentPlayer === 'P2' ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
          </div>
        </div>
      )}
    </div>
  );
}
