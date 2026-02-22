# Route 66 Companion

App privada para organizar un viaje por la Ruta 66. Centraliza la información del viaje: vuelos, hoteles y excursiones, con acceso autenticado por invitación.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma v7** con **Supabase** (PostgreSQL)
- **iron-session** para autenticación por cookie cifrada
- Desplegable en **Vercel**

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/login` | Acceso con email y contraseña |
| `/cambiar-contrasena` | Cambio obligatorio en el primer login |
| `/` | Bienvenida con nombre del usuario |
| `/vuelos` | Vuelos reservados (LPA ↔ MAD ↔ ORD / LAX) |
| `/hoteles` | Hoteles con detalles de reserva por etapa |
| `/excursiones` | Actividades: helicóptero Gran Cañón, Monument Valley, Antelope Canyon, Disneyland... |

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local   # rellenar DATABASE_URL, DIRECT_URL, SHADOW_DATABASE_URL, SESSION_SECRET
pnpm dev
```

Para crear el usuario de prueba:

```bash
npx tsx prisma/seed.ts
# email: test@example.com / password: password123
```

## Build

```bash
pnpm build   # prisma generate + migrate deploy + next build
```
