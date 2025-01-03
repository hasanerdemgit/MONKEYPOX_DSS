const db = require('../models/database');
const path = require('path');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Kullanıcı Adı:', username, 'Şifre:', password);

        // Veritabanı prosedürünü çağır
        const [rows] = await db.query('CALL login_kontrol(?, ?)', [username, password]);
        console.log('Prosedür Yanıtı:', rows);

        if (rows[0].length > 0) {
            console.log('Giriş Başarılı!');
            res.json({ success: true }); // JSON formatında başarı yanıtı gönder
        } else {
            console.log('Giriş Başarısız. Kullanıcı adı veya şifre yanlış.');
            res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });
        }
    } catch (error) {
        console.error('Veritabanı Hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası. Lütfen tekrar deneyin.' });
    }
};
