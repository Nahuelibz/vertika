type Player = 'P1' | 'P2';

interface Position {
  row: number;
  col: number;
}

interface GameState {
  boardSize: number;
  currentPlayer: Player;
  winner: Player | null;
}

export class GameRoom {
  private roomId: string;
  private players: Map<string, Player>;
  private gameState: GameState;
  
  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = new Map();
    this.gameState = {
      boardSize: 6,
      currentPlayer: 'P1',
      winner: null
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
  
  makeMove(socketId: string, position: Position): GameState {
    const player = this.players.get(socketId);
    if (player === this.gameState.currentPlayer) {
      // Lógica de movimiento
      this.gameState.currentPlayer = player === 'P1' ? 'P2' : 'P1';
    }
    return this.gameState;
  }
}
