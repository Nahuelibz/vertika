type Player = 'P1' | 'P2';
type PieceType = 'box' | 'vertex';
type VertexOrientation = 'top-right' | 'bottom-left';

interface Position {
  row: number;
  col: number;
}

interface Piece {
  id: string;
  type: PieceType;
  player: Player;
  position: Position;
  orientation?: VertexOrientation;
}

interface Blocker {
  from: Position;
  to: Position;
}

interface GameState {
  boardSize: number;
  pieces: Piece[];
  blockers: Blocker[];
  currentPlayer: Player;
  winner: Player | null;
  validMoves: Position[];
  eliminatedVertices: string[];
}

export class GameRoom {
  private roomId: string;
  private players: Map<string, Player>;
  private gameState: GameState;
  
  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = new Map();
    this.gameState = this.initializeGame();
  }
  
  private initializeGame(): GameState {
    const boardSize = 6;
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
    
    // Crear vértices para P1 (orientación top-right)
    for (let i = 1; i < boardSize; i++) {
      pieces.push({
        id: `vertex-p1-${i}`,
        type: 'vertex',
        player: 'P1',
        position: { row: boardSize - 1, col: i },
        orientation: 'top-right'
      });
    }
    
    // Crear vértices para P2 (orientación bottom-left)
    for (let i = 0; i < boardSize - 1; i++) {
      pieces.push({
        id: `vertex-p2-${i}`,
        type: 'vertex',
        player: 'P2',
        position: { row: 0, col: i },
        orientation: 'bottom-left'
      });
    }
    
    return {
      boardSize,
      pieces,
      blockers: [],
      currentPlayer: 'P1',
      winner: null,
      validMoves: [],
      eliminatedVertices: []
    };
  }
  
  addPlayer(socketId: string, player: Player) {
    this.players.set(socketId, player);
  }
  
  isFull(): boolean {
    return this.players.size >= 2;
  }
  
  getState(): GameState {
    return this.gameState;
  }
  
  getValidMoves(socketId: string): Position[] {
    const player = this.players.get(socketId);
    if (player !== this.gameState.currentPlayer) return [];
    
    const box = this.gameState.pieces.find(p => p.type === 'box' && p.player === player);
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
      
      if (this.isValidMove(box, newPos, dir)) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  private isValidMove(box: Piece, newPos: Position, direction: any): boolean {
    if (newPos.row < 0 || newPos.row >= this.gameState.boardSize || 
        newPos.col < 0 || newPos.col >= this.gameState.boardSize) {
      return false;
    }
    
    const enemyBox = this.gameState.pieces.find(p => p.type === 'box' && p.player !== box.player);
    if (enemyBox && this.isAdjacent(newPos, enemyBox.position)) {
      return false;
    }
    
    // Verificar si hay pieza enemiga en destino (caja o vértice)
    const enemyPieceAtDestination = this.gameState.pieces.find(p => 
      p.position.row === newPos.row && 
      p.position.col === newPos.col &&
      p.player !== box.player
    );
    
    if (enemyPieceAtDestination) {
      return false;
    }
    
    // Verificar límite de 3 cajas por casillero
    const boxesAtDestination = this.gameState.pieces.filter(p => 
      p.type === 'box' && 
      p.position.row === newPos.row && 
      p.position.col === newPos.col
    );
    
    if (boxesAtDestination.length >= 3) {
      return false;
    }
    
    // Verificar si hay vértices propios en el destino
    const verticesAtDestination = this.gameState.pieces.filter(p => 
      p.type === 'vertex' && 
      p.player === box.player &&
      p.position.row === newPos.row && 
      p.position.col === newPos.col
    );
    
    // Si hay vértices, verificar que la dirección sea válida para entrar
    if (verticesAtDestination.length > 0) {
      for (const vertex of verticesAtDestination) {
        if (!this.canEnterVertexCasillero(vertex, direction)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  private canEnterVertexCasillero(vertex: Piece, direction: any): boolean {
    if (!vertex.orientation) return true;
    
    // direction.name es la dirección del movimiento de la caja
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
  
  private isAdjacent(pos1: Position, pos2: Position): boolean {
    return Math.abs(pos1.row - pos2.row) <= 1 && Math.abs(pos1.col - pos2.col) <= 1;
  }
  
  makeMove(socketId: string, position: Position): GameState {
    const player = this.players.get(socketId);
    if (player !== this.gameState.currentPlayer) {
      return this.gameState;
    }
    
    const box = this.gameState.pieces.find(p => p.type === 'box' && p.player === player);
    if (!box) return this.gameState;
    
    const newPieces = [...this.gameState.pieces];
    const from = box.position;
    const direction = {
      row: position.row - from.row,
      col: position.col - from.col
    };
    
    // Mover vértices empujados
    const pushedVertices = this.getPushedVertices(newPieces, from, position, player);
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
    newPieces[boxIndex] = { ...newPieces[boxIndex], position };
    
    // Eliminar vértices que llegaron al objetivo
    let eliminatedVertices = [...this.gameState.eliminatedVertices];
    const goalRow = player === 'P1' ? 0 : this.gameState.boardSize - 1;
    const goalCol = player === 'P1' ? this.gameState.boardSize - 1 : 0;
    
    const verticesToRemove = newPieces.filter(p => 
      p.type === 'vertex' && 
      p.player === player &&
      p.position.row === goalRow && 
      p.position.col === goalCol
    );
    
    verticesToRemove.forEach(v => {
      eliminatedVertices.push(v.id);
    });
    
    // Remover vértices eliminados de la lista de piezas
    const filteredPieces = newPieces.filter(p => !eliminatedVertices.includes(p.id));
    
    const winner = this.checkWinner(filteredPieces, player);
    
    this.gameState = {
      ...this.gameState,
      pieces: filteredPieces,
      currentPlayer: player === 'P1' ? 'P2' : 'P1',
      validMoves: [],
      winner,
      eliminatedVertices
    };
    
    return this.gameState;
  }
  
  private getPushedVertices(pieces: Piece[], from: Position, to: Position, player: Player): Piece[] {
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
      if (this.canVertexMoveInDirection(vertex, direction)) {
        pushed.push(vertex);
      }
    });
    
    return pushed;
  }
  
  private canVertexMoveInDirection(vertex: Piece, direction: { row: number; col: number }): boolean {
    if (!vertex.orientation) return false;
    
    if (vertex.orientation === 'top-right') {
      // P1: puede moverse arriba (row -1) o derecha (col +1)
      return (direction.row === -1 && direction.col === 0) || (direction.row === 0 && direction.col === 1);
    } else {
      // P2: puede moverse abajo (row +1) o izquierda (col -1)
      return (direction.row === 1 && direction.col === 0) || (direction.row === 0 && direction.col === -1);
    }
  }
  
  private checkWinner(pieces: Piece[], currentPlayer: Player): Player | null {
    const playerVertices = pieces.filter(p => p.type === 'vertex' && p.player === currentPlayer);
    
    // Si el jugador actual no tiene vértices, ganó
    if (playerVertices.length === 0) {
      return currentPlayer;
    }
    
    return null;
  }
}
