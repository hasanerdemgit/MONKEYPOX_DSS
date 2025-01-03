const db = require('../models/database');
const { spawn } = require('child_process');
const path = require('path');


exports.getGenelBilgiler = async (req, res) => {
    const { yil, ay } = req.query;

    try {
        const [rows] = await db.query(`CALL genel_bilgiler(?, ?)`, [yil, ay]);
        res.json(rows[0][0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};

exports.getGrafikDegisim = async (req, res) => {
    const yil = req.query.yil || 2024;

    try {
        const [rows] = await db.query(`CALL grafik_degisim(?)`, [yil]);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};

exports.getBolgeselVeriler = async (req, res) => {
    const { yil, ay } = req.query;

    try {
        const [rows] = await db.query(`CALL bolgesel_veriler(?, ?)`, [yil, ay]);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};


exports.getSorgu = async (req, res) => {
    const { il, bolge, yil, ay } = req.query;

    try {
        const [rows] = await db.query(`CALL genel_sorgu(?, ?, ?, ?)`, [il || null, bolge || null, yil || null, ay || null]);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};


exports.getIllerTrendi = async (req, res) => {
    const { il, yil } = req.query;

    try {
        const [rows] = await db.query(`CALL iller_trendi(?, ?)`, [il, yil]);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};


exports.getIller = async (req, res) => {
    try {
        const [rows] = await db.query(`CALL iller()`);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};


exports.getSehirlerKonum = async (req, res) => {
    try {
        const [rows] = await db.query(`CALL sehirler_konum()`);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};


exports.getIlGenelHarita = async (req, res) => {
    const { yil, ay } = req.query;

    if (!yil || !ay) {
        return res.status(400).json({ error: 'Yıl ve ay parametreleri gereklidir.' });
    }

    try {
        const [rows] = await db.query(`CALL il_genel_harita(?, ?)`, [yil, ay]);
        res.json(rows[0]); 
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
};



exports.getTahmin = async (req, res) => {
    try {
        
        const [rows] = await db.query(`CALL tahmin_veri()`);

        
        const process = spawn('python', [path.join(__dirname, '../models/tahmin_modeli.py'), JSON.stringify(rows[0])]);
        let output = ''; 

        
        process.stdout.on('data', (data) => {
            output += data.toString('utf-8'); 
        });

        
        process.stderr.on('data', (error) => {
            console.error('Python Hatası:', error.toString());
            if (!res.headersSent) {
                res.status(500).json({ error: 'Tahmin işlemi sırasında bir hata oluştu.' });
            }
        });

        
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const tahminSonuclari = JSON.parse(output.trim()); 
                    if (!res.headersSent) {
                        res.json(tahminSonuclari); 
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
};


exports.getTarihSaat = (req, res) => {
    const now = new Date();
    res.json({
        tarih: now.toLocaleDateString('tr-TR'),
        saat: now.toLocaleTimeString('tr-TR'),
    });
};

module.exports = exports;
