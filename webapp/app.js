// Simple web version of the Android app
// - Ratings hidden in public UI
// - Secret menu: ArrowUp + ArrowDown within 300ms
// - Persistent storage via localStorage

// Primero pegar ruta de carpeta: cd xxxxxxx
// Luego: git init
// git add .
// git commit -m "Initial commit"
// git remote add origin https://github.com/ArielWT/Equipos/tree/main
// Puede ser que ya este creado el git remoto
// revisa la ruta del git remoto: git remote -v
// si no es la correcta, borra el remoto: git remote remove origin
// y vuelve a crearlo: git remote add origin https://github.com/ArielWT/Equipos/tree/main
// Ahora sincronizar con repositorio:
// git pull origin main
// ahora subir cambios:
// git add .
// git commit -m "Actualización del proyecto Equipos"
// git push origin main
// página: equipos-production.up.railway.app





const initialPlayers = [
  { name: 'Rulo', rating: 8.0 },
  { name: 'Ariel', rating: 8.0 },
  { name: 'Diego', rating: 7.5 },
  { name: 'Jaime', rating: 7.3 },
  { name: 'Pablo V', rating: 8.0 },
  { name: 'Carlitos', rating: 7.0 },
  { name: 'Seba', rating: 7.2 },
  { name: 'Feña', rating: 5.9 },
  { name: 'Gustavo (P)', rating: 8.0 },
  { name: 'Tío Seba', rating: 6.2 },
  { name: 'Manuel', rating: 7.5 },
  { name: 'Pablo P', rating: 6.5 },
  { name: 'Kevin', rating: 7.4 },
  { name: 'David', rating: 6.5 },
  { name: 'Benja', rating: 7.5 },
  { name: 'Juan', rating: 7.2 },
  { name: 'Marín', rating: 7.2 },
  { name: 'Felipe Ep', rating: 7.2 },
  { name: 'Chiqui', rating: 8.8 },
  { name: 'Bubu', rating: 7.8 },
  { name: 'Vicho', rating: 8.8 },
  { name: 'Emilio', rating: 8.8 },
  { name: 'Jesús', rating: 7.3 },
  { name: 'Shuvert', rating: 7.7 },
  { name: 'Gastón', rating: 7.6 },
  { name: 'Richard', rating: 8.0 },
  { name: 'Víctor', rating: 7.4 },
  { name: 'Gustavo Riquelme', rating: 7.1 },
  { name: 'Navaloco', rating: 5.6 },
  { name: 'Lucas', rating: 7.5 },
];

const STORAGE_KEY = 'equipos_players_v1';

async function loadPlayersRemote() {
  try {
    const res = await fetch('/players', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('remote not ok');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('remote invalid');
    return data.filter(p => p && typeof p.name === 'string' && typeof p.rating === 'number');
  } catch (_) {
    return null;
  }
}

function loadPlayersLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...initialPlayers];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...initialPlayers];
    return parsed.filter(p => p && typeof p.name === 'string' && typeof p.rating === 'number');
  } catch (_) {
    return [...initialPlayers];
  }
}

function savePlayersLocal(players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

async function savePlayersRemote(players) {
  try {
    const res = await fetch('/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(players)
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

let players = [];
let selected = new Set();

const els = {
  enabledCount: document.getElementById('enabledCount'),
  countInput: document.getElementById('countInput'),
  generateBtn: document.getElementById('generateBtn'),
  errorMsg: document.getElementById('errorMsg'),
  playersList: document.getElementById('playersList'),
  teamATitle: document.getElementById('teamATitle'),
  teamAList: document.getElementById('teamAList'),
  teamBTitle: document.getElementById('teamBTitle'),
  teamBList: document.getElementById('teamBList'),
  adminDialog: document.getElementById('adminDialog'),
  editList: document.getElementById('editList'),
  newName: document.getElementById('newName'),
  newRating: document.getElementById('newRating'),
  addPlayerBtn: document.getElementById('addPlayerBtn'),
  saveChangesBtn: document.getElementById('saveChangesBtn'),
  closeDialogBtn: document.getElementById('closeDialogBtn'),
};

function renderPlayersList() {
  els.playersList.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.textContent = p.name;
    label.style.flex = '1';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'checkbox';
    cb.checked = selected.has(p.name);
    cb.addEventListener('change', () => {
      if (cb.checked) selected.add(p.name); else selected.delete(p.name);
      updateEnabledCount();
    });

    li.appendChild(label);
    li.appendChild(cb);
    els.playersList.appendChild(li);
  });
}

function updateEnabledCount() {
  const enabled = players.filter(p => selected.has(p.name)).length;
  els.enabledCount.textContent = `Habilitados: ${enabled}`;
}

function generateBalancedTeams(pool) {
  const sorted = [...pool].sort((a,b) => b.rating - a.rating);
  const a = []; let sa = 0; const b = []; let sb = 0;
  for (const p of sorted) {
    const toA = sa < sb ? true : (sb < sa ? false : Math.random() < 0.5);
    if (toA) { a.push(p); sa += p.rating; } else { b.push(p); sb += p.rating; }
  }
  while (Math.abs(a.length - b.length) > 1) {
    if (a.length > b.length) b.push(a.pop()); else a.push(b.pop());
  }
  return [a, b];
}

function renderTeams(a, b) {
  const avgA = a.length ? (a.reduce((s,p)=>s+p.rating,0)/a.length) : 0;
  const avgB = b.length ? (b.reduce((s,p)=>s+p.rating,0)/b.length) : 0;
  els.teamATitle.textContent = `Equipo A (Promedio: ${avgA.toFixed(1)})`;
  els.teamBTitle.textContent = `Equipo B (Promedio: ${avgB.toFixed(1)})`;
  // Shuffle only for display
  const da = [...a].sort(()=>Math.random()-0.5);
  const db = [...b].sort(()=>Math.random()-0.5);
  els.teamAList.innerHTML = '';
  els.teamBList.innerHTML = '';
  da.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `• ${p.name}`;
    els.teamAList.appendChild(li);
  });
  db.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `• ${p.name}`;
    els.teamBList.appendChild(li);
  });
}

