import { GameState, Position, Piece } from '@/types/game';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class AIPlayer {
  private difficulty: AIDifficulty;
  
  constructor(difficulty: AIDifficulty) {
    this.difficulty = difficulty;
  }
  
  getMove(gameState: GameState, validMoves: Position[]): Position | null {
    if (validMoves.length === 0) return null;
    
    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(validMoves);
      case 'medium':
        return this.getMediumMove(gameState, validMoves);
      case 'hard':
        return this.getHardMove(gameState, validMoves);
      default:
        return this.getRandomMove(validMoves);
    }
  }
  
  private getRandomMove(validMoves: Position[]): Position {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }
  
  private getMediumMove(gameState: GameState, validMoves: Position[]): Position {
    // Evaluar cada movimiento y elegir el mejor
    let bestMove = validMoves[0];
    let bestScore = -Infinity;
    
    for (const move of validMoves) {
      const score = this.evaluateMove(gameState, move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  private getHardMove(gameState: GameState, validMoves: Position[]): Position {
    // Minimax con profundidad 2
    let bestMove = validMoves[0];
    let bestScore = -Infinity;
    
    for (const move of validMoves) {
      const score = this.minimax(gameState, move, 2, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  private evaluateMove(gameState: GameState, move: Position): number {
    let score = 0;
    const aiPlayer = gameState.currentPlayer;
    const goalRow = aiPlayer === 'P1' ? 0 : gameState.boardSize - 1;
    const goalCol = aiPlayer === 'P1' ? gameState.boardSize - 1 : 0;
    
    // Distancia al objetivo
    const distanceToGoal = Math.abs(move.row - goalRow) + Math.abs(move.col - goalCol);
    score -= distanceToGoal * 10;
    
    // Bonus por acercarse al objetivo
    const box = gameState.pieces.find(p => p.type === 'box' && p.player === aiPlayer);
    if (box) {
      const currentDistance = Math.abs(box.position.row - goalRow) + Math.abs(box.position.col - goalCol);
      if (distanceToGoal < currentDistance) {
        score += 50;
      }
    }
    
    return score;
  }
  
  private minimax(gameState: GameState, move: Position, depth: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return this.evaluateMove(gameState, move);
    }
    
    // Simplificado - en una implementación completa simularíamos el estado
    return this.evaluateMove(gameState, move);
  }
}
