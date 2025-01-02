document.addEventListener('DOMContentLoaded', () => {
    loadRegions();
    setupRegionSelection();
    initializeRiskMap();
    generateRecommendations();
});

// Bölgeleri API'den al ve açılır listeyi doldur
function loadRegions() {
    fetch('http://localhost:3001/api/tahmin')
        .then(response => response.json())
        .then(data => {
            const regionSelect = document.getElementById('regionSelect');
            Object.keys(data).forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Bölgeler yüklenemedi:', error));
}

// Seçilen bölgeye göre grafik oluştur
function setupRegionSelection() {
    const regionSelect = document.getElementById('regionSelect');
    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        if (selectedRegion) {
            loadRegionChart(selectedRegion);
        }
    });
}

// Bölge grafiğini yükle
function loadRegionChart(region) {
    fetch('http://localhost:3001/api/tahmin')
        .then(response => response.json())
        .then(data => {
            const forecastData = data[region].tahminler.map(item => item.tahmin_vaka);
            const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}. Ay`);
            const ctx = document.getElementById('forecastChart').getContext('2d');

            // Grafik oluştur veya güncelle
            if (window.forecastChart instanceof Chart) {
                window.forecastChart.destroy(); // Önceki grafik varsa yok et
            }
            window.forecastChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${region} Tahmini Vaka Sayısı`,
                        data: forecastData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                }
            });
        })
        .catch(error => console.error('Grafik verileri yüklenemedi:', error));
}

// Risk haritasını başlat
function initializeRiskMap() {
    const map = L.map('riskMap').setView([39.925533, 32.866287], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    fetch('http://localhost:3001/api/tahmin')
        .then(response => response.json())
        .then(data => {
            Object.entries(data).forEach(([region, details]) => {
                const color = details.risk_seviyesi === 'Yuksek Risk' ? 'red' :
                              details.risk_seviyesi === 'Orta Risk' ? 'yellow' : 'green';

                L.circleMarker(getCoordinates(region), {
                    color: color,
                    radius: 10,
                    fillColor: color,
                    fillOpacity: 0.5
                }).addTo(map).bindPopup(`
                    <strong>${region}</strong><br>
                    Risk Seviyesi: ${details.risk_seviyesi}<br>
                    Ek Kapasite: ${details.kapasite_onerisi}<br>
                    İlaç İhtiyacı: ${details.ilac_ihtiyaci}
                `);
            });
        })
        .catch(error => console.error('Risk haritası yüklenemedi:', error));
}

// Öneri listesini oluştur
function generateRecommendations() {
    fetch('http://localhost:3001/api/tahmin')
        .then(response => response.json())
        .then(data => {
            const listElement = document.getElementById('recommendationsList');
            Object.entries(data).forEach(([region, details]) => {
                const li = document.createElement('li');
                li.textContent = `${region}: ${details.kapasite_onerisi} ek kapasite ve ${details.ilac_ihtiyaci} adet ek ilaç stoğu önerilir.`;
                listElement.appendChild(li);
            });
        })
        .catch(error => console.error('Öneriler oluşturulamadı:', error));
}

// Bölge isimlerine göre koordinatlar
function getCoordinates(region) {
    const coordinates = {
        "Ege Bolgesi": [38.4192, 27.1287],
        "Marmara Bolgesi": [40.8533, 29.3773],
        "Akdeniz Bolgesi": [37.0, 35.3213],
        "Karadeniz Bolgesi": [41.1258, 37.6543],
        "Ic Anadolu Bolgesi": [39.92077, 32.85411],
        "Dogu Anadolu Bolgesi": [39.6464, 41.1342],
        "Guneydogu Anadolu Bolgesi": [37.5775, 37.9375]
    };
    return coordinates[region] || [39.92077, 32.85411];
}
