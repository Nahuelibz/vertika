export type Player = 'P1' | 'P2';
export type PieceType = 'box' | 'vertex';
export type VertexOrientation = 'top-right' | 'bottom-left'; // P1: top-right, P2: bottom-left

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  player: Player;
  position: Position;
  orientation?: VertexOrientation; // Solo para vértices
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
  eliminatedVertices: string[]; // IDs de vértices eliminados
}

export interface GameConfig {
  boardSize: number;
  withBlockers: boolean;
}
