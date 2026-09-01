const axios = require('axios');

const APIS_CONFIG_URL = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

/**
 * Récupère le flux de lecture audio via le provider distant avec fallback.
 * @param {string} trackUrl - URL ou nom de la piste à lire.
 */
async function getPlaybackStream(trackUrl) {
  let baseApi = null;

  // 1. Tente de récupérer l'API dynamique distante
  try {
    const configRes = await axios.get(APIS_CONFIG_URL, { timeout: 4000 });
    if (configRes.data && configRes.data.api) {
      baseApi = configRes.data.api;
    }
  } catch (err) {
    console.warn("[PlaybackService] apis.json inaccessible, bascule sur le serveur de secours.");
  }

  // Fallback si la source GitHub ne répond pas
  if (!baseApi) {
    baseApi = process.env.CHRISTUS_API_URL || "https://apischristus.vercel.app";
  }

  try {
    const endpoint = `${baseApi}/play?url=${encodeURIComponent(trackUrl)}`;
    const response = await axios.get(endpoint, { timeout: 8000 });

    if (response.data && (response.data.downloadUrl || response.data.url)) {
      return {
        streamUrl: response.data.downloadUrl || response.data.url,
        title: response.data.title || "Titre musical",
        duration: response.data.duration || null
      };
    }
    throw new Error("Lien audio non renvoyé par le provider");
  } catch (error) {
    console.error("[PlaybackService Error]:", error.message);
    return null;
  }
}

module.exports = { getPlaybackStream };
