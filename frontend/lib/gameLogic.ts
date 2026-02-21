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
    validMoves: [],
    eliminatedVertices: []
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
    { row: -1, col: 0, name: 'up' },
    { row: 1, col: 0, name: 'down' },
    { row: 0, col: -1, name: 'left' },
    { row: 0, col: 1, name: 'right' }
  ];
  
  for (const dir of directions) {
    const newPos = {
      row: box.position.row + dir.row,
      col: box.position.col + dir.col
    };
    
    if (isValidMove(state, box, newPos, dir)) {
      moves.push(newPos);
    }
  }
  
  return moves;
}

function isValidMove(state: GameState, box: Piece, newPos: Position, direction: any): boolean {
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
  
  // Verificar si hay pieza enemiga en destino (caja o vértice)
  const enemyPieceAtDestination = state.pieces.find(p => 
    p.position.row === newPos.row && 
    p.position.col === newPos.col &&
    p.player !== box.player
  );
  
  if (enemyPieceAtDestination) {
    return false;
  }
  
  // Verificar límite de 3 cajas por casillero
  const boxesAtDestination = state.pieces.filter(p => 
    p.type === 'box' && 
    p.position.row === newPos.row && 
    p.position.col === newPos.col
  );
  
  if (boxesAtDestination.length >= 3) {
    return false;
  }
  
  // Verificar si hay vértices propios en el destino
  const verticesAtDestination = state.pieces.filter(p => 
    p.type === 'vertex' && 
    p.player === box.player &&
    p.position.row === newPos.row && 
    p.position.col === newPos.col
  );
  
  // Si hay vértices, verificar que la dirección sea válida para entrar
  if (verticesAtDestination.length > 0) {
    for (const vertex of verticesAtDestination) {
      if (!canEnterVertexCasillero(vertex, direction)) {
        return false;
      }
    }
  }
  
  return true;
}

function canEnterVertexCasillero(vertex: Piece, direction: any): boolean {
  if (!vertex.orientation) return true;
  
  // direction.name es la dirección del movimiento de la caja
  // Necesitamos verificar desde qué lado entra al vértice
  // Si la caja se mueve 'right', entra desde la 'left' del vértice
  // Si la caja se mueve 'left', entra desde la 'right' del vértice
  // Si la caja se mueve 'up', entra desde 'down' del vértice
  // Si la caja se mueve 'down', entra desde 'up' del vértice
  
  if (vertex.orientation === 'top-right') {
    // Vértice top-right (┐): barras en arriba y derecha
    // Puede entrar desde abajo (caja se mueve 'up') o izquierda (caja se mueve 'right')
    return direction.name === 'up' || direction.name === 'right';
  } else {
    // Vértice bottom-left (└): barras en abajo e izquierda
    // Puede entrar desde arriba (caja se mueve 'down') o derecha (caja se mueve 'left')
    return direction.name === 'down' || direction.name === 'left';
  }
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
  
  // Eliminar vértices que llegaron al objetivo
  let eliminatedVertices = [...(state.eliminatedVertices || [])];
  const goalRow = state.currentPlayer === 'P1' ? 0 : state.boardSize - 1;
  const goalCol = state.currentPlayer === 'P1' ? state.boardSize - 1 : 0;
  
  const verticesToRemove = newPieces.filter(p => 
    p.type === 'vertex' && 
    p.player === state.currentPlayer &&
    p.position.row === goalRow && 
    p.position.col === goalCol
  );
  
  verticesToRemove.forEach(v => {
    eliminatedVertices.push(v.id);
  });
  
  // Remover vértices eliminados de la lista de piezas
  const filteredPieces = newPieces.filter(p => !eliminatedVertices.includes(p.id));
  
  // Verificar condiciones de victoria
  const winner = checkWinner(filteredPieces, state.currentPlayer);
  
  return {
    ...state,
    pieces: filteredPieces,
    currentPlayer: state.currentPlayer === 'P1' ? 'P2' : 'P1',
    validMoves: [],
    winner,
    eliminatedVertices
  };
}

function getPushedVertices(pieces: Piece[], from: Position, to: Position, player: Player): Piece[] {
  const pushed: Piece[] = [];
  const direction = {
    row: to.row - from.row,
    col: to.col - from.col
  };
  
  // Solo empujar vértices que están en el MISMO casillero que la caja (from)
  const verticesAtBoxPosition = pieces.filter(p => 
    p.type === 'vertex' && 
    p.player === player &&
    p.position.row === from.row && 
    p.position.col === from.col
  );
  
  // Empujar solo si el movimiento es válido para la orientación del vértice
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

function checkWinner(pieces: Piece[], currentPlayer: Player): Player | null {
  const playerVertices = pieces.filter(p => p.type === 'vertex' && p.player === currentPlayer);
  
  // Si el jugador actual no tiene vértices, ganó
  if (playerVertices.length === 0) {
    return currentPlayer;
  }
  
  return null;
}
