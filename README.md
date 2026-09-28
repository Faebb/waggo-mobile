# waggo-mobile

App de **Waggo — Plataforma Inteligente para Paseo Seguro de Perros** para iOS, Android y Web.
Expo (SDK 57) · React Native · TypeScript · Expo Router · TanStack Query · Zod · Jest + React Native Testing Library · TDD.

> Backend: [Faebb/waggo-api](https://github.com/Faebb/waggo-api)

## Requisitos
- Node.js 22 LTS
- App **Expo Go** en tu teléfono, o emulador Android / simulador iOS
- `waggo-api` corriendo (ver su README)

## Inicio rápido
```bash
npm install
cp .env.example .env        # ajusta EXPO_PUBLIC_API_URL
npm start                   # a = Android, i = iOS, w = Web
```

## Scripts
| Script | Qué hace |
|---|---|
| `npm test` | Pruebas (Jest + RNTL) |
| `npm run test:watch` | Loop TDD |
| `npm run test:coverage` | Cobertura (mínimo 80 % líneas) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config de Expo) |
| `npm run export:web` | Build web estático en `dist/` |

## Arquitectura (feature-based)
```
src/
  app/                 → SOLO rutas de Expo Router (pantallas delgadas)
  features/
    pricing/           → un folder por módulo de negocio
      api/             → llamadas HTTP + esquemas Zod
      hooks/           → hooks de TanStack Query
      components/      → UI presentacional
      screens/         → pantallas que orquestan datos
      model/           → tipos y lógica pura
      index.ts         → API pública de la feature
  shared/              → api (httpClient), config (env), ui (componentes base, tema)
  test/                → utilidades de prueba
```
Reglas: `app → features → shared`; una feature solo se importa por su `index.ts`; las pruebas van junto al archivo.

## Flujo TDD
1. 🔴 Prueba que falla (de afuera hacia adentro: pantalla → componente/hook → lógica pura).
2. 🟢 Código mínimo para pasar.
3. 🔵 Refactor con las pruebas en verde.

Commits: `test(pricing): …` → `feat(pricing): …` → `refactor(pricing): …`

## Slice de ejemplo: cotización de tarifa (RF-019)
`src/features/pricing` — el dueño elige tipo y duración y ve el precio antes de confirmar. Consume `GET /api/v1/pricing/quote`.

## Docker (versión web)
```bash
docker build -t waggo-web --build-arg EXPO_PUBLIC_API_URL=http://localhost:8080 .
docker run -p 8081:80 waggo-web      # http://localhost:8081
```
Las apps nativas se compilan con **EAS Build** (`npx eas-cli@latest build`), no con Docker.
