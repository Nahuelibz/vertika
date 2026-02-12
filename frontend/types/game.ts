export type Player = 'P1' | 'P2';
export type PieceType = 'box' | 'vertex';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  player: Player;
  position: Position;
}

export interface Blocker {
  from: Position;
  to: Position;
}

export interface GameState {
  boardSize: number;
  pieces: Piece[];
  blockers: Blocker[];
  currentPlayer: Player;
  winner: Player | null;
  validMoves: Position[];
}

export interface GameConfig {
  boardSize: number;
  withBlockers: boolean;
}
