const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Eventa Flora - Petualangan di Dunia Flora berjalan!' });
});

app.use('/api/game', gameRoutes);

app.listen(PORT, () => {
  console.log(`Server Eventa Flora berjalan di http://localhost:${PORT}`);
});