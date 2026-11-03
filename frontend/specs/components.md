# Especificación de componentes — nuevas funcionalidades

Este documento describe la UI prevista; no implementa componentes ni peticiones. Los tipos citados están definidos en `api-types.ts` y `path-types.ts`. Los nombres de propiedades de API se conservan para que el contrato sea trazable.

## Reglas compartidas

- Los filtros de fecha usan `DateRangeFilter`: `start_date?` y `end_date?`, strings `YYYY-MM-DD`. Se permite inicio solo, fin solo, ambas o ninguna. El filtro de un solo límite se aplica como límite inclusivo; no se debe exigir el otro campo ni sustituirlo por una fecha inventada.
- Mientras se carga una solicitud, cada región de datos conserva su estructura y muestra indicador/placeholder de carga. En fallo se muestra un mensaje de error en la región correspondiente; no se representa el error como una respuesta vacía.
- Todas las vistas deben validar o manejar las respuestas según los tipos de `api-types.ts`; los tipos TypeScript no validan JSON en runtime.

## Funcionalidad 1 — Filtro de rango de fechas del dashboard

### `DashboardDateFilter`

Barra ubicada en la parte superior del dashboard principal.

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `DateRangeFilter` | Límites activos. Cualquiera de los dos campos puede omitirse o estar vacío en la UI. |
| `onChange` | `(next: DateRangeFilter) => void` | Notifica los cambios de inicio o fin; no hace fetch. |
| `facets` | `FacetResponse \| null` | Facetas cargadas; se usa para mostrar `min_date` y `max_date`. |
| `loading` | `boolean` | Indica que aún se cargan las facetas. |
| `error` | `string \| null` | Error de carga de facetas, si existe. |

**Comportamiento y renderizado**

- Renderiza controles etiquetados “Fecha de inicio” y “Fecha de fin”. Ambos son opcionales y producen fechas en formato `YYYY-MM-DD`.
- Presenta el rango de referencia usando `facets.min_date` y `facets.max_date`; si cualquiera es `null`, presenta que ese límite no está disponible, sin inventar un valor.
- Con solo inicio, filtra desde `start_date` inclusive y deja el fin sin acotar. Con solo fin, deja el inicio sin acotar y filtra hasta `end_date` inclusive. Con ambos vacíos, no aplica filtros de fecha y se muestran los datos completos disponibles.
- No aceptar ni transformar silenciosamente un rango invertido. El brief/API no especifican validación de orden; la UI debe marcar el rango inválido y no emitirlo como filtro hasta que `start_date <= end_date` o se corrija/limpie uno de los campos.
- Cambiar el filtro actualiza las props de los datos del dashboard, que deben respetarlo todas las consultas relevantes. La API ya acepta fechas en `/api/metrics` y `/api/metrics/summary`; no se implementa aquí ninguna llamada.

### `DashboardPage` (integración de la Funcionalidad 1)

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `dateRange` | `DateRangeFilter` | Rango activo compartido por KPIs, gráficos y cualquier panel añadido al dashboard. |
| `facets` | `FacetResponse \| null` | Datos de referencia `min_date`/`max_date`. |
| `loading` | `boolean` | Estado de carga general de datos del dashboard. |
| `error` | `string \| null` | Error general de carga, si existe. |

La página conserva el orden visual existente (encabezado, KPIs y gráficos) e inserta el filtro arriba del contenido de métricas. No se fija texto de período estático cuando contradiga el rango seleccionado.

## Funcionalidad 2 — Tabla de alertas

### `AlertThresholdControl`

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `number` | Umbral actual como ratio. Valor inicial de producto: `0.3`. |
| `onChange` | `(threshold: number) => void` | Notifica un umbral válido; no solicita datos por sí mismo. |
| `min` | `number` | `0.01`, mínimo pedido por el PM para la UI (la API acepta desde `0`). |
| `max` | `number` | `1.0`, máximo pedido por el PM para la UI (la API no declara máximo). |
| `disabled` | `boolean` | Deshabilita la edición mientras la vista no pueda aceptar cambios. |

El valor introducido se valida como número dentro de `0.01–1.0`; no emitir `NaN` ni valores fuera del intervalo. Comunicar que es un ratio: por ejemplo, `0.3` equivale a `30%`.

### `AlertsTable`

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `alerts` | `AlertResponse` | Lista devuelta por `GET /api/metrics/alerts`. |
| `loading` | `boolean` | Estado de consulta de alertas. |
| `error` | `string \| null` | Error de consulta, si existe. |

**Columnas y representación**

La tabla permanece montada/renderizada también cuando no hay filas. Presenta exactamente cuatro columnas:

1. **Período** — `period` tal como lo devuelve la API (`day`, `week` o `month` según `group_by`).
2. **Outcome registrado** — `outcome_total`.
3. **Media de períodos anteriores (baseline de la API)** — `baseline_average`.
4. **Incremento porcentual** — `increase_ratio` convertido a porcentaje para presentación (`ratio × 100`), sin cambiar el valor del contrato.

**Desajuste funcional que debe permanecer explícito:** el PM pide la media móvil de los tres períodos previos, pero la API actual calcula el promedio de todos los períodos anteriores presentes en el resumen. La tercera columna se rotula según el significado real de `baseline_average` y no se presenta como media de tres períodos. La equivalencia con el requisito PM queda pendiente de cambio de API/producto; no se simula con el dato actual.

