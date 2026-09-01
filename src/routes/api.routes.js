const express = require('express');
const router = express.Router();

const { fetchMetadata } = require('../services/artwork.service');
const { getPlaybackStream } = require('../services/playback.service');
const { getDownloadLink } = require('../services/download.service');
const { getLyrics } = require('../services/lyrics.service');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: "OK", timestamp: new Date() },
    meta: {}
  });
});

// Recherche générale
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_QUERY", message: "Le paramètre 'q' est requis." }
    });
  }

  const results = await fetchMetadata(query, 20);
  res.json({
    success: true,
    data: results,
    meta: { total: results.length }
  });
});

// Playback (Lecture audio uniquement)
router.get('/play', async (req, res) => {
  const target = req.query.url || req.query.id;
  if (!target) {
    return res.status(400).json({
      success: false,
      error: { code: "MISSING_PARAM", message: "Le paramètre 'id' ou 'url' est requis." }
    });
  }

  const stream = await getPlaybackStream(target);
  if (!stream) {
    return res.status(503).json({
      success: false,
      error: { code: "PLAYBACK_UNAVAILABLE", message: "Service de lecture indisponible." }
    });
  }

  res.json({ success: true, data: stream, meta: {} });
});

// Download (Téléchargement via Christus uniquement)
router.get('/download', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      success: false,
      error: { code: "MISSING_PARAM", message: "L'identifiant du morceau 'id' est requis." }
    });
  }

  const dlInfo = await getDownloadLink(id);
  if (!dlInfo.available) {
    return res.status(403).json({
      success: false,
      error: { code: "DOWNLOAD_RESTRICTED", message: "🔒 Download unavailable" }
    });
  }

  res.json({ success: true, data: dlInfo, meta: {} });
});

// Paroles
router.get('/lyrics', async (req, res) => {
  const { title, artist } = req.query;
  if (!title || !artist) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_PARAMS", message: "Les paramètres 'title' et 'artist' sont requis." }
    });
  }

  const lyricsData = await getLyrics({ title, artist });
  if (!lyricsData) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "🎤 Paroles indisponibles" }
    });
  }

  res.json({ success: true, data: lyricsData, meta: {} });
});

module.exports = router;
