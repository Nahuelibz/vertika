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
    
    it('should return 2 valid moves for box in corner (up and right to vertex)', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      const moves = getValidMoves(state);
      
      console.log('Initial state:');
      console.log('P1 Box:', state.pieces.find(p => p.id === 'box-p1')?.position);
      console.log('P1 Vertex-1:', state.pieces.find(p => p.id === 'vertex-p1-1')?.position);
      console.log('Valid moves:', moves);
      
      // P1 box en (5,0) debe poder ir:
      // 1. Arriba a (4,0)
      // 2. Derecha a (5,1) donde hay un vértice top-right
      expect(moves.length).toBe(2);
      expect(moves).toContainEqual({ row: 4, col: 0 }); // arriba
      expect(moves).toContainEqual({ row: 5, col: 1 }); // derecha (con vértice)
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
    
    it('should push vertex when sharing casillero and moving in valid direction', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Mover caja a la derecha (válido para top-right)
      // La caja está en (5,0) y el vértice en (5,1)
      const newState = movePiece(state, { row: 5, col: 1 });
      
      // Ahora caja y vértice comparten (5,1)
      const box = newState.pieces.find(p => p.id === 'box-p1');
      const vertex = newState.pieces.find(p => p.id === 'vertex-p1-1');
      
      expect(box?.position).toEqual({ row: 5, col: 1 });
      expect(vertex?.position).toEqual({ row: 5, col: 1 });
    });
    
    it('should move vertex with box when sharing casillero and direction is valid', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Primero mover caja para que comparta con vértice
      let newState = movePiece(state, { row: 5, col: 1 });
      
      // Cambiar turno manualmente para seguir moviendo P1
      newState.currentPlayer = 'P1';
      
      // Ahora mover a la derecha (válido para top-right)
      newState = movePiece(newState, { row: 5, col: 2 });
      
      const box = newState.pieces.find(p => p.id === 'box-p1');
      const vertex = newState.pieces.find(p => p.id === 'vertex-p1-1');
      
      // Ambos deberían estar en (5,2)
      expect(box?.position).toEqual({ row: 5, col: 2 });
      expect(vertex?.position).toEqual({ row: 5, col: 2 });
    });
    
    it('should NOT move vertex when direction is invalid for orientation', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Mover caja para compartir con vértice
      let newState = movePiece(state, { row: 5, col: 1 });
      newState.currentPlayer = 'P1';
      
      // Intentar mover hacia abajo (inválido para top-right)
      // La caja se mueve pero el vértice no
      const vertexBefore = newState.pieces.find(p => p.id === 'vertex-p1-1');
      const positionBefore = { ...vertexBefore!.position };
      
      // Mover caja hacia la izquierda (inválido para top-right)
      newState = movePiece(newState, { row: 5, col: 0 });
      
      const box = newState.pieces.find(p => p.id === 'box-p1');
      const vertex = newState.pieces.find(p => p.id === 'vertex-p1-1');
      
      expect(box?.position).toEqual({ row: 5, col: 0 });
      // Vértice debería quedarse donde estaba
      expect(vertex?.position).toEqual(positionBefore);
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
    it('should detect P1 victory when all vertices are eliminated', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Simular que todos los vértices de P1 llegaron al objetivo
      state.pieces = state.pieces.filter(p => p.player === 'P2' || p.type === 'box');
      
      const newState = movePiece(state, { row: 0, col: 5 });
      expect(newState.winner).toBe('P1');
    });
    
    it('should detect P2 victory when all vertices are eliminated', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      state.currentPlayer = 'P2';
      
      // Simular que todos los vértices de P2 llegaron al objetivo
      state.pieces = state.pieces.filter(p => p.player === 'P1' || p.type === 'box');
      
      const newState = movePiece(state, { row: 5, col: 0 });
      expect(newState.winner).toBe('P2');
    });
    
    it('should remove vertices when they reach goal', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Mover un vértice al objetivo
      const vertex = state.pieces.find(p => p.id === 'vertex-p1-1');
      if (vertex) {
        vertex.position = { row: 0, col: 5 };
      }
      
      const newState = movePiece(state, { row: 0, col: 5 });
      
      // El vértice debería estar eliminado
      const removedVertex = newState.pieces.find(p => p.id === 'vertex-p1-1');
      expect(removedVertex).toBeUndefined();
      expect(newState.eliminatedVertices).toContain('vertex-p1-1');
    });
    
    it('should not declare winner if vertices remain', () => {
      const state = initializeGame({ boardSize: 6, withBlockers: false });
      
      // Solo eliminar algunos vértices
      state.pieces = state.pieces.filter(p => p.id !== 'vertex-p1-1' && p.id !== 'vertex-p1-2');
      
      const newState = movePiece(state, { row: 4, col: 0 });
      expect(newState.winner).toBeNull();
    });
  });
});
