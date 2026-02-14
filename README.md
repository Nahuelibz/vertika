# Juego de Vértices Online

Juego de estrategia multijugador donde el objetivo es llevar todos los vértices a la esquina del oponente.

## 🎮 Características

- **Modo Local**: 2 jugadores en el mismo dispositivo
- **Modo Online**: Multijugador en tiempo real con Socket.io
- **Modo IA**: 3 niveles de dificultad (Fácil, Medio, Difícil)
- **Animaciones**: Movimientos suaves de 0.3 segundos
- **Sistema de Bloqueadores**: Obstáculos opcionales en el tablero
- **Tests Unitarios**: Cobertura completa de lógica del juego

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar todas las dependencias
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Desarrollo

```bash
# Terminal 1 - Frontend (puerto 3000)
npm run dev:frontend

# Terminal 2 - Backend (puerto 3001)
npm run dev:backend
```

Abre http://localhost:3000 en tu navegador.

### Tests

```bash
cd frontend
npm test              # Ejecutar tests una vez
npm run test:watch    # Modo watch
```

## 📁 Estructura del Proyecto

```
├── frontend/              # Aplicación Next.js
│   ├── components/       # Componentes React
│   ├── lib/             # Lógica del juego y IA
│   ├── pages/           # Páginas Next.js
│   ├── styles/          # Estilos CSS
│   └── types/           # Tipos TypeScript
├── backend/              # Servidor Node.js
│   └── src/
│       ├── index.ts     # Servidor Express + Socket.io
│       └── gameRoom.ts  # Lógica de salas
└── DEPLOYMENT.md        # Guía de despliegue
```

## 🎯 Reglas del Juego

### Objetivo
Llevar todas tus piezas (caja + vértices) a la esquina del oponente.

### Piezas
- **Caja**: Se mueve 1 casillero en 4 direcciones (arriba, abajo, izquierda, derecha)
- **Vértices**: Son empujados por la caja cuando esta se mueve

### Restricciones
- No puedes moverte a casilleros adyacentes a la caja enemiga
- Los bloqueadores (líneas rojas) impiden el paso
- No puedes moverte fuera del tablero

### Victoria
- **Coronación Total**: Todas tus piezas llegan a la esquina del oponente
- **Encierro**: El oponente no puede realizar movimientos

## 🛠️ Tecnologías

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Socket.io Client
- Jest + Testing Library

### Backend
- Node.js
- Express
- Socket.io
- TypeScript

## 📦 Despliegue

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

### Resumen

**Frontend (Vercel)**
```bash
cd frontend
npm run build
```

**Backend (Render)**
```bash
cd backend
npm run build
npm start
```

## 🧪 Testing

Los tests cubren:
- Inicialización del juego
- Movimientos válidos
- Empuje de vértices
- Condiciones de victoria
- Restricciones de movimiento

```bash
cd frontend
npm test
```

## 📝 Comandos Disponibles

```bash
# Desarrollo
npm run dev:frontend      # Iniciar frontend
npm run dev:backend       # Iniciar backend

# Build
npm run build:frontend    # Build frontend
npm run build:backend     # Build backend

# Tests
cd frontend && npm test   # Ejecutar tests
```

## 🎨 Características Visuales

- Tablero 6x6 con casilleros coloreados
- Animaciones suaves de 0.3s en movimientos
- Indicadores visuales de movimientos válidos (verde)
- Bloqueadores representados con líneas rojas gruesas
- Indicador de turno con animación de pulso
- Diseño responsive

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
