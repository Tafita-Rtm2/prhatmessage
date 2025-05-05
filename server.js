// server.js
const express = require('express');
const path = require('path');
const app = express();

// Sert tout le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Redirige toutes les routes vers index.html (SPA)
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
