const apiUrl = '/api/watches';
const watchId = new URLSearchParams(location.search).get('id');
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
function formatPrice(value) {
  return Number(value).toFixed(2);
}

// Send requests to the Express API.
async function request(method = 'GET', id = null, data = null) {
  const response = await fetch(apiUrl + (id !== null ? `/${encodeURIComponent(id)}` : ''), {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Cannot reach the API. Make sure the Node.js server is running.');
  }
  if (!response.ok) throw new Error(result.error || 'The request failed.');
  return result;
}

function showError(error) {
  let message = document.getElementById('pageMessage');
  if (!message) {
    message = document.createElement('p');
    message.id = 'pageMessage';
    message.className = 'message';
    message.setAttribute('role', 'alert');
    document.querySelector('main').prepend(message);
  }
  message.textContent = error.message;
}

function imageMarkup(watch) {
  return /^https?:\/\//i.test(watch.image)
    ? `<img class="watch-image" src="${escapeHtml(watch.image)}" alt="${escapeHtml(watch.name)}">` : '';
}

function createWatchCard(watch, showActions = false) {
  const id = encodeURIComponent(watch.id);
  return `<article class="watch-card">
    <a href="product-details.html?id=${id}">${imageMarkup(watch)}</a>
    <div class="watch-card-content">
      <h3><a href="product-details.html?id=${id}">${escapeHtml(watch.name)}</a></h3>
      <p>${escapeHtml(watch.brand)} &middot; ${escapeHtml(watch.category)}</p>
      <p class="price">$${formatPrice(watch.price)}</p>
      ${showActions ? `<div class="card-actions">
        <a class="button small-button" href="product-details.html?id=${id}">View</a>
        <a class="button button-secondary small-button" href="product-form.html?id=${id}">Edit</a>
        <button class="button button-danger small-button" data-delete="${id}">Delete</button>
      </div>` : ''}
    </div></article>`;
}

// Delete a record after confirmation.
async function deleteWatch(id, button) {
  if (!confirm('Delete this watch permanently?')) return;
  button.disabled = true;
  try {
    await request('DELETE', id);
    location.href = 'products.html';
  } catch (error) {
    showError(error);
    button.disabled = false;
  }
}

// Load watches from MySQL for the home and records pages.
async function loadList(home = false) {
  const area = document.getElementById(home ? 'featuredWatches' : 'watchList');
  area.textContent = 'Loading watches...';
  try {
    const watches = await request();
    const visible = home ? watches.slice(0, 3) : watches;
    area.innerHTML = visible.length ? visible.map(watch => createWatchCard(watch, !home)).join('')
      : '<p class="message">No watches yet. Add a record to get started.</p>';
    area.querySelectorAll('[data-delete]').forEach(button => {
      button.addEventListener('click', () => deleteWatch(button.dataset.delete, button));
    });
  } catch (error) {
    area.textContent = '';
    throw error;
  }
}

// Display the selected watch.
async function loadDetails() {
  if (!watchId) throw new Error('A watch ID is required.');
  const watch = await request('GET', watchId);
  document.getElementById('watchDetails').innerHTML = `<article class="details">
    ${imageMarkup(watch)}<div>
    <h1>${escapeHtml(watch.name)}</h1><p class="price">$${formatPrice(watch.price)}</p>
    <p class="details-description">${escapeHtml(watch.description)}</p>
    <ul class="details-list">
      <li><strong>Record ID:</strong> ${escapeHtml(watch.id)}</li>
      <li><strong>Brand:</strong> ${escapeHtml(watch.brand)}</li>
      <li><strong>Category:</strong> ${escapeHtml(watch.category)}</li>
    </ul><div class="card-actions">
      <a class="button" href="product-form.html?id=${encodeURIComponent(watch.id)}">Edit Record</a>
      <button class="button button-danger" id="deleteWatch">Delete Record</button>
    </div></div></article>`;
  const button = document.getElementById('deleteWatch');
  button.addEventListener('click', () => deleteWatch(watch.id, button));
}

// Use the same form for adding and editing watches.
async function loadForm() {
  const form = document.getElementById('watchForm');
  const button = document.getElementById('saveButton');
  let ready = false;
  button.disabled = true;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || button.disabled) return;
    button.disabled = true;
    try {
      const result = await request(watchId !== null ? 'PUT' : 'POST', watchId, Object.fromEntries(new FormData(form)));
      location.href = `product-details.html?id=${encodeURIComponent(result.id)}`;
    } catch (error) {
      showError(error);
      button.disabled = false;
    }
  });
  if (watchId !== null) {
    if (!/^[1-9]\d*$/.test(watchId)) throw new Error('Invalid watch ID.');
    const watch = await request('GET', watchId);
    document.getElementById('formTitle').textContent = 'Edit Watch Record';
    button.textContent = 'Update Record';
    for (const field of ['name', 'brand', 'category', 'price', 'image', 'description']) {
      form.elements[field].value = watch[field];
    }
  }
  ready = true;
  button.disabled = false;
}

// Load the current page.
async function loadPage() {
  const page = document.body.dataset.page;
  if (page === 'home') await loadList(true);
  if (page === 'products') await loadList();
  if (page === 'details') await loadDetails();
  if (page === 'form') await loadForm();
}

loadPage().catch(showError);
