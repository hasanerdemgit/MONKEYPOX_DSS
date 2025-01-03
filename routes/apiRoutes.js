const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/genel-bilgiler',apiController.getGenelBilgiler);

router.get('/grafik-degisim',apiController.getGrafikDegisim);

router.get('/bolgesel-veriler',apiController.getBolgeselVeriler);

router.get('/sorgu',apiController.getSorgu);

router.get('/iller-trendi',apiController.getIllerTrendi);

router.get('/iller',apiController.getIller);

router.get('/sehirler-konum',apiController.getSehirlerKonum);

router.get('/il-genel-harita',apiController.getIlGenelHarita);

router.get('/tahmin',apiController.getTahmin);

router.get('/tarih-saat',apiController.getTarihSaat);

module.exports = router;

