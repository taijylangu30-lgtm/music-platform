const axios = require('axios');

/**
 * Récupère les paroles avec fallback Musixmatch -> LrcLib.
 * @param {Object} params - Contient title et artist
 */
async function getLyrics({ title, artist }) {
  // 1. Essai Musixmatch si la clé API est présente
  if (process.env.MUSIXMATCH_API_KEY) {
    try {
      const mxRes = await axios.get("https://api.musixmatch.com/ws/1.1/matcher.lyrics.get", {
        params: {
          q_track: title,
          q_artist: artist,
          apikey: process.env.MUSIXMATCH_API_KEY
        },
        timeout: 5000
      });
      const body = mxRes.data?.message?.body?.lyrics;
      if (body?.lyrics_body) {
        return { source: "Musixmatch", lyrics: body.lyrics_body };
      }
    } catch (e) {
      console.warn("[Lyrics] Musixmatch échoué, bascule vers LrcLib");
    }
  }

  // 2. Secours LrcLib
  try {
    const lrcRes = await axios.get("https://lrclib.net/api/get", {
      params: { track_name: title, artist_name: artist },
      timeout: 5000
    });
    if (lrcRes.data && (lrcRes.data.syncedLyrics || lrcRes.data.plainLyrics)) {
      return {
        source: "LrcLib",
        lyrics: lrcRes.data.plainLyrics || lrcRes.data.syncedLyrics
      };
    }
  } catch (e) {
    return null;
  }

  return null;
}

module.exports = { getLyrics };
