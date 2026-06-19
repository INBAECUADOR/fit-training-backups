# Fit Training App

Plataforma de entrenamiento personalizado con IA. Creada por el Ing. Jose Luis Enriquez.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Chart.js + Lucide Icons
- **Backend**: Express + SQL.js (SQLite WebAssembly)
- **Auth**: JWT (access + refresh tokens) + bcrypt

## Estructura

```
/
├── backend/
│   └── src/
│       ├── index.js          # Express server entry
│       ├── database.js       # SQLite init + schema
│       ├── migrate.js        # Migrations + seeding
│       ├── seed.js           # Global exercises + test users
│       ├── foods-db.js       # Local food database
│       ├── middleware/
│       │   ├── auth.js       # JWT auth middleware
│       │   └── upload.js     # File upload validation
│       └── routes/           # API routes (13 modules)
├── frontend/
│   └── src/
│       ├── App.jsx           # Router + auth guards
│       ├── api.js            # Axios client + interceptors
│       ├── pages/            # Route pages
│       └── components/       # Shared components
├── railway.json              # Railway deploy config
└── .env.example              # Environment variables
```

## Setup Local

```bash
git clone <repo>
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm run build   # builds frontend
npm start       # starts backend on :3001
```

Para desarrollo:
```bash
cd frontend && npm run dev   # Vite dev server :5173
cd backend && npm run dev    # Backend :3001
```

## Railway Deploy

Conectá el repo a Railway. El `railway.json` maneja build y start automáticamente.

Variables de entorno requeridas:
- `JWT_SECRET` — secreto para firmar tokens
- `PORT` — puerto (Railway lo asigna automáticamente)

## Features

- Rutinas personalizadas con ejercicios del catálogo
- Dietas por día y tipo de comida
- Seguimiento de medidas corporales con fotos
- Agente IA para generar planes
- Dashboard con estadísticas y evolución
- Admin multi-usuario
- Exportación a CSV
- Landing page pública
- SEO dinámico por página
