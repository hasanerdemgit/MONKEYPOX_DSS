# Maymun Çiçeği Virüsü Karar Destek Sistemi

Bu proje,  **Maymun Çiçeği Virüsü** simüle edilerek,Türkiye'deki vakalarını analiz etmek ve karar destek önerileri sunmak için geliştirilmiştir.

## Özellikler
- **Vaka Takibi:** Ay ve bölge bazında vaka ve ölüm sayılarının takibi.
- **Grafik ve Haritalar:** Verilerin görselleştirilmesi için çizgi grafikler ve haritalar.
- **Tahmin Modülü:** Bölgesel risk seviyelerini tahmin eden ARIMA model entegrasyonu.
- **Karantina Kapasite Yönetimi:** Ek kapasite ve ilaç ihtiyaçlarına yönelik öneriler.

## Kullanılan Teknolojiler
- JavaScript
- Node.js
- Express.js
- Leaflet.js
- Python
- ARIMA
- MySQL
- HTML
- CSS



## Proje Yapısı (MVC)
- `/controllers` -> Backend kontrolcüleri (API ve Auth yönetimi)
- `/models`      -> Veritabanı bağlantıları ve tahmin model dosyası
- `/node_modules`-> Node.js bağımlılıkları
- `/public`      -> Statik dosyalar (CSS ve JS)
- `/routes`      -> API ve Auth için rota tanımları
- `/views`       -> HTML dosyaları
- `package.json` -> Node.js proje yapılandırması
- `server.js`    -> Ana sunucu dosyası
- `README.md`    -> Proje açıklama dosyası

## Kurulum
1. Repoyu klonlayın.
  
2. Veritabanını oluşturun ve `db` klasöründeki .sql dosyasını içeri aktarın.

3. `npm install` ile Node.js bağımlılıklarını yükleyin.

3. Terminale `node server.js` yazarak uygulamayı başlatın.

5. Tarayıcınızda http://localhost:3001 adresine gidin.


## Kullanım
1. Giriş Yapın: `login.html` üzerinden  kullanıcı adı **admin** ve şifre **admin** giriş yapın.
2. Dashboard: `index.html` üzerinden genel istatistikleri ve analizleri görüntüleyin.
3. Haritalar ve Grafikler: İl bazında trendleri `iltrend.html` ile görüntüleyin.
4. Bölgesel verileri `bolgesel.html` ile analiz edin.
5. Tahmin Modülü: `tahmin.html` üzerinden **ARIMA** model sonuçlarını görüntüleyin.

## Katkıda Bulunun
Projeye katkıda bulunmak için bir `fork` yapabilir, değişikliklerinizi yapabilir ve bir `pull request` gönderebilirsiniz.

---

> **Bu proje,Dokuz Eylül Üniversitesi Yönetim Bilişim Sistemleri Bölümü Karar Destek Sistemleri Dersi Dönem Proje Ödevi olarak Türkiye'deki sağlık sistemlerini güçlendirmek adına geliştirilmiştir.**

🚀 **Geliştirici:** [Hasan Erdem](https://github.com/hasanerdemgit)  
📧 **E-posta:** mailhasanerdem@gmail.com  
📅 **Tarih:** Ocak 2025
