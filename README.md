# Juego de Vértices Online

Juego de estrategia multijugador donde el objetivo es llevar todos los vértices a la esquina del oponente.

## Estructura del Proyecto

- `frontend/` - Aplicación Next.js (Vercel)
- `backend/` - Servidor Node.js/Express con Socket.io (Render)

## Desarrollo Local

```bash
# Instalar dependencias
npm install
cd frontend && npm install
cd ../backend && npm install

# Ejecutar frontend
npm run dev:frontend

# Ejecutar backend
npm run dev:backend
```

## Despliegue

- Frontend: Vercel (automático desde GitHub)
- Backend: Render (automático desde GitHub)
