# 💻 Qué debes hacer

## 1. Descubrir y cargar las skills proporcionadas

- Ejecuta `npx skills find accessibility` y revisa qué cubre la skill antes de aplicarla.
- Ejecuta `npx skills find vercel-react-best-practices` y revísala.
- Carga ambas skills en tu coding agent y lee qué instrucciones le dan al agent.

## 2. Aplicar la skill `accessibility`

- Con la skill cargada, audita el dashboard y propon correcciones.
- Revisa cada propuesta; acepta solo cambios que puedas ligar a un archivo real e instrucción de la skill.
- Verifica resultados: accesibilidad por teclado en elementos interactivos, `aria-*` / `role` correctos donde haga falta, `alt` en imágenes/iconos, contraste básico en textos y controles.
- Commit con mensaje que referencie la skill `accessibility`.

## 3. Aplicar la skill `vercel-react-best-practices`

- Con la skill cargada, audita patrones frontend orientados a despliegue y aplica correcciones.
- Revisa propuestas contra la skill — p. ej. `next/image` donde corresponda, metadata de página, anti-patrones de layout shift y fuentes que la skill señale.
- Ejecuta el comando de build del frontend documentado en este repo; confirma que pasa sin advertencias nuevas injustificadas.
- Commit con mensaje que referencie la skill `vercel-react-best-practices`.

## 4. Explorar el ecosistema

- Ejecuta `npx skills find <tema>` sobre al menos dos temas relevantes (p. ej. `performance`, `seo`, `forms`, `typescript`, `testing`).
- Aplica al menos una skill adicional que consideres valiosa. Justifica la elección en el memory bank o notas del PR.

## 5. Escribir una skill interna del proyecto

- identifica un gap específico de este repo que las skills comunitarias no cubren bien — p. ej. convenciones de commits, pasos de despliegue de este dashboard, checks de testing/QA antes del merge, reglas de formateo de datos, patrones de uso de API o convenciones UI del dashboard descubiertas en el codebase.
- redacta el archivo de skill; tú lo refinas a la estructura de clase: objetivo claro, inputs definidos, output esperado, criterios de aceptación.
- Guárdalo en `.skills/` y cárgalo en el agent para verificar que produce guía accionable en una tarea real de este repo.

## 6. Actualizar el memory bank

- Actualiza `memory-bank/progress.md` (o equivalente) con: skills aplicadas, cambios verificados, skill del ecosistema elegida (y por qué) y la skill interna que creaste.

> ⚠️ IMPORTANTE: No reescribas el dashboard desde cero. Mejora dirigida vía skills — cada cambio trazable a una instrucción de skill. Tú verificas; el agent implementa.

---

# ✅ Qué vamos a evaluar

- Las skills `accessibility` y `vercel-react-best-practices` fueron cargadas y aplicadas — mejoras visibles y trazables a las instrucciones de cada skill.
- Resultados de accesibilidad verificados: navegación por teclado funciona, atributos `aria-*` correctos donde haga falta, `alt` presente, contraste pasa comprobaciones básicas.
- El build del frontend pasa usando el comando documentado en este repo, sin advertencias nuevas injustificadas.
- Al menos una skill adicional descubierta con `npx skills find` y aplicada con justificación escrita.
- Existe una skill interna en `.skills/`, bien estructurada (objetivo, inputs, outputs, criterios de aceptación), con guía específica del proyecto — commits, despliegue, testing/QA u otro tema derivado del repo, no relleno genérico.
- El memory bank refleja con precisión el trabajo de la sesión.
- Cambios en `feature/agent-skills` con commits claros — lo ideal es un commit por skill aplicada.
- El trabajo se lee como mejora impulsada por agent sobre un codebase heredado que tú verificaste — no ediciones masivas sin revisar.

> Nota: La calidad de la skill interna se evalúa por claridad y especificidad, no por longitud. Una skill corta y precisa vale más que una larga y vaga.