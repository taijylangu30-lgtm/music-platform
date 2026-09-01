const axios = require('axios');

const APIS_CONFIG_URL = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

/**
 * Récupère le flux de lecture audio via le provider distant.
 * @param {string} trackUrl - URL ou nom de la piste à lire.
 */
async function getPlaybackStream(trackUrl) {
  try {
    const configRes = await axios.get(APIS_CONFIG_URL, { timeout: 5000 });
    const baseApi = configRes.data && configRes.data.api;
    if (!baseApi) throw new Error("Configuration API absente dans apis.json");

    const endpoint = `${baseApi}/play?url=${encodeURIComponent(trackUrl)}`;
    const response = await axios.get(endpoint, { timeout: 8000 });

    if (!response.data || !response.data.status || !response.data.downloadUrl) {
      throw new Error("Playback provider indisponible");
    }

    return {
      streamUrl: response.data.downloadUrl,
      title: response.data.title || "Titre inconnu",
      duration: response.data.duration || null
    };
  } catch (error) {
    console.error("[PlaybackService Error]:", error.message);
    return null;
  }
}

module.exports = { getPlaybackStream };
