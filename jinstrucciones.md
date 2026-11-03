# 💻 Qué debes hacer

## Fase 1 — Explorar la API

- Con el backend en marcha, mapea endpoints, formas de respuesta y parámetros de query de las tres funcionalidades usando `/docs`.
- Contrasta con patrones de fetch existentes en el frontend del repo cuando ayude.
- Anota desajustes entre wording del PM y campos reales de la API; resuélvelos en la spec, no en la implementación.
- Opcional: rastro corto de verificación en mensajes de commit o `verification.md`.

## Fase 2 — Tipos TypeScript

- redacta `frontend/specs/api-types.ts` con interfaces para respuestas usadas por las tres funcionalidades:
  - `FacetResponse` → referencia de rango de fechas y vista B2B vs B2C
  - `AlertTiny`, `AlertResponse` → tabla o anomalías
  - `CategoryEntry`, `TopCategoriesResponse` → tabla comparativa B2B vs B2C
- redacta `frontend/specs/path-types.ts` con tipos de parámetros de query:
  - `DateRangeFilter` → fechas opcionales de inicio/fin como `string` en formato `YYYY-MM-DD`
  - `AlertParams` → threshold más filtro de fechas
  - `TopCategoriesParams` → tipo de operación, limit y filtro de fechas
- Verifica cada nombre y tipo de propiedad contra `/docs`. TypeScript estricto, sin `any`, sin `object`.
- Cada propiedad necesita JSDoc significativo, valores válidos y formato cuando aplique.
- Commit tipos verificados contra OpenAPI.

---

## Fase 3 — Especificación de componentes

- Redacta `frontend/specs/components.md` por funcionalidad.
- Alinea props de componentes con tipos de la Fase 2; resuelve ambigüedades que el brief del PM deje abiertas.
- Commit spec de componentes.

---

## Fase 4 — Documentación del contrato de datos

- redacta `frontend/specs/README.md` cubriendo las tres funcionalidades:
  - Endpoints que consume cada una (rutas verificadas en `/docs`)
  - Tipos TypeScript de cada petición y respuesta
  - Valores válidos y restricciones de cada parámetro
  - Al menos 2 casos límite por funcionalidad que debe mostrar la UI
- Léelo como si se lo entregaras a una sesión nueva del agent; corrige lo que provocaría preguntas de seguimiento.
- Ejecuta `npx tsc --noEmit` y corrige errores de tipos.
- Commit README de contrato de datos.

> ⚠️ IMPORTANTE: Esta especificación es para frontend, no implementación. No construyas componentes React ni conectes llamadas a la API. Entrégales: tipos, contrato y documentación.

---
# ✅ Qué vamos a evaluar

- Evidencia de exploración de API: tipos y endpoints trazables a `/docs`, no nombres de campo inventados.
- Todas las interfaces de respuesta coinciden con OpenAPI en vivo, sin `any`.
- `DateRangeFilter` define ambos campos opcionales, tipados como `string` con JSDoc `YYYY-MM-DD`.
- `AlertsParams` y `TopCategoriesParams` extienden o incluyen `DateRangeFilter`.
- `components.md` nombra cada componente, lista props con tipos y especifica renderizado condicional por funcionalidad.
- Estado vacío de la tabla de anomalías especificado explícitamente.
- Comportamiento con un solo input de fecha especificado explícitamente.
- Ambos paneles B2B vs B2C especifican renderizado vacío de top-5.
- `frontend/specs/README.md` cubre las tres funcionalidades con endpoints, tipos, parámetros y ≥ 2 casos límite cada una.
- TypeScript compila (`npx tsc --noEmit`).
- Trabajo en `feature/frontend-specs` con commits significativos; specs se leen como trabajo asistido por agent que verificaste.
- Sin componentes React, llamadas fetch ni cambios de backend.

> Nota: La implementación queda fuera de alcance. La barra es una spec lo bastante buena para que un coding agent construya sin preguntas.