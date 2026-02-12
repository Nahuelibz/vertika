import { Player } from '@/types/game';

interface GameInfoProps {
  currentPlayer: Player;
  winner: Player | null;
}

export default function GameInfo({ currentPlayer, winner }: GameInfoProps) {
  return (
    <div className="p-4 bg-white rounded shadow">
      {winner ? (
        <div className="text-2xl font-bold text-center">
          ¡Jugador {winner} gana!
        </div>
      ) : (
        <div className="text-xl text-center">
          Turno: <span className={currentPlayer === 'P1' ? 'text-blue-600' : 'text-red-600'}>
            Jugador {currentPlayer}
          </span>
        </div>
      )}
    </div>
  );
}
