const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./api'); // API dosyasını dahil et

const app = express();
const PORT = 3001;

// Ana sayfa yönlendirmesi
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(bodyParser.json());
app.use('/backend/functions', express.static(path.join(__dirname, 'functions')));

// API Rotalarını Bağla
app.use('/api', apiRoutes);

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
