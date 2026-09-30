# waggo-mobile

App de **Waggo — Plataforma Inteligente para Paseo Seguro de Perros** para iOS, Android y Web.

Waggo conecta a dueños de perros con paseadores **verificados**: el dueño solicita un paseo, sigue el recorrido en vivo y paga solo cuando el servicio termina bien. Esta app es lo que usan dueños y paseadores; todos los datos vienen de [waggo-api](https://github.com/Faebb/waggo-api).

Expo (SDK 57) · React Native · TypeScript · Expo Router · TanStack Query · Zod · Jest + React Native Testing Library · TDD.

> Backend: [Faebb/waggo-api](https://github.com/Faebb/waggo-api) · Cómo usar todo en conjunto: [Faebb/waggo-workspace](https://github.com/Faebb/waggo-workspace)

## Requisitos
- Node.js 22 LTS
- App **Expo Go** en tu teléfono, o emulador Android / simulador iOS
- `waggo-api` corriendo (ver su README)

## Dueño y paseador en desarrollo
Mientras no exista el login (ADR-011), la app elige su identidad con los headers de desarrollo de waggo-api: `/paseador` y sus pantallas van como el paseador `dev-walker`, y el resto como el dueño `dev-owner` (`src/shared/api/devIdentity.ts`). Desde la bienvenida: "Quiero pasear a mi perro" o "Soy paseador". Se borra cuando llegue el login.

## Inicio rápido
```bash
npm install
cp .env.example .env        # ajusta EXPO_PUBLIC_API_URL (por defecto http://localhost:8080)
npm start                   # a = Android, i = iOS, w = Web
```

## Scripts
| Script | Qué hace |
|---|---|
| `npm test` | Pruebas (Jest + RNTL) |
| `npm run test:watch` | Loop TDD |
| `npm run test:coverage` | Cobertura (mínimo 80 % líneas) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config de Expo + convenciones del proyecto) |
| `npm run format` / `format:check` | Prettier |
| `npm run export:web` | Build web estático en `dist/` |

## Arquitectura (feature-based)
```
src/
  app/                 → SOLO rutas de Expo Router (pantallas delgadas): / bienvenida · /inicio · /paseos · /paseos/nuevo · /paseos/[id] · /mascotas · /mascotas/nueva · /paseador · /paseador/[id] · /paseos/[id]/chat · /paseador/[id]/chat · /cotizar
  features/
    onboarding/        → pantalla de bienvenida (UX-001)
    home/              → inicio del dueño, estilo Uber: "¿Quién sale a pasear hoy?" (RF-007)
    walks/             → pedir paseo, estado del paseo y mis paseos (RF-007)
    walker/            → lado del paseador: registro y verificación, solicitudes cercanas, aceptar, iniciar y terminar (RF-002, RF-003, RF-007, RF-008)
    tracking/          → ruta en vivo (SVG), métricas, envío de la posición, emergencias y alertas automáticas (RF-008 – RF-012)
    messaging/         → chat del dueño con el paseador durante el paseo (RF-013)
    pets/              → mis perros y agregar perro (RF-004)
    pricing/           → un folder por módulo de negocio (cotizador RF-019)
      api/             → llamadas HTTP + esquemas Zod
      hooks/           → hooks de TanStack Query
      components/      → UI presentacional
      screens/         → pantallas que orquestan datos
      model/           → tipos y lógica pura
      index.ts         → API pública de la feature
  shared/              → api (httpClient, ApiError), config (env), ui (Button, ChipGroup, TextField, ActionFooter, tema oscuro con amarillo y Helvetica)
  test/                → utilidades de prueba: renderWithProviders, mockApi (API falsa por ruta), fixtures
```
- Reglas: `app → features → shared`; una feature solo se importa por su `index.ts`; las pruebas van junto al archivo.
- Toda respuesta del backend viene en `WaggoApiResponse`; `shared/api/httpClient` la desenvuelve y lanza `ApiError` con los mensajes en español y el `traceId`.

## Convenciones (ADR-008, ADR-013)
Solo exports con nombre (default solo en `src/app`), `type` en lugar de `interface`, sin `any`, textos de la UI en español. ESLint y Prettier las hacen cumplir en local y en CI.

Diseño (ADR-013): mobile first, tema oscuro con amarillo como único acento y Helvetica. Las pantallas solo usan los tokens de `src/shared/ui/theme.ts` (`layout.column` para la columna de 480 px) y ponen sus acciones principales en `ActionFooter`.

## Flujo TDD
1. 🔴 Prueba que falla (de afuera hacia adentro: pantalla → componente/hook → lógica pura).
2. 🟢 Código mínimo para pasar.
3. 🔵 Refactor con las pruebas en verde.

Commits: `test(pricing): …` → `feat(pricing): …` → `refactor(pricing): …`. Los PR entran con *squash and merge* y su título se valida en CI.

## Trabajar con Claude Code
- `AGENTS.md` (cargado por `CLAUDE.md`) tiene las reglas del repo: basta con clonar y abrir `claude` aquí para trabajar solo en la app.
- Para el flujo completo (specs, agentes TDD, checklists, backend + mobile) abre Claude desde [waggo-workspace](https://github.com/Faebb/waggo-workspace).

## Slice de ejemplo: cotización de tarifa (RF-019)
`src/features/pricing` — el dueño elige tipo y duración y ve el precio antes de confirmar. Consume `GET /api/v1/pricing/quote`.

## Docker (versión web)
```bash
docker build -t waggo-web --build-arg EXPO_PUBLIC_API_URL=http://localhost:8080 .
docker run -p 8081:80 waggo-web      # http://localhost:8081
```
Las apps nativas se compilan con **EAS Build** (`npx eas-cli@latest build`), no con Docker.

## Licencia
[MIT](LICENSE)
