const API_URL = "https://jsonplaceholder.typicode.com/posts";

let currentPage = 1;
const itemsPerPage = 10;

// Referencias a los elementos del DOM
const apiSelector = document.getElementById("api-selector");
const searchInput = document.getElementById("search-input");
const fetchButton = document.getElementById("fetch-button");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

// Event listener del botón
fetchButton.addEventListener("click", () => {
  currentPage = 1;
  fetchData();
});

// También permite buscar pulsando Enter
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchData();
  }
});

// Mostrar indicador de carga
function showLoading() {
  loadingElement.classList.remove("hidden");
}

// Ocultar indicador de carga
function hideLoading() {
  loadingElement.classList.add("hidden");
}

// Mostrar error
function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

// Ocultar error
function hideError() {
  errorElement.classList.add("hidden");
}

// Función principal
async function fetchData() {
  const searchTerm = searchInput.value.trim();
  const useAxios = apiSelector.value === "axios";

  showLoading();
  hideError();
//Limpiar resultados anteriores
  resultsContainer.innerHTML = "";
//Limpiar paginación  
  paginationContainer.innerHTML = "";

  try {
    if (useAxios) {
      await fetchDataWithAxios(searchTerm);
    } else {
      await fetchDataWithFetch(searchTerm);
    }
  } catch (error) {
    console.error(error);
    showError("Se ha producido un error inesperado.");
  } finally {
    hideLoading();
  }
}

// Mostrar resultados
function displayResults(items, totalItems) {
  resultsContainer.innerHTML = "";

  if (items.length === 0) {
    resultsContainer.innerHTML = "<p>No se han encontrado resultados.</p>";
    paginationContainer.innerHTML = "";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const id = document.createElement("p");
    id.classList.add("card__id");
    id.textContent = `ID: ${item.id}`;

    const title = document.createElement("h2");
    title.classList.add("card__title");
    title.textContent = item.title;

    const body = document.createElement("p");
    body.classList.add("card__body");
    body.textContent = item.body;

    card.append(id, title, body);
    resultsContainer.appendChild(card);
  });

  setupPagination(totalItems);
}

// Crear paginación
function setupPagination(totalItems) {
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return;
  }

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = page;

    if (page === currentPage) {
      button.disabled = true;
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      currentPage = page;
      fetchData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    paginationContainer.appendChild(button);
  }
}

// Petición utilizando Fetch API
async function fetchDataWithFetch(searchTerm) {
  const params = new URLSearchParams({
    _page: currentPage,
    _limit: itemsPerPage
  });

  if (searchTerm) {
    params.set("q", searchTerm);
  }

  const response = await fetch(`${API_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();

  const totalHeader = response.headers.get("X-Total-Count");
  const totalItems = Number(totalHeader) || data.length;

  displayResults(data, totalItems);
}

// Petición utilizando Axios
async function fetchDataWithAxios(searchTerm) {
  const params = {
    _page: currentPage,
    _limit: itemsPerPage
  };

  if (searchTerm) {
    params.q = searchTerm;
  }

  try {
    const response = await axios.get(API_URL, {
      params
    });

    const totalHeader = response.headers["x-total-count"];
    const totalItems = Number(totalHeader) || response.data.length;

    displayResults(response.data, totalItems);
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText || "Error HTTP";

      throw new Error(`${status} ${statusText}`);
    }

    if (error.request) {
      throw new Error("No se ha recibido respuesta del servidor.");
    }

    throw new Error(error.message);
  }
}
