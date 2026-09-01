const axios = require('axios');

/**
 * Recherche de métadonnées et pochette haute définition via iTunes.
 * @param {string} query - Terme de recherche
 * @param {number} limit - Limite de résultats
 */
async function fetchMetadata(query, limit = 20) {
  try {
    const response = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: query,
        media: "music",
        entity: "song",
        limit: limit
      },
      timeout: 5000
    });

    if (!response.data || !response.data.results) return [];

    return response.data.results.map(item => ({
      id: item.trackId.toString(),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName || "Single",
      cover: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : null,
      duration: item.trackTimeMillis,
      releaseDate: item.releaseDate,
      genre: item.primaryGenreName,
      officialUrl: item.trackViewUrl
    }));
  } catch (error) {
    console.error("[ArtworkService Error]:", error.message);
    return [];
  }
}

module.exports = { fetchMetadata };
