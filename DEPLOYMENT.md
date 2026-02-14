# Guía de Despliegue

## Instalación Local

### Requisitos
- Node.js 18+ 
- npm o yarn

### Pasos

1. Instalar dependencias raíz:
```bash
npm install
```

2. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

3. Instalar dependencias del backend:
```bash
cd ../backend
npm install
```

## Desarrollo Local

### Ejecutar Frontend (Puerto 3000)
```bash
npm run dev:frontend
```
O desde la carpeta frontend:
```bash
cd frontend
npm run dev
```

### Ejecutar Backend (Puerto 3001)
```bash
npm run dev:backend
```
O desde la carpeta backend:
```bash
cd backend
npm run dev
```

### Ejecutar Tests
```bash
cd frontend
npm test
```

Para modo watch:
```bash
npm run test:watch
```

## Despliegue en Producción

### Frontend en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura el proyecto:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. Variables de entorno en Vercel:
```
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

4. Vercel desplegará automáticamente en cada push a main

### Backend en Render

1. Crea un nuevo Web Service en Render
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - Name: `juego-vertices-backend`
   - Environment: `Node`
   - Region: Elige la más cercana
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. Variables de entorno en Render:
```
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.vercel.app
PORT=3001
```

5. Render desplegará automáticamente en cada push a main

### Alternativa: Usar render.yaml

El archivo `backend/render.yaml` permite despliegue automático:

1. En Render, ve a "Blueprint" → "New Blueprint Instance"
2. Conecta tu repositorio
3. Render detectará el archivo render.yaml y configurará todo automáticamente

## Configuración de Variables de Entorno

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Comandos Útiles

### Build para producción
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Ejecutar en producción localmente
```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

## Verificación del Despliegue

1. Frontend: Visita tu URL de Vercel
2. Backend: Verifica que el servidor responda en tu URL de Render
3. Prueba la conexión online creando una sala

## Troubleshooting

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend coincida con tu URL de Vercel
- Asegúrate de incluir el protocolo (https://)

### Socket.io no conecta
- Verifica que `NEXT_PUBLIC_API_URL` apunte a tu backend de Render
- Revisa los logs del backend en Render

### Build falla en Vercel
- Verifica que todas las dependencias estén en package.json
- Revisa los logs de build en Vercel

### Build falla en Render
- Asegúrate de que el Root Directory sea `backend`
- Verifica que el comando de build sea correcto
