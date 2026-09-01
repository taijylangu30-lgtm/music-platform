class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentTrack = null;
    this.isPlaying = false;
    this.initListeners();
  }

  initListeners() {
    this.audio.addEventListener('ended', () => this.onTrackEnd());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());

    document.getElementById('btn-play-toggle').addEventListener('click', () => this.togglePlay());
    document.getElementById('player-progress').addEventListener('input', (e) => {
      if (this.audio.duration) {
        this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
      }
    });
  }

  async playTrack(track) {
    this.currentTrack = track;
    this.updateUI();

    showToast("🎵 Chargement du morceau...", "info");

    try {
      const res = await fetch(`/api/play?id=${encodeURIComponent(track.id)}`);
      const payload = await res.json();

      if (!payload.success || !payload.data.streamUrl) {
        showToast("▶️ Playback unavailable", "warning");
        return;
      }

      this.audio.src = payload.data.streamUrl;
      await this.audio.play();
      this.isPlaying = true;

      document.getElementById('persistent-player').classList.remove('hidden');
      this.updatePlayStateUI();
    } catch (err) {
      showToast("❌ Impossible de lire ce morceau.", "error");
    }
  }

  togglePlay() {
    if (!this.audio.src) return;
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play();
      this.isPlaying = true;
    }
    this.updatePlayStateUI();
  }

  async downloadTrack(trackId) {
    try {
      const res = await fetch(`/api/download?id=${encodeURIComponent(trackId)}`);
      const payload = await res.json();

      if (!payload.success || !payload.data.downloadUrl) {
        showToast("🔒 Download unavailable", "warning");
        return;
      }

      window.open(payload.data.downloadUrl, '_blank');
    } catch (e) {
      showToast("🔒 Download unavailable", "warning");
    }
  }

  updateUI() {
    if (!this.currentTrack) return;
    document.getElementById('player-cover').src = this.currentTrack.cover || '';
    document.getElementById('player-title').innerText = this.currentTrack.title;
    document.getElementById('player-artist').innerText = this.currentTrack.artist;
  }

  updatePlayStateUI() {
    const btn = document.getElementById('btn-play-toggle');
    btn.innerText = this.isPlaying ? '⏸' : '▶';
  }

  updateProgress() {
    const bar = document.getElementById('player-progress');
    if (bar && this.audio.duration) {
      bar.value = (this.audio.currentTime / this.audio.duration) * 100;
    }
  }

  onTrackEnd() {
    this.isPlaying = false;
    this.updatePlayStateUI();
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

window.player = new MusicPlayer();
