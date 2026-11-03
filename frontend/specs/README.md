# Contrato de datos para nuevas funcionalidades

Especificación de referencia para implementar el frontend; **no** implementa componentes, fetch ni cambios backend. Los endpoints y esquemas descritos corresponden a `backend/app/routes.py` y sus modelos Pydantic (documentados por FastAPI en `/docs`). Los tipos locales están en `api-types.ts` y `path-types.ts`. TypeScript describe las formas esperadas, pero no valida respuestas JSON en runtime.

## Convenciones compartidas

- Las fechas se envían como query params `start_date` y `end_date`, formato `YYYY-MM-DD`, cada una opcional e inclusiva. Se puede enviar solo una, ambas o ninguna. Si se omiten ambas, el endpoint no acota por fecha.
- Ninguna ruta revisada declara una validación de orden para `start_date` y `end_date`. La UI debe detectar un rango invertido, mostrarlo como inválido y no enviarlo hasta corregirlo/limpiarlo; no debe atribuir a la API un rechazo garantizado.
- Los campos numéricos de importes y ratios son `number` en TypeScript y valores numéricos en JSON. Los tipos no fijan formato monetario ni precisión visual.
- Una respuesta vacía de lista se representa como `[]`; no equivale a error HTTP ni a carga. Los errores de petición se muestran como error, no como estado vacío.
- Los valores por defecto indicados son los del servidor al omitir el query param. La interfaz puede enviar valores explícitos cuando el producto requiere un valor inicial distinto.

## Funcionalidad 1 — Filtro de rango de fechas del dashboard

### Endpoints y tipos

| Uso | Endpoint | Tipo de petición | Tipo de respuesta |
|---|---|---|---|
| Obtener movimientos filtrados para KPIs y gráficos existentes | `GET /api/metrics` | `MetricsParams` (`DateRangeFilter` más filtros opcionales de categoría y operación) | `FinancialMovement[]` de `../src/lib/financial-types.ts`; campos: `create_date`, `amount`, `operation_type`, `category`, `business_type` |
| Obtener extremos del dataset para orientar el selector | `GET /api/metrics/facets` | Sin parámetros | `FacetResponse` |

`FacetResponse` contiene `operation_types`, `business_types`, `categories`, `min_date` y `max_date`. Las listas son los valores disponibles en el conjunto completo y **no** se segmentan por B2B/B2C. `min_date` y `max_date` tienen formato de fecha y pueden ser `null` si no hay movimientos.

### Parámetros y restricciones

- `start_date?: string`, `end_date?: string`: fechas ISO `YYYY-MM-DD`, ambas inclusivas y opcionales.
- `category?: Category`: `suppliers | sales | operational | administrative | others`.
- `operation_type?: OperationType`: `income | outcome`.
- No enviar strings vacíos como fechas; omitir el parámetro para dejar ese lado sin límite.
- El filtro de fecha debe propagarse a cada consulta que alimente la vista. El endpoint de facets no acepta fechas y sirve de referencia global, no de opciones ya filtradas.

### Casos límite que debe mostrar/manejar la UI

1. **Ambos campos vacíos:** omitir ambos query params; presentar los datos disponibles sin límite de fecha y conservar el selector visible.
2. **Solo inicio o solo fin:** enviar únicamente `start_date` o `end_date`; aplicar el límite inclusivo y no completar el extremo faltante con una fecha inventada.
3. **Rango invertido:** marcarlo como inválido y no aplicar/emitir ese rango hasta corregir o limpiar un valor. El contrato no garantiza que la API lo rechace.
4. **Dataset vacío:** facets puede devolver listas vacías y `min_date: null`, `max_date: null`; informar que no hay límites de referencia disponibles, sin fabricar fechas.

## Funcionalidad 2 — Tabla de alertas de egresos

### Endpoint y tipos

`GET /api/metrics/alerts` devuelve `AlertResponse` (`AlertTiny[]`). Cada item incluye:

- `period: string`: clave agrupada del período.
- `outcome_total: number`: total de egresos del período.
- `baseline_average: number`: promedio de egresos de **todos los períodos anteriores presentes en el resumen filtrado**.
- `increase_ratio: number`: aumento relativo como ratio; por ejemplo `0.3` equivale a 30%.

La tabla especificada tiene columnas período, egreso, baseline real de la API y aumento porcentual (`increase_ratio × 100` solo para presentación). El requisito del PM de comparar contra solo tres períodos anteriores no coincide con el baseline del endpoint actual. No etiquetar ni presentar el campo existente como media móvil de tres períodos.

### Parámetros y restricciones

Se tipan en `AlertsParams`, que extiende `DateRangeFilter`:

| Parámetro | Tipo / valores | Default / restricción del endpoint |
|---|---|---|
| `threshold` | `number`, ratio | `0.3`; mínimo `0`; no hay máximo declarado. El control de producto restringe la entrada a `0.01–1.0`, sin afirmar que sea límite de API. |
| `group_by` | `GroupBy`: `day \| week \| month` | `month` |
| `start_date`, `end_date` | `string` `YYYY-MM-DD`, opcionales e inclusivas | Sin límites si se omiten; se puede enviar solo uno. |
| `business_type` | `BusinessType`: `B2B \| B2C` | Sin filtro de segmento al omitirlo. |

