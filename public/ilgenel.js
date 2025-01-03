document.addEventListener('DOMContentLoaded', () => {
    const defaultMonth = 12; // Varsayılan ay: Aralık

    fetchAndDisplayGeneralData(defaultMonth); // Kartları güncelle
    initializeMap(defaultMonth); // Haritayı başlat

    document.getElementById('monthSelect').addEventListener('change', (event) => {
        const selectedMonth = parseInt(event.target.value, 10);
        fetchAndDisplayGeneralData(selectedMonth); // Kartları güncelle
        initializeMap(selectedMonth); // Haritayı güncelle
    });

    document.getElementById('dataSelect').addEventListener('change', () => {
        const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);
        initializeMap(selectedMonth); // Veri parametresi değiştiğinde haritayı güncelle
    });
});

// Ay seçim kutusunu doldur
function populateMonthDropdown() {
    const monthSelect = document.getElementById('monthSelect');
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // Ay numarası
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    monthSelect.value = 12; // Varsayılan olarak Aralık ayı
}

// Kartlardaki verileri güncelle
function fetchAndDisplayGeneralData(month) {
    const apiUrl = `http://localhost:3001/api/genel-bilgiler?yil=2024&ay=${month}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const toplamVaka = data.toplam_vaka || 0;
            const toplamOlum = data.toplam_olum || 0;
            const toplamKapasite = data.toplam_karantina || 0;
            const toplamIlac = data.toplam_ilac || 0;

            // Kartları güncelle
            document.querySelector('.card.green p').textContent = formatNumber(toplamVaka);
            document.querySelector('.card.red p').textContent = formatNumber(toplamOlum);
            document.querySelector('.card.blue p').textContent = formatNumber(toplamKapasite);
            document.querySelector('.card.purple p').textContent = formatNumber(toplamIlac);
        })
        .catch(error => console.error('Kart verileri alınamadı:', error));
}

// Haritayı başlat ve güncelle
function initializeMap(month) {
    const selectedData = document.getElementById('dataSelect').value;

    const mapContainer = document.getElementById('mapp');
    if (!mapContainer) {
        console.error('Harita konteyneri (#mapp) bulunamadı.');
        return;
    }

    if (!window.map) {
        window.map = L.map(mapContainer).setView([39.925533, 32.866287], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window.map);
    } else {
        window.map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                window.map.removeLayer(layer);
            }
        });
    }

    fetch(`http://localhost:3001/api/il-genel-harita?yil=2024&ay=${month}`)
        .then(response => response.json())
        .then(data => {
            // String değerleri sayıya dönüştür
            const values = data
                .map(row => parseFloat(row[selectedData]))
                .filter(val => !isNaN(val)); // Geçersiz değerleri filtrele

            if (values.length === 0) {
                console.error('Geçerli veri bulunamadı. Ortalama hesaplanamaz.');
                return;
            }

            const max = Math.max(...values);
            const min = Math.min(...values);
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;

            console.log(`Max: ${max}, Min: ${min}, Average: ${average}`);

            data.forEach(row => {
                const value = parseFloat(row[selectedData]);
                if (isNaN(value)) return; // Geçersiz değerleri atla

                const color = getColor(value, min, max, average);

                L.circleMarker([parseFloat(row.latitude), parseFloat(row.longitude)], {
                    color: color,
                    radius: 10
                }).addTo(window.map).bindPopup(`
                    <b>${row.sehir}</b><br>
                    ${selectedData}: ${formatNumber(value)}<br>
                `);
            });
        })
        .catch(error => console.error('Harita verileri alınamadı:', error));
}




// Renk gradyanı için yardımcı fonksiyon
function getColor(value, min, max, average) {
    if (value === max) return '#8b0000'; // Koyu kırmızı (en yüksek)
    if (value > average) return '#ff6347'; // Açık kırmızı (ortalama üstü)
    if (value === average) return '#ffa500'; // Turuncu (ortalama)
    if (value > min && value < average) return '#7cfc00'; // Açık yeşil (ortalama altı)
    if (value === min) return '#006400'; // Koyu yeşil (en düşük)
    return '#000000'; // Hata durumu için siyah
}



// Sayıyı formatlama
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
