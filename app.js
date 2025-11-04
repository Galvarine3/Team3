// Basic client script
const app = document.getElementById('app');

async function fetchEquipos() {
  const res = await fetch('/api/equipos');
  if (!res.ok) throw new Error('Error cargando equipos');
  return res.json();
}

async function createEquipo(nombre) {
  const res = await fetch('/api/equipos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  });
  if (!res.ok) throw new Error('No se pudo crear');
  return res.json();
}

async function deleteEquipo(id) {
  const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('No se pudo borrar');
  return res.json();
}

function renderList(items) {
  const list = document.getElementById('list');
  if (!items.length) {
    list.innerHTML = '<p>No hay equipos aún.</p>';
    return;
  }
  list.innerHTML = items
    .map(
      (e) => `
      <li class="row">
        <span>${e.nombre}</span>
        <button data-id="${e.id}" class="danger">Eliminar</button>
      </li>`
    )
    .join('');

  list.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await deleteEquipo(btn.dataset.id);
        await init();
      } catch (e) {
        alert(e.message);
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function renderShell() {
  const now = new Date();
  app.innerHTML = `
    <div class="card">
      <h3>Equipos</h3>
      <p>Demo mínima con API en Express.</p>
      <p><strong>Hora:</strong> ${now.toLocaleString()}</p>
      <form id="form" class="row" autocomplete="off">
        <input id="nombre" name="nombre" placeholder="Nombre del equipo" required />
        <button type="submit">Agregar</button>
      </form>
      <ul id="list"></ul>
      <div class="row">
        <button id="ping">Probar /health</button>
        <pre id="out" class="pre"></pre>
      </div>
    </div>
  `;

  document.getElementById('ping').addEventListener('click', async () => {
    const res = await fetch('/health');
    const data = await res.json();
    document.getElementById('out').textContent = JSON.stringify(data, null, 2);
  });

  const form = document.getElementById('form');
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const input = document.getElementById('nombre');
    const nombre = input.value.trim();
    if (!nombre) return;
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      await createEquipo(nombre);
      input.value = '';
      await init();
    } catch (e) {
      alert(e.message);
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

async function init() {
  renderShell();
  const list = document.getElementById('list');
  list.innerHTML = '<p>Cargando...</p>';
  try {
    const items = await fetchEquipos();
    renderList(items);
  } catch (e) {
    list.innerHTML = `<p>Error: ${e.message}</p>`;
  }
}

init();

// Update year in footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