els.generateBtn.addEventListener('click', () => {
  els.errorMsg.textContent = '';
  const n = parseInt(els.countInput.value || '0', 10);
  if (!Number.isFinite(n) || n < 2) {
    els.errorMsg.textContent = 'El mínimo es 2';
    return;
  }
  const pool = players.filter(p => selected.has(p.name));
  if (n > pool.length) {
    els.errorMsg.textContent = 'No hay suficientes jugadores seleccionados';
    return;
  }
  const chosen = [...pool].sort(() => Math.random()-0.5).slice(0, n);
  const [a, b] = generateBalancedTeams(chosen);
  renderTeams(a, b);
});

function renderEditList() {
  els.editList.innerHTML = '';
  players.forEach(p => {
    const row = document.createElement('div');
    row.className = 'edit-row';

    const name = document.createElement('div');
    name.textContent = p.name;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = String(p.rating);
    input.inputMode = 'decimal';
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^\d.]/g, '');
    });

    row.appendChild(name);
    row.appendChild(input);
    els.editList.appendChild(row);
  });
}

els.saveChangesBtn.addEventListener('click', async () => {
  // read back values
  const rows = els.editList.querySelectorAll('.edit-row');
  const updated = [...players];
  rows.forEach((row, idx) => {
    const input = row.querySelector('input');
    const val = parseFloat(input.value);
    if (Number.isFinite(val) && val >= 1 && val <= 10) {
      updated[idx] = { ...updated[idx], rating: val };
    }
  });
  players = updated;
  savePlayersLocal(players);
  await savePlayersRemote(players);
  renderPlayersList();
  updateEnabledCount();
});

els.addPlayerBtn.addEventListener('click', async () => {
  const name = els.newName.value.trim();
  const rating = parseFloat(els.newRating.value);
  if (!name || !Number.isFinite(rating) || rating < 1 || rating > 10) return;
  if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
  players = [...players, { name, rating }];
  selected.add(name);
  // Persistimos en este navegador usando localStorage
  savePlayersLocal(players);
  els.newName.value = '';
  els.newRating.value = '';
  renderPlayersList();
  updateEnabledCount();
});

els.closeDialogBtn.addEventListener('click', () => {
  els.adminDialog.close();
});

// secret: ArrowUp + ArrowDown within 300ms
let lastUp = -1, lastDown = -1;
window.addEventListener('keydown', (e) => {
  const now = performance.now();
  if (e.key === 'ArrowUp') {
    lastUp = now;
    if (lastDown > 0 && (now - lastDown) <= 300) {
      renderEditList();
      els.adminDialog.showModal();
    }
  } else if (e.key === 'ArrowDown') {
    lastDown = now;
    if (lastUp > 0 && (now - lastUp) <= 300) {
      renderEditList();
      els.adminDialog.showModal();
    }
  }
});

async function init() {
  // Try remote first
  const remote = await loadPlayersRemote();
  if (remote && remote.length) {
    players = remote;
    savePlayersLocal(players); // cache
  } else {
    players = loadPlayersLocal();
  }
  selected = new Set();
  renderPlayersList();
  updateEnabledCount();
}
init();

