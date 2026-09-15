// These are the three fixed records used by the static website.
const watches = [
  {
    id: 1,
    name: "Classic Leather",
    brand: "Timex",
    category: "Classic",
    price: 120,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80",
    description: "A simple classic watch with a brown leather strap."
  },
  {
    id: 2,
    name: "Silver Sport",
    brand: "Casio",
    category: "Sport",
    price: 180,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=700&q=80",
    description: "A strong everyday watch with a silver metal band."
  },
  {
    id: 3,
    name: "Gold Edition",
    brand: "Fossil",
    category: "Luxury",
    price: 350,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80",
    description: "An elegant gold watch made for special occasions."
  }
];

// Read the watch ID from the page URL.
function getWatchId() {
  const parameters = new URLSearchParams(window.location.search);
  return Number(parameters.get("id"));
}

// Create the HTML for one record card.
function createWatchCard(watch, showActions = false) {
  let actions = "";

  if (showActions) {
    actions = `
      <div class="card-actions">
        <a class="button small-button" href="product-details.html?id=${watch.id}">View</a>
        <a class="button button-secondary small-button" href="product-form.html?id=${watch.id}">Edit</a>
        <button class="button button-danger small-button delete-button">Delete</button>
      </div>
    `;
  }

  return `
    <article class="watch-card">
      <a href="product-details.html?id=${watch.id}">
        <img class="watch-image" src="${watch.image}" alt="${watch.name}">
      </a>
      <div class="watch-card-content">
        <h3>
          <a href="product-details.html?id=${watch.id}">${watch.name}</a>
        </h3>
        <p>${watch.brand} · ${watch.category}</p>
        <p class="price">$${watch.price}</p>
        ${actions}
      </div>
    </article>
  `;
}

// Display the three records on the home page.
function loadHomePage() {
  const featuredArea = document.getElementById("featuredWatches");
  featuredArea.innerHTML = watches.map(watch => createWatchCard(watch)).join("");
}

// Display the same three records on the records page.
function loadProductsPage() {
  const watchList = document.getElementById("watchList");
  watchList.innerHTML = watches
    .map(watch => createWatchCard(watch, true))
    .join("");

  // Delete is shown as an example but does not remove anything.
  const deleteButtons = document.querySelectorAll(".delete-button");

  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      alert("This is a static prototype. The record was not deleted.");
    });
  });
}

// Show the selected record on the details page.
function loadDetailsPage() {
  const watchId = getWatchId();
  const watch = watches.find(item => item.id === watchId);
  const detailsArea = document.getElementById("watchDetails");

  if (!watch) {
    detailsArea.innerHTML = '<div class="message">Watch record not found.</div>';
    return;
  }

  detailsArea.innerHTML = `
    <article class="details">
      <img class="watch-image" src="${watch.image}" alt="${watch.name}">
      <div>
        <h1>${watch.name}</h1>
        <p class="price">$${watch.price}</p>
        <p class="details-description">${watch.description}</p>
        <ul class="details-list">
          <li><strong>Record ID:</strong> ${watch.id}</li>
          <li><strong>Brand:</strong> ${watch.brand}</li>
          <li><strong>Category:</strong> ${watch.category}</li>
        </ul>
        <div class="card-actions">
          <a class="button" href="product-form.html?id=${watch.id}">Edit Record</a>
          <button class="button button-danger" id="deleteWatch">Delete Record</button>
        </div>
      </div>
    </article>
  `;

  document.getElementById("deleteWatch").addEventListener("click", () => {
    alert("This is a static prototype. The record was not deleted.");
  });
}

// Fill the sample form when the Edit button is clicked.
function loadFormPage() {
  const form = document.getElementById("watchForm");
  const watchId = getWatchId();
  const watch = watches.find(item => item.id === watchId);

  if (watch) {
    document.getElementById("formTitle").textContent = "Edit Watch Record";
    document.getElementById("saveButton").textContent = "Update Record";
    form.elements.name.value = watch.name;
    form.elements.brand.value = watch.brand;
    form.elements.category.value = watch.category;
    form.elements.price.value = watch.price;
    form.elements.image.value = watch.image;
    form.elements.description.value = watch.description;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    alert("This is a static prototype. The information was not saved.");
  });
}

// Run the correct function for the current page.
const currentPage = document.body.dataset.page;

if (currentPage === "home") loadHomePage();
if (currentPage === "products") loadProductsPage();
if (currentPage === "details") loadDetailsPage();
if (currentPage === "form") loadFormPage();