El endpoint detecta aumento estrictamente superior al umbral (`increase_ratio > threshold`); requiere baseline mayor que cero para calcular alerta. La respuesta es una lista, no un objeto contenedor.

### Casos límite que debe mostrar/manejar la UI

1. **Respuesta `[]`:** mantener título, controles, encabezados y tabla; indicar que no hay anomalías para los filtros seleccionados. No sustituirla por un error.
2. **Historial insuficiente o baseline cero:** puede no haber alertas porque el endpoint necesita períodos anteriores y baseline positivo; mostrar el estado vacío normal, sin inferir un fallo.
3. **Umbral fuera del rango de UI:** rechazar/validar el valor antes de emitirlo (`0.01–1.0`); no enviar `NaN`. El servidor permite valores desde cero y no declara máximo, pero el control sigue la restricción de producto.
4. **Error HTTP:** mostrar el error de la sección y no el mensaje de lista vacía.

## Funcionalidad 3 — Comparativa B2B vs B2C por categoría e ingresos

### Endpoints y tipos

Cada grupo requiere solicitudes filtradas por el mismo rango:

| Uso | Endpoint | Tipo de petición | Tipo de respuesta |
|---|---|---|---|
| Top de categorías de ingreso del panel B2B o B2C | `GET /api/metrics/categories/top` | `TopCategoriesParams` | `TopCategoriesResponse` (`CategoryEntry[]`) |
| Total completo de ingresos por período, para calcular el denominador y el gráfico | `GET /api/metrics/summary` | `SummaryParams` | `SummaryResponse` (`SummaryItem[]`) |
| Referencia global de fechas/catálogos, si la vista la necesita | `GET /api/metrics/facets` | Sin parámetros | `FacetResponse` |

Para cada segmento solicitar top categorías con `operation_type: "income"`, `limit: 5` y `business_type: "B2B"` o `"B2C"`. Solicitar también summary para ese segmento y rango, sumando el campo `income` de todos los períodos devueltos para obtener el total de grupo. Usar ese total como denominador y como valor del gráfico. Las peticiones de top y summary deben compartir filtros y límites.

`CategoryEntry` tiene `category`, `operation_type` y `total_amount`; **no** contiene porcentaje ni total completo del grupo. El porcentaje mostrado se calcula como `total_amount / groupIncomeTotal × 100`. No usar la suma del top-5 como denominador: puede excluir otras categorías. `SummaryItem` tiene `period`, `income`, `outcome`, `net`; summary también acepta `group_by` (`day | week | month`, default `month`), opcionalmente `category`, `operation_type`, `business_type` y fechas.

`GET /api/metrics/comparison` no es el origen de este gráfico: compara netos del intervalo actual y anterior, requiere ambas fechas y no calcula totales de ingreso comparando B2B con B2C.

### Parámetros y restricciones

Para `TopCategoriesParams`:

| Parámetro | Tipo / valores | Default / restricción del endpoint |
|---|---|---|
| `operation_type` | `OperationType`: `income \| outcome` | `outcome`; esta vista debe enviar `income`. |
| `limit` | entero | `5`; mínimo `1`, máximo `20`; esta vista solicita `5`. |
| `start_date`, `end_date` | `string` `YYYY-MM-DD`, opcionales e inclusivas | Ambas opcionales; puede enviarse solo una. |
| `business_type` | `BusinessType`: `B2B \| B2C` | Opcional en API; obligatorio como filtro distinto en cada panel de esta vista. |

Para `SummaryParams`, `group_by` es `day | week | month` con default `month`; `category` acepta los valores de `Category`; `operation_type` acepta `income | outcome`; `business_type` acepta `B2B | B2C`; fechas siguen `DateRangeFilter`. Todos salvo el `group_by` predeterminado son opcionales en el endpoint. Para el total del gráfico, filtrar `business_type` y fechas y sumar `income`; no hace falta pedir `operation_type=income`, porque se necesitan las filas summary y el campo `income` ya separa ingresos de egresos.

### Casos límite que debe mostrar/manejar la UI

1. **Top vacío para un grupo:** conservar encabezado, columnas y panel de B2B/B2C; indicar que no hay categorías de ingresos para ese segmento/rango.
2. **Menos de cinco categorías:** representar las filas recibidas; `limit=5` es máximo solicitado, no garantía de cinco resultados.
3. **Total de ingresos cero o summary vacío:** mostrar porcentaje como no disponible (`—`) y nunca dividir por cero. El total del gráfico es cero; si ambos segmentos son cero, conservar el gráfico/sección y mostrar un mensaje explícito de ausencia de ingresos.
4. **Un grupo falla y el otro no:** mostrar el error en el panel afectado; no convertirlo en lista vacía ni ocultar automáticamente el grupo con datos.

## Referencia rápida de tipos

- Dominio: `OperationType`, `BusinessType`, `Category`, `GroupBy` en `api-types.ts`.
- Respuestas: `FacetResponse`, `SummaryItem`/`SummaryResponse`, `AlertTiny`/`AlertResponse`, `CategoryEntry`/`TopCategoriesResponse` en `api-types.ts`; movimientos en `../src/lib/financial-types.ts`.
- Peticiones: `DateRangeFilter`, `MetricsParams`, `AlertsParams`, `SummaryParams`, `TopCategoriesParams` en `path-types.ts`.
- Comportamiento de componentes y props está especificado por separado en `components.md`.
