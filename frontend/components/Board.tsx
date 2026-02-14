import { GameState, Position, Piece } from '@/types/game';
import { useState, useEffect } from 'react';

interface BoardProps {
  gameState: GameState;
  onCellClick: (pos: Position) => void;
}

interface AnimatingPiece {
  piece: Piece;
  from: Position;
  to: Position;
}

export default function Board({ gameState, onCellClick }: BoardProps) {
  const { boardSize, pieces, validMoves, currentPlayer, blockers } = gameState;
  const [animatingPieces, setAnimatingPieces] = useState<AnimatingPiece[]>([]);
  const [displayPieces, setDisplayPieces] = useState(pieces);
  
  useEffect(() => {
    // Detectar piezas que se movieron
    const moved: AnimatingPiece[] = [];
    pieces.forEach(newPiece => {
      const oldPiece = displayPieces.find(p => p.id === newPiece.id);
      if (oldPiece && 
          (oldPiece.position.row !== newPiece.position.row || 
           oldPiece.position.col !== newPiece.position.col)) {
        moved.push({
          piece: newPiece,
          from: oldPiece.position,
          to: newPiece.position
        });
      }
    });
    
    if (moved.length > 0) {
      setAnimatingPieces(moved);
      setTimeout(() => {
        setAnimatingPieces([]);
        setDisplayPieces(pieces);
      }, 300);
    } else {
      setDisplayPieces(pieces);
    }
  }, [pieces]);
  
  const isValidMove = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col);
  };
  
  const getPieceAt = (row: number, col: number) => {
    if (animatingPieces.length > 0) {
      return displayPieces.find(p => p.position.row === row && p.position.col === col);
    }
    return pieces.find(p => p.position.row === row && p.position.col === col);
  };
  
  const getAnimatingPieceAt = (row: number, col: number) => {
    return animatingPieces.find(ap => ap.to.row === row && ap.to.col === col);
  };
  
  const getCellColor = (row: number, col: number) => {
    if (row === boardSize - 1 && col === 0) return 'bg-blue-200';
    if (row === 0 && col === boardSize - 1) return 'bg-red-200';
    return 'bg-gray-100';
  };
  
  const hasBlocker = (row: number, col: number, direction: 'top' | 'right' | 'bottom' | 'left') => {
    return blockers.some(blocker => {
      if (direction === 'right') {
        return blocker.from.row === row && blocker.from.col === col &&
               blocker.to.row === row && blocker.to.col === col + 1;
      }
      if (direction === 'bottom') {
        return blocker.from.row === row && blocker.from.col === col &&
               blocker.to.row === row + 1 && blocker.to.col === col;
      }
      return false;
    });
  };
  
  return (
    <div className="flex flex-col gap-1 p-4">
      {Array.from({ length: boardSize }).map((_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: boardSize }).map((_, col) => {
            const piece = getPieceAt(row, col);
            const animatingPiece = getAnimatingPieceAt(row, col);
            const isValid = isValidMove(row, col);
            
            return (
              <div
                key={`${row}-${col}`}
                onClick={() => onCellClick({ row, col })}
                className={`w-16 h-16 border-2 border-gray-400 flex items-center justify-center cursor-pointer relative
                  ${getCellColor(row, col)}
                  ${isValid ? 'bg-green-200 hover:bg-green-300' : 'hover:bg-gray-200'}
                `}
              >
                {hasBlocker(row, col, 'right') && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-600 z-10" />
                )}
                {hasBlocker(row, col, 'bottom') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 z-10" />
                )}
                
                {piece && !animatingPiece && (
                  <div className={`w-12 h-12 rounded flex items-center justify-center font-bold
                    ${piece.player === 'P1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}
                  `}>
                    {piece.type === 'box' ? '□' : 'V'}
                  </div>
                )}
                
                {animatingPiece && (
                  <div 
                    className={`w-12 h-12 rounded flex items-center justify-center font-bold absolute
                      ${animatingPiece.piece.player === 'P1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}
                      animate-move
                    `}
                    style={{
                      '--from-x': `${(animatingPiece.from.col - col) * 68}px`,
                      '--from-y': `${(animatingPiece.from.row - row) * 68}px`,
                    } as React.CSSProperties}
                  >
                    {animatingPiece.piece.type === 'box' ? '□' : 'V'}
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
