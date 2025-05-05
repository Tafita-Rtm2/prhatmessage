// server.js
const express = require('express');
const path = require('path');
const app = express();

// Sert les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Toutes les routes renvoient index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
