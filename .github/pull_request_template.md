<!-- Título del PR = commit en main (squash and merge). Formato Conventional Commits: feat(<modulo>): <resumen> (RF-XXX) -->

## ¿Qué cambia?
<!-- Descripción breve + captura si hay UI -->

## Requerimiento
- RF / historia: <!-- ej. RF-019 · WAG-12 -->

## Evidencia TDD
- [ ] La prueba se escribió antes que el código (commit `test(...)` antes de `feat(...)`)
- Pruebas agregadas/modificadas:
  -

## Checklist (Definition of Done)
- [ ] `npm test`, `npm run typecheck` y `npm run lint` pasan
- [ ] Probado en al menos una plataforma (iOS / Android / Web)
- [ ] Si depende de un cambio de API: PR enlazado en `waggo-api`
