// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Define la carpeta estática (solo webapp/)
const staticDir = path.join(__dirname, 'webapp');
app.use(express.static(staticDir));

// Redirige todas las rutas al index.html (útil si usas rutas en el front)
app.get('*', (_, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor web escuchando en puerto ${PORT}`);
});
