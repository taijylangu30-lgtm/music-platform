const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const apiRoutes = require('./src/routes/api.routes');

const app = express();

// Middlewares de sécurité et de configuration
app.use(helmet({
  contentSecurityPolicy: false // Nécessaire pour charger les pochettes iTunes dynamiquement
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'public')));

// Enregistrement des routes API
app.use('/api', apiRoutes);

// Route documentation développeurs
app.get('/developers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'developers.html'));
});

// Route par défaut (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Une erreur interne est survenue sur le serveur.'
    }
  });
});

// Démarrage du serveur avec écoute sur le port Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Plateforme MUSIC démarrée sur le port ${PORT}`);
});
