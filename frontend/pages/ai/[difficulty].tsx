import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Board from '@/components/Board';
import GameInfo from '@/components/GameInfo';
import { initializeGame, getValidMoves, movePiece } from '@/lib/gameLogic';
import { AIPlayer, AIDifficulty } from '@/lib/aiPlayer';
import { GameState, Position } from '@/types/game';

export default function AIGamePage() {
  const router = useRouter();
  const { difficulty } = router.query;
  const [gameState, setGameState] = useState<GameState>(() => 
    initializeGame({ boardSize: 6, withBlockers: false })
  );
  const [aiPlayer] = useState(() => new AIPlayer((difficulty as AIDifficulty) || 'easy'));
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  useEffect(() => {
    if (gameState.currentPlayer === 'P2' && !gameState.winner && !isAIThinking) {
      setIsAIThinking(true);
      
      setTimeout(() => {
        const moves = getValidMoves(gameState);
        if (moves.length > 0) {
          const aiMove = aiPlayer.getMove(gameState, moves);
          if (aiMove) {
            const newState = movePiece(gameState, aiMove);
            setGameState(newState);
          }
        }
        setIsAIThinking(false);
      }, 800);
    }
  }, [gameState.currentPlayer, gameState.winner, isAIThinking]);
  
  const handleCellClick = (pos: Position) => {
    if (gameState.currentPlayer !== 'P1' || gameState.winner || isAIThinking) return;
    
    if (gameState.validMoves.length === 0) {
      const moves = getValidMoves(gameState);
      setGameState({ ...gameState, validMoves: moves });
    } else {
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
    setIsAIThinking(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Jugar vs IA</h1>
        <p className="text-center text-gray-600 mb-6 capitalize">
          Dificultad: {difficulty}
        </p>
        
        <GameInfo currentPlayer={gameState.currentPlayer} winner={gameState.winner} />
        
        {isAIThinking && (
          <div className="mt-4 text-center text-lg text-purple-600">
            IA pensando...
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <Board gameState={gameState} onCellClick={handleCellClick} />
        </div>
        
        <div className="mt-6 text-center space-x-4">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reiniciar
          </button>
          <button
            onClick={() => router.push('/ai')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Cambiar Dificultad
          </button>
        </div>
      </div>
    </div>
  );
}
