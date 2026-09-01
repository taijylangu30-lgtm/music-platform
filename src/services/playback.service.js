const axios = require('axios');

const APIS_CONFIG_URL = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

/**
 * Récupère le lien de flux audio ou de téléchargement.
 * @param {string} trackUrl - URL ou titre à convertir en flux audio.
 */
async function getPlaybackStream(trackUrl) {
  let baseApi = process.env.CHRISTUS_API_URL || "https://apischristus.vercel.app";

  // Tente d'abord de récupérer l'API dynamique distante
  try {
    const configRes = await axios.get(APIS_CONFIG_URL, { timeout: 3000 });
    if (configRes.data && configRes.data.api) {
      baseApi = configRes.data.api;
    }
  } catch (err) {
    console.warn("[PlaybackService] apis.json inaccessible, secours sur la variable d'environnement.");
  }

  try {
    // 1. Essai sur l'endpoint /play
    const endpoint = `${baseApi}/play?url=${encodeURIComponent(trackUrl)}`;
    const response = await axios.get(endpoint, { timeout: 10000 });

    const downloadUrl = response.data?.downloadUrl || response.data?.url || response.data?.stream;
    
    if (downloadUrl) {
      return {
        streamUrl: downloadUrl,
        title: response.data.title || "Titre musical",
        duration: response.data.duration || null
      };
    }

    // 2. Fallback direct si la structure de réponse diffère
    const fallbackEndpoint = `${baseApi}/download?url=${encodeURIComponent(trackUrl)}`;
    const fallbackRes = await axios.get(fallbackEndpoint, { timeout: 10000 });
    const fallbackUrl = fallbackRes.data?.downloadUrl || fallbackRes.data?.url;

    if (fallbackUrl) {
      return {
        streamUrl: fallbackUrl,
        title: fallbackRes.data.title || "Titre musical",
        duration: fallbackRes.data.duration || null
      };
    }

    throw new Error("Aucun lien audio valide renvoyé par l'API.");
  } catch (error) {
    console.error("[PlaybackService Error]:", error.message);
    return null;
  }
}

module.exports = { getPlaybackStream };
