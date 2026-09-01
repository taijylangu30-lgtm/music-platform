document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  
  // Recherche par défaut au chargement
  performSearch("The Weeknd");

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    if (query.length > 2) {
      debounceTimer = setTimeout(() => performSearch(query), 400);
    }
  });
});

async function performSearch(query) {
  const grid = document.getElementById('tracks-grid');
  grid.innerHTML = '<p style="color: var(--text-muted)">Chargement...</p>';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const payload = await res.json();

    if (!payload.success || !payload.data.length) {
      grid.innerHTML = '<p style="color: var(--text-muted)">Aucun résultat trouvé.</p>';
      return;
    }

    renderTracks(payload.data);
  } catch (err) {
    grid.innerHTML = '<p style="color: var(--text-muted)">Erreur lors de la recherche.</p>';
  }
}

function renderTracks(tracks) {
  const grid = document.getElementById('tracks-grid');
  grid.innerHTML = '';

  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'track-card';

    card.innerHTML = `
      <div class="cover-wrapper">
        <img class="cover-art" src="${track.cover || '/images/default-cover.png'}" alt="${track.title}">
      </div>
      <div class="track-title">${track.title}</div>
      <div class="track-artist">${track.artist}</div>
      <div class="card-actions">
        <button class="btn btn-play" onclick='window.player.playTrack(${JSON.stringify(track)})'>▶ Écouter</button>
        <button class="btn btn-secondary" onclick="fetchLyrics('${encodeURIComponent(track.title)}', '${encodeURIComponent(track.artist)}')">🎤</button>
        <button class="btn btn-secondary" onclick="window.player.downloadTrack('${track.id}')">⬇</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

async function fetchLyrics(title, artist) {
  try {
    const res = await fetch(`/api/lyrics?title=${title}&artist=${artist}`);
    const payload = await res.json();

    if (!payload.success || !payload.data.lyrics) {
      showToast("🎤 Paroles indisponibles", "warning");
      return;
    }

    document.getElementById('lyrics-title').innerText = `${decodeURIComponent(title)} - ${decodeURIComponent(artist)}`;
    document.getElementById('lyrics-body').innerText = payload.data.lyrics;
    document.getElementById('lyrics-modal').classList.add('active');
  } catch (e) {
    showToast("🎤 Paroles indisponibles", "warning");
  }
}

function closeLyrics() {
  document.getElementById('lyrics-modal').classList.remove('active');
}
