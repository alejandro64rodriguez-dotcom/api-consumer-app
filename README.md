# api-consumer-app

Aplicación web básica (HTML, CSS y JavaScript) que consume una API externa y compara dos formas de hacer peticiones HTTP: **Fetch API** y **Axios**. Incluye búsqueda, paginación y gestión de los estados de la interfaz (carga, datos y errores).

Los datos provienen de la API de pruebas [JSONPlaceholder](https://jsonplaceholder.typicode.com/) (recurso `/posts`).

---

## Objetivos de aprendizaje

- Configurar un proyecto web básico con HTML, CSS y JavaScript.
- Realizar peticiones HTTP con **Fetch API** y con la librería **Axios**.
- Gestionar los estados de la interfaz: carga, visualización de datos y errores.
- Implementar **búsqueda** y **paginación**.
- Comparar las diferencias prácticas entre Fetch y Axios en un proyecto real.

---

## Funcionalidades

- Selector para elegir el cliente HTTP: **Utilitza Fetch** o **Utilitza Axios**.
- Campo de texto para **buscar** posts (parámetro `q`).
- Botón **Obtener datos** que lanza la petición.
- Indicador de **carga** mientras se espera la respuesta.
- Mensajes de **error** (oculto por defecto) cuando la petición falla.
- Resultados mostrados como **tarjetas** (`id`, `title`, `body`) en una cuadrícula adaptable.
- **Paginación** con un botón por página; la página actual queda deshabilitada.
- Mensaje "No s'han trobat resultats" cuando la búsqueda no devuelve nada.

---

## Estructura del proyecto

```
api-consumer-app/
├── index.html    # Estructura de la página
├── styles.css    # Estilos
└── main.js       # Lógica de la aplicación
```

### `index.html`

- Contenedor principal (`.container`) que encapsula la aplicación.
- `<header>` con el título `<h1>` y la sección de controles:
  - `<select>` con las opciones Fetch / Axios.
  - `<input type="text">` con `placeholder` para la búsqueda.
  - `<button>` "Obtener datos".
- `<main>` con:
  - Elemento de carga (`#loading`).
  - Elemento de errores (`#error`), inicialmente con la clase `hidden`.
  - Sección de resultados (`#results`).
  - Sección de paginación (`.pagination`).
- Inclusión de Axios mediante CDN, **antes** de `main.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="main.js"></script>
```

### `styles.css`

- Estilos globales del `body` (tipografía, ancho máximo, márgenes).
- Clase `.hidden` para ocultar elementos.
- `.controls` con Flexbox para alinear los controles.
- `.container`, `#loading` y `#error`.
- `#results` con CSS Grid adaptable:

```css
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
```

- `.card` con borde, sombra, padding y efecto `:hover`.
- `.pagination button` con estado `:disabled`.

### `main.js`

| Elemento | Descripción |
|---|---|
| `API_URL` | `https://jsonplaceholder.typicode.com/posts` |
| `currentPage` | Página actual (empieza en 1) |
| `itemsPerPage` | Elementos por página (10) |
| `showLoading()` / `hideLoading()` | Muestra u oculta el indicador de carga |
| `showError(message)` / `hideError()` | Muestra u oculta el mensaje de error |
| `fetchData()` | Función principal: lee el formulario, limpia resultados y llama a Fetch o Axios |
| `fetchDataWithFetch(searchTerm)` | Petición con Fetch API |
| `fetchDataWithAxios(searchTerm)` | Petición con Axios |
| `displayResults(items, totalItems)` | Pinta las tarjetas y llama a la paginación |
| `setupPagination(totalItems)` | Genera los botones de página |

---

## Cómo ejecutarlo

No requiere instalación ni dependencias: Axios se carga por CDN.

**Opción 1: abrir directamente**

Abre `index.html` en el navegador.

**Opción 2: servidor local (recomendado)**

```bash
cd api-consumer-app

# Con Python
python3 -m http.server 8000

# o con Node.js
npx serve .
```

Después visita `http://localhost:8000`.

También puedes usar la extensión **Live Server** de VS Code.

> Necesitas conexión a internet, ya que la app consulta una API externa.

---

## Uso

1. Elige el cliente HTTP en el selector (Fetch o Axios).
2. (Opcional) Escribe un término en el campo de búsqueda.
3. Pulsa **Obtener datos**.
4. Navega entre páginas con los botones de la parte inferior.

---

## API utilizada

Endpoint: `GET https://jsonplaceholder.typicode.com/posts`

| Parámetro | Descripción |
|---|---|
| `_page` | Número de página |
| `_limit` | Elementos por página |
| `q` | Término de búsqueda (búsqueda de texto completo) |

Ejemplo:

```
https://jsonplaceholder.typicode.com/posts?_page=2&_limit=10&q=qui
```

El número total de resultados llega en la cabecera de la respuesta **`X-Total-Count`** y se usa para calcular las páginas:

```js
const totalPages = Math.ceil(totalItems / itemsPerPage);
```

---

## Fetch vs Axios

### Fetch API

```js
const url = `${API_URL}?_page=${currentPage}&_limit=${itemsPerPage}&q=${encodeURIComponent(searchTerm)}`;
const response = await fetch(url);

if (!response.ok) {
  throw new Error(`Error HTTP: ${response.status}`);
}

const totalItems = response.headers.get('X-Total-Count');
const data = await response.json();
displayResults(data, totalItems);
```

### Axios

```js
try {
  const response = await axios.get(API_URL, {
    params: { _page: currentPage, _limit: itemsPerPage, q: searchTerm },
  });

  const totalItems = response.headers['x-total-count'];
  displayResults(response.data, totalItems);
} catch (error) {
  showError(error.response?.statusText || error.message);
}
```

### Comparativa

| Aspecto | Fetch | Axios |
|---|---|---|
| Instalación | Nativo del navegador | Librería externa (CDN o npm) |
| Parámetros de URL | Se construyen a mano en la cadena | Objeto `params` |
| Errores HTTP (404, 500...) | **No** lanza error: hay que comprobar `response.ok` | Lanza error automáticamente |
| Parseo del JSON | Manual (`response.json()`) | Automático (`response.data`) |
| Cabeceras de respuesta | `response.headers.get('X-Total-Count')` | `response.headers['x-total-count']` |
| Cancelación | `AbortController` | `AbortController` (o `CancelToken` en versiones antiguas) |
| Tamaño | 0 KB | Añade peso a la página |

---

## Estados de la interfaz

| Estado | Comportamiento |
|---|---|
| **Cargando** | Se muestra `#loading` y se oculta el error |
| **Éxito** | Se pintan las tarjetas y la paginación |
| **Sin resultados** | Mensaje "No s'han trobat resultats" |
| **Error** | Se muestra `#error` con el mensaje correspondiente |

El indicador de carga se oculta siempre en el bloque `finally`, tanto si la petición funciona como si falla.

---

## Tareas del proyecto

### Obligatorias

- [ ] Implementar `fetchDataWithFetch(searchTerm)`
- [ ] Implementar `fetchDataWithAxios(searchTerm)`
- [ ] Implementar `displayResults(items, totalItems)`
- [ ] Implementar `setupPagination(totalItems)`

### Bonus (opcionales)

- [ ] **Errores avanzados:** mensajes según el código HTTP (p. ej. "404 Not Found") y detección de falta de conexión (`navigator.onLine`).
- [ ] **Caché básica:** guardar respuestas en memoria (`Map`) con expiración de X minutos.
- [ ] **Cancelación de peticiones:** `AbortController` en Fetch y Axios para evitar condiciones de carrera al buscar de nuevo.
- [ ] **Soporte para otras APIs:** selector o campo de texto para introducir otra URL.
- [ ] **Reintentos:** reintentar con retardo exponencial cuando falle la red.

---

## Tecnologías

- HTML5
- CSS3 (Flexbox y Grid)
- JavaScript (ES6+, `async/await`)
- [Axios](https://axios-http.com/)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)

---

## Autor

Nombre del alumno/a · Curso / Módulo
