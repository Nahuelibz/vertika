import { useState } from 'react';
import Board from '@/components/Board';
import GameInfo from '@/components/GameInfo';
import { initializeGame, getValidMoves, movePiece } from '@/lib/gameLogic';
import { GameState, Position } from '@/types/game';

export default function LocalGame() {
  const [gameState, setGameState] = useState<GameState>(() => 
    initializeGame({ boardSize: 6, withBlockers: false })
  );
  
  const handleCellClick = (pos: Position) => {
    if (gameState.validMoves.length === 0) {
      // Mostrar movimientos válidos
      const moves = getValidMoves(gameState);
      setGameState({ ...gameState, validMoves: moves });
    } else {
      // Intentar mover
      const isValid = gameState.validMoves.some(m => m.row === pos.row && m.col === pos.col);
      if (isValid) {
        const newState = movePiece(gameState, pos);
        setGameState(newState);
      } else {
        setGameState({ ...gameState, validMoves: [] });
      }
    }
  };
  
  const handleReset = () => {
    setGameState(initializeGame({ boardSize: 6, withBlockers: false }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Juego Local</h1>
        
        <GameInfo currentPlayer={gameState.currentPlayer} winner={gameState.winner} />
        
        <div className="mt-6 flex justify-center">
          <Board gameState={gameState} onCellClick={handleCellClick} />
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
