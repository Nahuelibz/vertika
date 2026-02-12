import { GameState, Position } from '@/types/game';

interface BoardProps {
  gameState: GameState;
  onCellClick: (pos: Position) => void;
}

export default function Board({ gameState, onCellClick }: BoardProps) {
  const { boardSize, pieces, validMoves, currentPlayer } = gameState;
  
  const isValidMove = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col);
  };
  
  const getPieceAt = (row: number, col: number) => {
    return pieces.find(p => p.position.row === row && p.position.col === col);
  };
  
  const getCellColor = (row: number, col: number) => {
    if (row === boardSize - 1 && col === 0) return 'bg-blue-200';
    if (row === 0 && col === boardSize - 1) return 'bg-red-200';
    return 'bg-gray-100';
  };
  
  return (
    <div className="flex flex-col gap-1 p-4">
      {Array.from({ length: boardSize }).map((_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: boardSize }).map((_, col) => {
            const piece = getPieceAt(row, col);
            const isValid = isValidMove(row, col);
            
            return (
              <div
                key={`${row}-${col}`}
                onClick={() => onCellClick({ row, col })}
                className={`w-16 h-16 border-2 border-gray-400 flex items-center justify-center cursor-pointer
                  ${getCellColor(row, col)}
                  ${isValid ? 'bg-green-200 hover:bg-green-300' : 'hover:bg-gray-200'}
                `}
              >
                {piece && (
                  <div className={`w-12 h-12 rounded flex items-center justify-center font-bold
                    ${piece.player === 'P1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}
                  `}>
                    {piece.type === 'box' ? '□' : 'V'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
