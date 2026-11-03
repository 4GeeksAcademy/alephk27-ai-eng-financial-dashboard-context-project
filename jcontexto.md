# Especificaciones del frontend: nuevas funcionalidades del dashboard financiero

## Contexto del proyecto

El equipo de finanzas del cliente solicita tres nuevas capacidades. Antes de que alguien construya un componente, tu *tech lead* detiene al equipo:

> **«Primero la especificación. Luego construimos».**

Una especificación bien escrita define qué ve el usuario, qué datos necesita cada componente y qué reglas rigen cada campo.

Si la especificación es clara, cualquier desarrollador —o *coding agent*— puede implementarla sin necesidad de hacerte preguntas.

### ¿Qué significa Stack-agnostic?

**Stack-agnostic se refiere a tu conocimiento previo, no al stack del proyecto.**

Este repositorio ya tiene un frontend y un backend predefinidos.

explorarás los patrones existentes del frontend; verificarás cada tipo y regla con evidencia de la API en funcionamiento y rechazar cualquier suposición.

## Cómo trabajar en cada fase

1. **Exploración:** explora `/docs` y el código frontend relevante antes de redactar las especificaciones.
2. **Propuesta:** Para cada funcionalidad, proporciona el resultado esperado (*outcome*) del PM como prompt. Deja que el agente proponga tipos, componentes y casos límite.
3. **Verificación:** Clasifica las afirmaciones relacionadas con la API utilizando los siguientes indicadores:
   - ✅ Verificadas en `/docs`.
   - ❌ Incorrectas.
   - ❓ Sin verificar.
   
   Corrige cualquier problema junto con el agente.
4. **Commits:** Haz commit de los artefactos de especificación únicamente después de verificarlos. Lo ideal es realizar commits separados para tipos, componentes y contratos de datos.
5. **Restricción de implementación:** **No** implementes componentes React ni llamadas a la API en este proyecto.

## Resultado Esperado del Product Manager - Solicitudes de funcionalidades: 
### Funcionalidad 1 — Filtro de rango de fechas en el dashboard principal
#### Objetivo
El equipo de finanzas quiere centrarse en períodos específicos sin tener que visualizar todos los datos históricos al mismo tiempo.
#### Requisitos
- Añadir dos campos de fecha en la parte superior del dashboard:
  - Fecha de inicio.
  - Fecha de fin.
- Ambos campos deben filtrar todos los datos que se muestran actualmente en la página.
- Las fechas deben enviarse a la API utilizando el formato `YYYY-MM-DD`.
- Ambos campos son opcionales.
- Cuando los campos estén vacíos, el dashboard debe mostrar todos los datos disponibles.
- El rango de fechas disponible (la fecha más antigua y la más reciente del conjunto de datos) debe mostrarse cerca de los campos de fecha como referencia para que el usuario conozca el rango válido.
#### Endpoints relevantes
- `GET /api/metrics/facets` — Para obtener el rango de fechas disponible.
- Endpoint de métricas existente — Debe ampliarse para admitir los filtros de fecha.
---

### Funcionalidad 2 — Tabla de alertas de anomalías en el dashboard principal
#### Objetivo
Añadir una tabla debajo de los gráficos existentes que destaque los períodos en los que el gasto aumentó de forma inesperada.
#### Estructura de la tabla
La tabla debe contener exactamente cuatro columnas:
| Columna | Descripción |
|---|---|
| Período | Período en el que se detectó la anomalía. |
| Outcome registrado | Resultado registrado para ese período. |
| Media móvil de los 3 períodos anteriores | Promedio de los tres períodos anteriores. |
| Incremento porcentual | Porcentaje de incremento respecto a la media móvil. |

#### Requisitos
- El umbral de alerta debe ser configurable por el usuario mediante un campo de entrada numérico.
- El valor del umbral debe ser un ratio entre `0.01` y `1.0`.
- El valor predeterminado debe ser `0.3`.
- Si no se detectan anomalías para el umbral actual, la tabla debe mostrar un mensaje explícito indicando que no hay resultados.
- La tabla no debe desaparecer cuando no existan anomalías.
- La tabla también debe respetar el rango de fechas establecido en la Funcionalidad 1, cuando este se encuentre activo.

#### Endpoint relevante
`GET /api/metrics/alerts?threshold=<ratio>`

---

### Funcionalidad 3 — Vista comparativa B2B vs B2C
#### Objetivo
Crear una nueva página dentro del dashboard para comparar el rendimiento de los ingresos entre las dos líneas de negocio:
- B2B.
- B2C.

#### Estructura de la vista
La vista debe contener dos secciones en paralelo:
**Sección B2B**
Una tabla que muestre las cinco principales categorías de ingresos de B2B.
**Sección B2C**
Una tabla que muestre las cinco principales categorías de ingresos de B2C.

#### Columnas de ambas tablas

| Columna | Descripción |
|---|---|
| Nombre de categoría | Nombre de la categoría de ingreso. |
| Total de ingresos | Importe total de ingresos de esa categoría. |
| Porcentaje sobre el total del grupo | Porcentaje que representa la categoría respecto al total de ingresos de su grupo. |

#### Gráfico comparativo

- Debajo de ambas secciones debe mostrarse un único gráfico.
- El gráfico debe comparar visualmente los ingresos totales de B2B frente a B2C.

#### Filtros

- El usuario debe poder filtrar la comparativa mediante un rango de fechas.
- Las fechas deben utilizar el mismo formato `YYYY-MM-DD`.
- Las categorías disponibles para cada grupo deben obtenerse mediante el endpoint de facetas.

#### Endpoints relevantes

- `GET /api/metrics/categories/top?operation_type=income&limit=5`
- `GET /api/metrics/facets`

---

## Requisito general de las especificaciones

Tus especificaciones deben ser lo suficientemente precisas para que un *coding agent* pueda construir cada funcionalidad utilizando únicamente dichas especificaciones.

Esto es posible porque cada nombre de campo, parámetro y caso límite debe haber sido **verificado contra `/docs` y no inventado**.

---

## 🌱 Cómo iniciar el proyecto

### Paso 1. Verificar el trabajo anterior

Confirma que las siguientes carpetas existan y estén actualizadas:

- `memory-bank/`
- `.agents/rules`


### Paso 2. Crear la carpeta de especificaciones si aun no existe

Crea la siguiente carpeta dentro del proyecto:

```text
frontend/specs/
```

Aquí se almacenarán todos los archivos de especificación.

### Paso 3. Explorar el backend y la documentación

1. Inicia el backend.
2. Abre `/docs`.
3. Explore los endpoints relacionados con las tres funcionalidades.
4. Verifica los campos, parámetros, tipos y reglas disponibles.

**Importante:** No escribas ninguna especificación antes de completar esta exploración.