**Renderizado condicional**

- `loading`: conservar título, controles y marco de tabla; mostrar estado de carga en el cuerpo.
- `error`: conservar la sección y mostrar mensaje de error; no mostrar el estado vacío.
- `alerts.length === 0`: conservar encabezados y mostrar en el cuerpo una única fila vacía con mensaje explícito: “No hay anomalías para el umbral y rango seleccionados”.
- Con elementos: mostrar una fila por alerta.

### `DashboardAlertsSection`

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `dateRange` | `DateRangeFilter` | Límites compartidos con el filtro principal; ambos opcionales. |
| `threshold` | `number` | Umbral UI vigente, inicialmente `0.3`. |
| `alerts` | `AlertResponse` | Respuesta del endpoint. |
| `loading` | `boolean` | Estado de carga de alertas. |
| `error` | `string \| null` | Error de la petición, si existe. |
| `onThresholdChange` | `(threshold: number) => void` | Cambio de umbral validado. |

Renderiza `AlertThresholdControl` y `AlertsTable` debajo de los gráficos existentes. El contrato de consulta correspondiente es `AlertsParams`, incluyendo las fechas actuales y el umbral; no realiza fetch desde el componente especificado.

## Funcionalidad 3 — Comparativa B2B vs B2C

### `BusinessCategoryTable`

Tabla reutilizable para uno de los dos segmentos.

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `businessType` | `BusinessType` | Segmento de la tabla: `B2B` o `B2C`. |
| `entries` | `TopCategoriesResponse` | Categorías devueltas por `GET /api/metrics/categories/top` para ese segmento, `income`, límite 5. |
| `groupIncomeTotal` | `number` | Total de ingresos del segmento en el mismo rango; denominador del porcentaje de cada categoría. |
| `loading` | `boolean` | Estado de carga del panel. |
| `error` | `string \| null` | Error de carga del panel, si existe. |

**Columnas**

1. **Nombre de categoría** — `category`.
2. **Total de ingresos** — `total_amount`.
3. **Porcentaje sobre el total del grupo** — cálculo de presentación `total_amount / groupIncomeTotal × 100`. El API no devuelve este porcentaje; la UI lo calcula. Si `groupIncomeTotal` es `0`, mostrar un marcador no disponible (p. ej. `—`) y nunca dividir por cero.

El total de grupo debe obtenerse de `/api/metrics/summary` para el mismo `business_type` y rango, sumando `income` de los períodos devueltos; no usar la suma del top-5 como si fuera el total del grupo, porque pueden existir categorías fuera de las cinco filas. Ese origen se eligió para respetar el contrato existente.

**Renderizado condicional**

- Carga/error: conservar el encabezado del grupo y mostrar respectivamente placeholder o error.
- `entries.length === 0`: conservar la tabla y encabezados, con mensaje explícito de que no hay categorías de ingresos para ese segmento y rango.
- Con entradas: renderizar las filas disponibles; el límite solicitado es 5, pero no asumir que la API siempre devuelve exactamente cinco.

### `BusinessComparisonChart`

Gráfico único bajo las dos tablas que compara el total de ingresos B2B y B2C.

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `b2bIncomeTotal` | `number` | Total de `income` B2B para el rango seleccionado. |
| `b2cIncomeTotal` | `number` | Total de `income` B2C para el rango seleccionado. |
| `loading` | `boolean` | Estado mientras se obtienen los totales. |
| `error` | `string \| null` | Error al cargar los totales, si existe. |

Usa los mismos totales por grupo descritos para las tablas (derivados de `summary` con los filtros equivalentes), no la respuesta de `/api/metrics/comparison`, que compara netos de períodos y no ingresos B2B/B2C. Si ambos totales son cero, mostrar el gráfico vacío con un mensaje explícito, sin ocultar la sección.

### `BusinessComparisonPage`

**Props**

| Prop | Tipo | Descripción |
|---|---|---|
| `dateRange` | `DateRangeFilter` | Filtro independiente o compartido de la vista comparativa; fechas opcionales. |
| `facets` | `FacetResponse \| null` | Facetas generales y límites de fecha. No contiene categorías específicas por segmento. |
| `b2bEntries` | `TopCategoriesResponse` | Top categorías de ingresos con `business_type=B2B`. |
| `b2cEntries` | `TopCategoriesResponse` | Top categorías de ingresos con `business_type=B2C`. |
| `b2bIncomeTotal` | `number` | Total de ingresos B2B para el rango seleccionado. |
| `b2cIncomeTotal` | `number` | Total de ingresos B2C para el rango seleccionado. |
| `loading` | `boolean` | Estado de carga de los datos de comparación. |
| `error` | `string \| null` | Error de carga, si existe. |
| `onDateRangeChange` | `(next: DateRangeFilter) => void` | Comunica cambios de fecha. |

La página presenta B2B y B2C en paralelo, cada uno con su `BusinessCategoryTable`, y un solo `BusinessComparisonChart` debajo. El control de fecha reutiliza las reglas de `DashboardDateFilter`. Cada solicitud de top categorías usa `TopCategoriesParams` con `operation_type: "income"`, `limit: 5`, el segmento correspondiente y los límites seleccionados. Las facetas de categorías sirven como catálogo global, no como catálogo segmentado.
