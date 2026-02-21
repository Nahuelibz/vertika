import { Piece as PieceType } from '@/types/game';

interface PieceProps {
  piece: PieceType;
  isAnimating?: boolean;
  animationStyle?: React.CSSProperties;
}

export default function Piece({ piece, isAnimating = false, animationStyle }: PieceProps) {
  const baseClass = isAnimating ? 'absolute' : '';
  const animClass = isAnimating ? 'animate-move' : '';
  const color = piece.player === 'P1' ? 'bg-blue-500' : 'bg-red-500';
  
  if (piece.type === 'box') {
    // Caja más pequeña (8x8) para que quepa con vértices
    return (
      <div 
        className={`w-8 h-8 rounded ${color} ${baseClass} ${animClass}`}
        style={animationStyle}
      />
    );
  }
  
  // Vértice con barras - ocupa todo el espacio (12x12)
  const isTopRight = piece.orientation === 'top-right';
  
  return (
    <div 
      className={`w-12 h-12 relative ${baseClass} ${animClass}`}
      style={animationStyle}
    >
      {isTopRight ? (
        <>
          {/* Barra superior - más gruesa y visible */}
          <div className={`absolute top-0 left-0 right-0 h-2.5 ${color} rounded-sm`} />
          {/* Barra derecha - más gruesa y visible */}
          <div className={`absolute top-0 right-0 bottom-0 w-2.5 ${color} rounded-sm`} />
        </>
      ) : (
        <>
          {/* Barra inferior - más gruesa y visible */}
          <div className={`absolute bottom-0 left-0 right-0 h-2.5 ${color} rounded-sm`} />
          {/* Barra izquierda - más gruesa y visible */}
          <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${color} rounded-sm`} />
        </>
      )}
    </div>
  );
}
