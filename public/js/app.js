let currentTrack = null;
let lastSearchQuery = "";

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');

  // Charger la vue d'accueil
  loadHomePage();

  // Événements de recherche
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length > 2) {
      debounceTimer = setTimeout(() => handleSearch(query), 400);
    } else if (query.length === 0) {
      showView('view-home');
    }
  });

  // Boutons de navigation
  document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    showView('view-home');
  });

  document.getElementById('btn-back-home').addEventListener('click', () => {
    showView('view-home');
  });

  document.getElementById('btn-back-results').addEventListener('click', () => {
    if (lastSearchQuery) {
      showView('view-search');
    } else {
      showView('view-home');
    }
  });
});

// Router des Vues
function showView(viewId) {
  document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');

  document.getElementById('nav-home').classList.toggle('active', viewId === 'view-home');
}

// 1. Charger l'Accueil
async function loadHomePage() {
  const homeGrid = document.getElementById('home-grid');
  homeGrid.innerHTML = '<p style="color: var(--text-muted)">Chargement des tendances...</p>';

  try {
    const res = await fetch(`/api/search?q=Top%20Hits%202026`);
    const payload = await res.json();

    if (payload.success && payload.data.length) {
      renderGrid(homeGrid, payload.data);
    }
  } catch (err) {
    homeGrid.innerHTML = '<p style="color: var(--text-muted)">Erreur lors du chargement.</p>';
  }
}

// 2. Gestion de la Recherche
async function handleSearch(query) {
  lastSearchQuery = query;
  showView('view-search');

  document.getElementById('search-query-title').innerText = `Résultats pour "${query}"`;
  const searchGrid = document.getElementById('search-grid');
  searchGrid.innerHTML = '<p style="color: var(--text-muted)">Recherche en cours...</p>';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const payload = await res.json();

    if (!payload.success || !payload.data.length) {
      searchGrid.innerHTML = '<p style="color: var(--text-muted)">Aucun résultat trouvé.</p>';
      return;
    }

    renderGrid(searchGrid, payload.data);
  } catch (err) {
    searchGrid.innerHTML = '<p style="color: var(--text-muted)">Erreur de connexion.</p>';
  }
}

// Render des cartes de morceaux
function renderGrid(container, tracks) {
  container.innerHTML = '';

  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'track-card';

    card.innerHTML = `
      <div class="cover-wrapper">
        <img class="cover-art" src="${track.cover || '/images/default-cover.png'}" alt="${track.title}">
      </div>
      <div class="track-title">${track.title}</div>
      <div class="track-artist">${track.artist}</div>
    `;

    // Clic pour ouvrir la page Pro du morceau
    card.addEventListener('click', () => openTrackDetails(track));
    container.appendChild(card);
  });
}

// 3. Ouvrir la Page Dédiée / Pro
function openTrackDetails(track) {
  currentTrack = track;

  document.getElementById('detail-cover').src = track.cover;
  document.getElementById('detail-title').innerText = track.title;
  document.getElementById('detail-artist').innerText = track.artist;
  document.getElementById('detail-album').innerText = track.album || 'Single';

  // Association des boutons
  document.getElementById('btn-detail-play').onclick = () => window.player.playTrack(track);
  document.getElementById('btn-detail-download').onclick = () => downloadMedia(track);
  document.getElementById('btn-detail-lyrics').onclick = () => fetchLyrics(track.title, track.artist);

  showView('view-track-details');
}

// Téléchargement Sécurisé
async function downloadMedia(track) {
  try {
    showToast("⌛ Préparation du téléchargement...", "info");

    const trackQuery = `${track.title} ${track.artist}`;
    const res = await fetch(`/api/download?id=${encodeURIComponent(track.id || trackQuery)}`);
    const payload = await res.json();

    if (payload.success && payload.data?.downloadUrl) {
      const a = document.createElement('a');
      a.href = payload.data.downloadUrl;
      a.download = `${track.title} - ${track.artist}.mp3`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("✅ Téléchargement démarré !", "success");
    } else {
      showToast("🔒 Téléchargement indisponible pour ce titre", "error");
    }
  } catch (err) {
    showToast("❌ Erreur lors du téléchargement", "error");
  }
}

// Gestion des Paroles
async function fetchLyrics(title, artist) {
  try {
    const res = await fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
    const payload = await res.json();

    if (!payload.success || !payload.data.lyrics) {
      showToast("🎤 Paroles indisponibles", "warning");
      return;
    }

    document.getElementById('lyrics-title').innerText = `${title} - ${artist}`;
    document.getElementById('lyrics-body').innerText = payload.data.lyrics;
    document.getElementById('lyrics-modal').classList.add('active');
  } catch (e) {
    showToast("🎤 Paroles indisponibles", "warning");
  }
}

function closeLyrics() {
  document.getElementById('lyrics-modal').classList.remove('active');
}
