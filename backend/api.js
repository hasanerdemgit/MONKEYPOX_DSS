const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Veritabanı Bağlantısı
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'maymun_cicegi_kds'
}).promise();


// --------------------- API ENDPOINTLERİ ----------------------------------------------------------------------------------------------------------------------

router.get('/genel-bilgiler', async (req, res) => {
    const { yil, ay } = req.query;

    try {
        const [rows] = await db.query(`CALL genel_bilgiler(?, ?)`, [yil, ay]);
        res.json(rows[0][0]); // İlk sonucu döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

router.get('/grafik-degisim', async (req, res) => {
    const yil = req.query.yil || 2024;

    try {
        const [rows] = await db.query(`CALL grafik_degisim(?)`, [yil]);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

router.get('/bolgesel-veriler', async (req, res) => {
    const { yil, ay } = req.query;

    try {
        const [rows] = await db.query(`CALL bolgesel_veriler(?, ?)`, [yil, ay]);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


router.get('/sorgu', async (req, res) => {
    const { il, bolge, yil, ay } = req.query;

    try {
        const [rows] = await db.query(`CALL genel_sorgu(?, ?, ?, ?)`, [il || null, bolge || null, yil || null, ay || null]);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


router.get('/iller-trendi', async (req, res) => {
    const { il, yil } = req.query;

    try {
        const [rows] = await db.query(`CALL iller_trendi(?, ?)`, [il, yil]);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


router.get('/iller', async (req, res) => {
    try {
        const [rows] = await db.query(`CALL iller()`);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


router.get('/sehirler-konum', async (req, res) => {
    try {
        const [rows] = await db.query(`CALL sehirler_konum()`);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


router.get('/il-genel-harita', async (req, res) => {
    const { yil, ay } = req.query;

    if (!yil || !ay) {
        return res.status(400).json({ error: 'Yıl ve ay parametreleri gereklidir.' });
    }

    try {
        const [rows] = await db.query(`CALL il_genel_harita(?, ?)`, [yil, ay]);
        res.json(rows[0]); // Tüm sonuçları döndür
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------

const { spawn } = require('child_process');
const path = require('path');

router.get('/tahmin', async (req, res) => {
    try {
        // Stored Procedure çağrısı
        const [rows] = await db.query(`CALL tahmin_veri()`);

        // Python scriptine veri gönder
        const process = spawn('python', [path.join(__dirname, 'functions', 'tahmin_modeli.py'), JSON.stringify(rows[0])]);
        let output = ''; // Python'dan gelen çıktı için bir buffer

        // Python stdout çıktısını biriktir
        process.stdout.on('data', (data) => {
            output += data.toString('utf-8'); // UTF-8 formatında biriktir
        });

        // Python stderr çıktısını dinle
        process.stderr.on('data', (error) => {
            console.error('Python Hatası:', error.toString());
            if (!res.headersSent) {
                res.status(500).json({ error: 'Tahmin işlemi sırasında bir hata oluştu.' });
            }
        });

        // Python işlemi tamamlandığında tüm çıktıyı işleyin
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const tahminSonuclari = JSON.parse(output.trim()); // JSON ayrıştırma
                    if (!res.headersSent) {
                        res.json(tahminSonuclari); // Yanıt gönder
                    }
                } catch (error) {
                    console.error('JSON Pars Hatası:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Tahmin sonuçları işlenemedi.' });
                    }
                }
            } else {
                console.error('Python scripti beklenmedik şekilde kapandı.');
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Python scripti başarısız oldu.' });
                }
            }
        });

    } catch (error) {
        console.error('Veritabanı Hatası:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Veriler alınamadı.' });
        }
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir.' });
    }

    try {
        const [rows] = await db.query(`CALL login_kontrol(?, ?)`, [username, password]);
        if (rows[0].length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre.' });
        }
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// API: Tarih ve Saat
router.get('/tarih-saat', (req, res) => {
    const now = new Date();
    res.json({
        tarih: now.toLocaleDateString('tr-TR'),
        saat: now.toLocaleTimeString('tr-TR'),
    });
});

module.exports = router;
