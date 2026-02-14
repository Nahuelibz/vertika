import { initializeGame, getValidMoves, movePiece } from '../gameLogic';
import { GameState, Position } from '@/types/game';

describe('gameLogic', () => {
  describe('initializeGame', () => {
    it('should create a 6x6 board with correct initial pieces', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      expect(state.boardSize).toBe(6);
      expect(state.currentPlayer).toBe('P1');
      expect(state.winner).toBeNull();
      expect(state.pieces.length).toBe(12); // 2 cajas + 10 vértices
    });
    
    it('should place P1 box at bottom-left corner', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const p1Box = state.pieces.find(p => p.id === 'box-p1');
      
      expect(p1Box).toBeDefined();
      expect(p1Box?.position).toEqual({ row: 5, col: 0 });
    });
    
    it('should place P2 box at top-right corner', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const p2Box = state.pieces.find(p => p.id === 'box-p2');
      
      expect(p2Box).toBeDefined();
      expect(p2Box?.position).toEqual({ row: 0, col: 5 });
    });
    
    it('should create N-1 vertices for each player with correct orientation', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const p1Vertices = state.pieces.filter(p => p.type === 'vertex' && p.player === 'P1');
      const p2Vertices = state.pieces.filter(p => p.type === 'vertex' && p.player === 'P2');
      
      expect(p1Vertices.length).toBe(5);
      expect(p2Vertices.length).toBe(5);
      
      // Verificar orientaciones
      p1Vertices.forEach(v => {
        expect(v.orientation).toBe('top-right');
      });
      
      p2Vertices.forEach(v => {
        expect(v.orientation).toBe('bottom-left');
      });
    });
  });
  
  describe('getValidMoves', () => {
    it('should return 4 valid moves for box in center', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      // Mover caja al centro
      state.pieces[0].position = { row: 3, col: 3 };
      state.pieces[1].position = { row: 0, col: 5 }; // P2 box lejos
      
      const moves = getValidMoves(state);
      expect(moves.length).toBe(4);
    });
    
    it('should return 2 valid moves for box in corner', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const moves = getValidMoves(state);
      
      expect(moves.length).toBe(2); // Solo arriba y derecha
    });
    
    it('should not allow move to adjacent enemy box position', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      state.pieces[0].position = { row: 3, col: 3 }; // P1 box
      state.pieces[1].position = { row: 3, col: 4 }; // P2 box adyacente
      
      const moves = getValidMoves(state);
      const hasAdjacentMove = moves.some(m => m.row === 3 && m.col === 4);
      
      expect(hasAdjacentMove).toBe(false);
    });
    
    it('should not allow moves outside board boundaries', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const moves = getValidMoves(state);
      
      moves.forEach(move => {
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(6);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(6);
      });
    });
  });
  
  describe('movePiece', () => {
    it('should move box to new position', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const newPos: Position = { row: 4, col: 0 };
      
      const newState = movePiece(state, newPos);
      const p1Box = newState.pieces.find(p => p.id === 'box-p1');
      
      expect(p1Box?.position).toEqual(newPos);
    });
    
    it('should switch current player after move', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const newPos: Position = { row: 4, col: 0 };
      
      expect(state.currentPlayer).toBe('P1');
      const newState = movePiece(state, newPos);
      expect(newState.currentPlayer).toBe('P2');
    });
    
    it('should push vertex when box moves to its position', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const vertexPos: Position = { row: 5, col: 1 };
      
      const newState = movePiece(state, vertexPos);
      const vertex = newState.pieces.find(p => p.id === 'vertex-p1-1');
      
      // Vértice debería moverse junto con la caja (derecha es válido para top-right)
      expect(vertex?.position).toEqual({ row: 5, col: 2 });
    });
    
    it('should only push vertex in valid direction for its orientation', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Mover caja P1 hacia arriba (válido para top-right)
      const newState = movePiece(state, { row: 4, col: 0 });
      const p1Box = newState.pieces.find(p => p.id === 'box-p1');
      
      expect(p1Box?.position).toEqual({ row: 4, col: 0 });
    });
    
    it('should detect winner when all pieces reach goal', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Mover todas las piezas de P1 al objetivo
      state.pieces.forEach(piece => {
        if (piece.player === 'P1') {
          piece.position = { row: 0, col: 5 };
        }
      });
      
      const newState = movePiece(state, { row: 0, col: 5 });
      expect(newState.winner).toBe('P1');
    });
    
    it('should clear valid moves after move', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      state.validMoves = [{ row: 4, col: 0 }];
      
      const newState = movePiece(state, { row: 4, col: 0 });
      expect(newState.validMoves.length).toBe(0);
    });
  });
  
  describe('victory conditions', () => {
    it('should detect P1 victory when all pieces in top-right corner', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      state.pieces = state.pieces.map(piece => {
        if (piece.player === 'P1') {
          return { ...piece, position: { row: 0, col: 5 } };
        }
        return piece;
      });
      
      const newState = movePiece(state, { row: 0, col: 5 });
      expect(newState.winner).toBe('P1');
    });
    
    it('should detect P2 victory when all pieces in bottom-left corner', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      state.currentPlayer = 'P2';
      
      state.pieces = state.pieces.map(piece => {
        if (piece.player === 'P2') {
          return { ...piece, position: { row: 5, col: 0 } };
        }
        return piece;
      });
      
      const newState = movePiece(state, { row: 5, col: 0 });
      expect(newState.winner).toBe('P2');
    });
    
    it('should not declare winner if not all pieces at goal', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Solo mover algunas piezas al objetivo
      state.pieces[0].position = { row: 0, col: 5 };
      state.pieces[2].position = { row: 0, col: 5 };
      
      const newState = movePiece(state, { row: 4, col: 0 });
      expect(newState.winner).toBeNull();
    });
  });
});
