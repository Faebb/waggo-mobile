This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Waggo project rules

This section is enough to work inside this repo. For the full workflow (specs, TDD agents, checklists), open Claude from the sibling repo `../waggo-workspace` (see its README).

- **API envelope**: every backend response is a `WaggoApiResponse` (`success`, `data`, `pagination`, `errors`, `warnings`, `infos`, `traceId`). `src/shared/api/httpClient.ts` unwraps it and throws `ApiError` on errors; features never parse the envelope themselves.
- **Code conventions (ADR-008, enforced by ESLint + Prettier)**: named exports only (default only in `src/app/**`), `type` not `interface`, no `any`, `import type`, import a feature only through its `index.ts`, `===`, no `console.log`. Files: `PascalCase.tsx` components, `useX.ts` hooks, `camelCase.ts` modules. UI text in Spanish. Run `npm run format` and `npm run lint`. Guide: vault `03 Desarrollo/Convenciones de código.md`.
- **Visual design (ADR-013)**: mobile first (content in a column of at most 480 px, main action at the bottom), dark theme with yellow `#FFC527` as the only accent, Helvetica, Swiss style without emojis or decorative icons. Screens use only the tokens in `src/shared/ui/theme.ts` (`colors`, `typography`, `spacing`, `radius`).
- **TDD is mandatory**: write the failing test first (`*.test.ts(x)` next to the file), then the code, then refactor.
- Architecture is **feature-based**: `src/app` (routes only) → `src/features/<feature>` → `src/shared`. A feature exposes its public API through `index.ts`; never import another feature's internals.
- Server state with TanStack Query hooks inside the feature; API responses validated with Zod.
- Tests use React Native Testing Library v14 (`await render(...)`, `userEvent`, query by role/label/text).
- Run `npm run typecheck`, `npm run lint` and `npm test` before declaring a task done.
- Project docs (Spanish) live in the Obsidian vault "Vault Waggo", expected at `../../../Vault Waggo` from this repo (disk layout in `waggo-workspace/README.md`; another path can be set with `WAGGO_VAULT`). Index: `00 - MOC Waggo.md`. Relevant notes: `02 Arquitectura/Frontend - Expo feature-based.md`, ADRs in `02 Arquitectura/ADR/`, `03 Desarrollo/Flujo TDD.md`, glossary `01 Proyecto/Glosario.md`. If the vault is not available, work from this file and the code, and say which note you could not read.
- When a change closes or alters an RF, update `04 Planeación/Estado de implementación.md`. When it changes a decision, dependencies or structure, update the matching note or ADR.
