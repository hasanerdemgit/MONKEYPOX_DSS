const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', apiRoutes);
app.use('/', authRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/bolgesel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'bolgesel.html'));
});

app.get('/ilgenel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'ilgenel.html'));
});

app.get('/iltrend.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'iltrend.html'));
});

app.get('/tahmin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'tahmin.html'));
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`));
