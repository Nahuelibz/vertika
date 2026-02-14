import { GameState, Position, Piece as PieceType } from '@/types/game';
import { useState, useEffect } from 'react';
import Piece from './Piece';

interface BoardProps {
  gameState: GameState;
  onCellClick: (pos: Position) => void;
}

interface AnimatingPiece {
  piece: PieceType;
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
  
  const getPiecesAt = (row: number, col: number) => {
    if (animatingPieces.length > 0) {
      return displayPieces.filter(p => p.position.row === row && p.position.col === col);
    }
    return pieces.filter(p => p.position.row === row && p.position.col === col);
  };
  
  const getAnimatingPiecesAt = (row: number, col: number) => {
    return animatingPieces.filter(ap => ap.to.row === row && ap.to.col === col);
  };
  
  const getCellColor = (row: number, col: number) => {
    if (row === boardSize - 1 && col === 0) return 'bg-blue-100';
    if (row === 0 && col === boardSize - 1) return 'bg-red-100';
    return 'bg-gray-50';
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
    <div className="flex flex-col gap-1 p-4 bg-white rounded-lg shadow-lg">
      {Array.from({ length: boardSize }).map((_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: boardSize }).map((_, col) => {
            const piecesHere = getPiecesAt(row, col);
            const animatingPiecesHere = getAnimatingPiecesAt(row, col);
            const isValid = isValidMove(row, col);
            
            return (
              <div
                key={`${row}-${col}`}
                onClick={() => onCellClick({ row, col })}
                className={`w-16 h-16 border-2 border-gray-300 flex items-center justify-center cursor-pointer relative transition-colors
                  ${getCellColor(row, col)}
                  ${isValid ? 'bg-green-300 hover:bg-green-400 border-green-500 shadow-lg' : 'hover:bg-gray-100'}
                `}
              >
                {hasBlocker(row, col, 'right') && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-600 z-10" />
                )}
                {hasBlocker(row, col, 'bottom') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 z-10" />
                )}
                
                {/* Piezas normales (no animando) */}
                {piecesHere.length > 0 && animatingPiecesHere.length === 0 && (
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    {piecesHere.map(piece => (
                      <Piece key={piece.id} piece={piece} />
                    ))}
                  </div>
                )}
                
                {/* Piezas animando */}
                {animatingPiecesHere.map(ap => (
                  <Piece
                    key={ap.piece.id}
                    piece={ap.piece}
                    isAnimating={true}
                    animationStyle={{
                      '--from-x': `${(ap.from.col - col) * 68}px`,
                      '--from-y': `${(ap.from.row - row) * 68}px`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
