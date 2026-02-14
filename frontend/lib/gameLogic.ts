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
  
  // Crear vértices para P1 (orientación top-right: arriba y derecha)
  for (let i = 1; i < boardSize; i++) {
    pieces.push({
      id: `vertex-p1-${i}`,
      type: 'vertex',
      player: 'P1',
      position: { row: boardSize - 1, col: i },
      orientation: 'top-right'
    });
  }
  
  // Crear vértices para P2 (orientación bottom-left: abajo e izquierda)
  for (let i = 0; i < boardSize - 1; i++) {
    pieces.push({
      id: `vertex-p2-${i}`,
      type: 'vertex',
      player: 'P2',
      position: { row: 0, col: i },
      orientation: 'bottom-left'
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
  const blockers: Blocker[] = [];
  const centerStart = Math.floor(boardSize / 3);
  const centerEnd = boardSize - centerStart;
  
  // Generar bloqueadores simétricos en zona central
  const numBlockers = Math.floor(boardSize / 2);
  
  for (let i = 0; i < numBlockers; i++) {
    const row = centerStart + Math.floor(Math.random() * (centerEnd - centerStart));
    const col = centerStart + Math.floor(Math.random() * (centerEnd - centerStart));
    const isHorizontal = Math.random() > 0.5;
    
    if (isHorizontal) {
      blockers.push({
        from: { row, col },
        to: { row, col: col + 1 }
      });
      // Simétrico
      blockers.push({
        from: { row: boardSize - 1 - row, col: boardSize - 1 - col },
        to: { row: boardSize - 1 - row, col: boardSize - 1 - col - 1 }
      });
    } else {
      blockers.push({
        from: { row, col },
        to: { row: row + 1, col }
      });
      // Simétrico
      blockers.push({
        from: { row: boardSize - 1 - row, col: boardSize - 1 - col },
        to: { row: boardSize - 2 - row, col: boardSize - 1 - col }
      });
    }
  }
  
  return blockers;
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
  
  // Verificar bloqueadores
  if (isBlockedByBlocker(state.blockers, box.position, newPos)) {
    return false;
  }
  
  // Verificar si hay pieza enemiga en destino
  const pieceAtDestination = state.pieces.find(p => 
    p.position.row === newPos.row && 
    p.position.col === newPos.col &&
    p.player !== box.player
  );
  
  if (pieceAtDestination) {
    return false;
  }
  
  return true;
}

function isBlockedByBlocker(blockers: Blocker[], from: Position, to: Position): boolean {
  return blockers.some(blocker => {
    // Verificar si el movimiento cruza el bloqueador
    const crossesBlocker = 
      (blocker.from.row === from.row && blocker.to.row === to.row &&
       blocker.from.col === from.col && blocker.to.col === to.col) ||
      (blocker.from.row === to.row && blocker.to.row === from.row &&
       blocker.from.col === to.col && blocker.to.col === from.col);
    
    return crossesBlocker;
  });
}

function isAdjacent(pos1: Position, pos2: Position): boolean {
  return Math.abs(pos1.row - pos2.row) <= 1 && Math.abs(pos1.col - pos2.col) <= 1;
}

export function movePiece(state: GameState, to: Position): GameState {
  const newPieces = [...state.pieces];
  const box = newPieces.find(p => p.type === 'box' && p.player === state.currentPlayer);
  
  if (!box) return state;
  
  const from = box.position;
  const direction = {
    row: to.row - from.row,
    col: to.col - from.col
  };
  
  // Mover vértices empujados
  const pushedVertices = getPushedVertices(newPieces, from, to, state.currentPlayer);
  pushedVertices.forEach(vertex => {
    const vIndex = newPieces.findIndex(p => p.id === vertex.id);
    if (vIndex !== -1) {
      newPieces[vIndex] = {
        ...newPieces[vIndex],
        position: {
          row: vertex.position.row + direction.row,
          col: vertex.position.col + direction.col
        }
      };
    }
  });
  
  // Mover la caja
  const boxIndex = newPieces.findIndex(p => p.id === box.id);
  newPieces[boxIndex] = { ...newPieces[boxIndex], position: to };
  
  // Verificar condiciones de victoria
  const winner = checkWinner(newPieces, state.boardSize);
  
  return {
    ...state,
    pieces: newPieces,
    currentPlayer: state.currentPlayer === 'P1' ? 'P2' : 'P1',
    validMoves: [],
    winner
  };
}

function getPushedVertices(pieces: Piece[], from: Position, to: Position, player: Player): Piece[] {
  const pushed: Piece[] = [];
  const direction = {
    row: to.row - from.row,
    col: to.col - from.col
  };
  
  // Verificar si hay vértices en el mismo casillero que la caja
  const verticesAtBoxPosition = pieces.filter(p => 
    p.type === 'vertex' && 
    p.player === player &&
    p.position.row === from.row && 
    p.position.col === from.col
  );
  
  // Verificar si hay vértices en el destino
  const vertexAtDestination = pieces.find(p => 
    p.type === 'vertex' && 
    p.player === player &&
    p.position.row === to.row && 
    p.position.col === to.col
  );
  
  if (vertexAtDestination) {
    pushed.push(vertexAtDestination);
  }
  
  // Empujar vértices que están en el mismo casillero si el movimiento es válido para su orientación
  verticesAtBoxPosition.forEach(vertex => {
    if (canVertexMoveInDirection(vertex, direction)) {
      pushed.push(vertex);
    }
  });
  
  return pushed;
}

function canVertexMoveInDirection(vertex: Piece, direction: { row: number; col: number }): boolean {
  if (!vertex.orientation) return false;
  
  if (vertex.orientation === 'top-right') {
    // P1: puede moverse arriba (row -1) o derecha (col +1)
    return (direction.row === -1 && direction.col === 0) || (direction.row === 0 && direction.col === 1);
  } else {
    // P2: puede moverse abajo (row +1) o izquierda (col -1)
    return (direction.row === 1 && direction.col === 0) || (direction.row === 0 && direction.col === -1);
  }
}

function checkWinner(pieces: Piece[], boardSize: number): Player | null {
  const p1Pieces = pieces.filter(p => p.player === 'P1');
  const p2Pieces = pieces.filter(p => p.player === 'P2');
  
  // Verificar coronación total P1 (todas las piezas en esquina superior derecha)
  const p1InGoal = p1Pieces.filter(p => p.position.row === 0 && p.position.col === boardSize - 1);
  if (p1InGoal.length === p1Pieces.length) {
    return 'P1';
  }
  
  // Verificar coronación total P2 (todas las piezas en esquina inferior izquierda)
  const p2InGoal = p2Pieces.filter(p => p.position.row === boardSize - 1 && p.position.col === 0);
  if (p2InGoal.length === p2Pieces.length) {
    return 'P2';
  }
  
  return null;
}
