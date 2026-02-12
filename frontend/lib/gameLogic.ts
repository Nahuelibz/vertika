import { GameState, Position, Piece, Player, GameConfig, Blocker } from '@/types/game';

export function initializeGame(config: GameConfig): GameState {
  const { boardSize, withBlockers } = config;
  const pieces: Piece[] = [];
  
  // Crear cajas
  pieces.push({
    id: 'box-p1',
    type: 'box',
    player: 'P1',
    position: { row: boardSize - 1, col: 0 }
  });
  
  pieces.push({
    id: 'box-p2',
    type: 'box',
    player: 'P2',
    position: { row: 0, col: boardSize - 1 }
  });
  
  // Crear vértices para P1
  for (let i = 1; i < boardSize; i++) {
    pieces.push({
      id: `vertex-p1-${i}`,
      type: 'vertex',
      player: 'P1',
      position: { row: boardSize - 1, col: i }
    });
  }
  
  // Crear vértices para P2
  for (let i = 0; i < boardSize - 1; i++) {
    pieces.push({
      id: `vertex-p2-${i}`,
      type: 'vertex',
      player: 'P2',
      position: { row: 0, col: i }
    });
  }
  
  const blockers = withBlockers ? generateBlockers(boardSize) : [];
  
  return {
    boardSize,
    pieces,
    blockers,
    currentPlayer: 'P1',
    winner: null,
    validMoves: []
  };
}

function generateBlockers(boardSize: number): Blocker[] {
  // Generar bloqueadores simétricos en zona central
  return [];
}

export function getValidMoves(state: GameState): Position[] {
  const box = state.pieces.find(p => p.type === 'box' && p.player === state.currentPlayer);
  if (!box) return [];
  
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // arriba
    { row: 1, col: 0 },  // abajo
    { row: 0, col: -1 }, // izquierda
    { row: 0, col: 1 }   // derecha
  ];
  
  for (const dir of directions) {
    const newPos = {
      row: box.position.row + dir.row,
      col: box.position.col + dir.col
    };
    
    if (isValidMove(state, box, newPos)) {
      moves.push(newPos);
    }
  }
  
  return moves;
}

function isValidMove(state: GameState, box: Piece, newPos: Position): boolean {
  // Verificar límites del tablero
  if (newPos.row < 0 || newPos.row >= state.boardSize || 
      newPos.col < 0 || newPos.col >= state.boardSize) {
    return false;
  }
  
  // Verificar caja enemiga adyacente
  const enemyBox = state.pieces.find(p => p.type === 'box' && p.player !== box.player);
  if (enemyBox && isAdjacent(newPos, enemyBox.position)) {
    return false;
  }
  
  return true;
}

function isAdjacent(pos1: Position, pos2: Position): boolean {
  return Math.abs(pos1.row - pos2.row) <= 1 && Math.abs(pos1.col - pos2.col) <= 1;
}

export function movePiece(state: GameState, to: Position): GameState {
  const newPieces = [...state.pieces];
  const boxIndex = newPieces.findIndex(p => p.type === 'box' && p.player === state.currentPlayer);
  
  if (boxIndex !== -1) {
    newPieces[boxIndex] = { ...newPieces[boxIndex], position: to };
  }
  
  return {
    ...state,
    pieces: newPieces,
    currentPlayer: state.currentPlayer === 'P1' ? 'P2' : 'P1',
    validMoves: []
  };
}
