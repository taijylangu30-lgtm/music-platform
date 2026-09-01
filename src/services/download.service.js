const axios = require('axios');

const CHRISTUS_BASE_URL = process.env.CHRISTUS_API_URL || "https://apischristus.vercel.app";

/**
 * Interroge Christus pour valider le lien de téléchargement légal.
 * @param {string} trackId - Identifiant ou nom du morceau.
 */
async function getDownloadLink(trackId) {
  try {
    const response = await axios.get(`${CHRISTUS_BASE_URL}/api/download`, {
      params: { id: trackId },
      timeout: 6000
    });

    if (response.data && response.data.success && response.data.downloadUrl) {
      return {
        available: true,
        downloadUrl: response.data.downloadUrl,
        format: response.data.format || "mp3"
      };
    }
    return { available: false, reason: "Download unavailable" };
  } catch (error) {
    return { available: false, reason: "Download unavailable" };
  }
}

module.exports = { getDownloadLink };
