document.addEventListener('DOMContentLoaded', () => {
    // Varsayılan değerler
    let selectedProvince = 'Adana'; // Varsayılan il
    const defaultMonth = 12; // Varsayılan ay: Aralık

    populateProvinceDropdown(); // Dropdown'u doldur

    // Varsayılan seçimlerle başlat
    document.getElementById('monthSelect').value = defaultMonth;
    document.getElementById('ilSelectBottom').value = selectedProvince;

    fetchProvinceData(selectedProvince, defaultMonth); // Varsayılan il ve ay verilerini getir
    updateProvinceTrends(selectedProvince, 2024); // Varsayılan grafik
    initializeMap(defaultMonth); // Varsayılan haritayı başlat

    // Ay seçim kutusunu güncelle
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.addEventListener('change', (event) => {
        const selectedMonth = parseInt(event.target.value, 10);
        fetchProvinceData(selectedProvince, selectedMonth);
        updateProvinceTrends(selectedProvince, 2024); // Grafik güncelleme
        initializeMap(selectedMonth); // Haritayı güncelle
    });

    // İl seçim kutusunu güncelle
    const ilSelectBottom = document.getElementById('ilSelectBottom');
    ilSelectBottom.addEventListener('change', (event) => {
        selectedProvince = event.target.value;
        const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);
        fetchProvinceData(selectedProvince, selectedMonth);
        updateProvinceTrends(selectedProvince, 2024); // Grafik güncelleme
        initializeMap(selectedMonth); // Haritayı güncelle
    });

    // İki ilin karşılaştırmasını güncelle
    const ilCompareBottom = document.getElementById('ilCompareBottom');
    ilCompareBottom.addEventListener('change', () => fetchAndCompareDataBottom(2024));
});

// İl seçim kutusunu doldur
function populateProvinceDropdown() {
    fetch('http://localhost:3001/api/iller')
        .then(response => response.json())
        .then(data => {
            const ilSelectBottom = document.getElementById('ilSelectBottom');
            const ilCompareBottom = document.getElementById('ilCompareBottom');

            data.forEach(province => {
                const option1 = document.createElement('option');
                option1.value = province.il_adi;
                option1.textContent = province.il_adi;

                const option2 = option1.cloneNode(true);

                ilSelectBottom.appendChild(option1);
                ilCompareBottom.appendChild(option2);
            });
        })
        .catch(error => console.error('İl bilgileri alınamadı:', error));
}



// İl bazlı genel verileri çek
function fetchProvinceData(provinceName, month) {
    const year = 2024; // Varsayılan yıl
    fetch(`http://localhost:3001/api/sorgu?il=${provinceName}&yil=${year}&ay=${month}`)
        .then(response => response.json())
        .then(data => {
            const currentData = data[0];
            fetch(`http://localhost:3001/api/sorgu?il=${provinceName}&yil=${year}&ay=${month - 1}`)
                .then(prevResponse => prevResponse.json())
                .then(prevData => {
                    const previousData = prevData[0];
                    updateProvinceCards(currentData, previousData); // Mevcut ve önceki ay verilerini işleyin
                })
                .catch(error => console.error('Önceki ay verileri alınamadı:', error));
        })
        .catch(error => console.error('İl bazlı veriler alınamadı:', error));
}

// Kartları güncelle
function updateProvinceCards(currentData, previousData) {
    if (!currentData) return; // Eğer veri boşsa işlem yapma

    const fields = [
        { field: 'toplam_vaka', cardClass: '.card.green' },
        { field: 'toplam_olum', cardClass: '.card.red' },
        { field: 'toplam_kapasite', cardClass: '.card.blue' },
        { field: 'toplam_ilac', cardClass: '.card.purple' }
    ];

    fields.forEach(({ field, cardClass }) => {
        const currentValue = currentData[field] || 0;
        const previousValue = previousData ? previousData[field] || 0 : 0;
        const difference = currentValue - previousValue;
        const percentageChange = ((difference / (previousValue || 1)) * 100).toFixed(2); // Yüzde hesapla

        const card = document.querySelector(cardClass);
        const valueElement = card.querySelector('p');
        const differenceElement = card.querySelector('.difference');

        valueElement.textContent = formatNumber(currentValue);

        // Artış/Azalış bilgisi
        if (!differenceElement) {
            const diffElement = document.createElement('span');
            diffElement.className = 'difference';
            diffElement.style.display = 'block';
            diffElement.style.fontSize = '0.9em';
            diffElement.style.color = difference >= 0 ? 'green' : 'red';
            card.appendChild(diffElement);
            diffElement.textContent = `${difference >= 0 ? '+' : ''}${formatNumber(difference)} (${percentageChange}% ${difference >= 0 ? 'Artış' : 'Azalış'})`;
        } else {
            differenceElement.textContent = `${difference >= 0 ? '+' : ''}${formatNumber(difference)} (${percentageChange}% ${difference >= 0 ? 'Artış' : 'Azalış'})`;
            differenceElement.style.color = difference >= 0 ? 'green' : 'red';
        }
    });
}

// Grafik verilerini güncelle
function updateProvinceTrends(provinceName, year) {
    fetch(`http://localhost:3001/api/iller-trendi?il=${provinceName}&yil=${year}`)
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => `${item.ay}. Ay`);
            const vakaData = data.map(item => item.toplam_vaka || 0);
            const olumData = data.map(item => item.toplam_olum || 0);
            const kapasiteData = data.map(item => item.toplam_kapasite || 0);
            const ilacData = data.map(item => item.toplam_ilac || 0);

            createCombinedProvinceChart(labels, vakaData, olumData, kapasiteData, ilacData);
        })
        .catch(error => console.error('İl trend verileri alınamadı:', error));
}


// Haritayı başlat ve markerları ekle
function initializeMap(month) {
    if (window.map && typeof window.map.eachLayer === 'function') {
        window.map.eachLayer(layer => {
            if (!layer._url) { // TileLayer dışındaki layerları kaldır
                window.map.removeLayer(layer);
            }
        });
    } else {
        window.map = L.map('map').setView([39.925533, 32.866287], 6); // Türkiye merkezli başlat
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data © OpenStreetMap contributors'
        }).addTo(window.map);
    }

    let isCtrlPressed = false; // CTRL tuşunun durumu
    let selectedCities = []; // Seçilen şehirler

    // CTRL tuşu kontrolü
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Control') isCtrlPressed = true;
    });
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Control') isCtrlPressed = false;
    });

    try {
        fetch(`http://localhost:3001/api/sehirler-konum?ay=${month}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(city => {
                    const markerIcon = L.icon({
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                        iconSize: [12, 20], // Varsayılan boyut
                        iconAnchor: [6, 20], // Anchor noktası
                        popupAnchor: [0.5, -17] // Popup açılma noktası
                    });

                    const marker = L.marker([city.latitude, city.longitude], { icon: markerIcon }).addTo(window.map);


                    marker.on('click', () => {
                        if (isCtrlPressed) {
                            if (!selectedCities.includes(city.il_adi)) {
                                selectedCities.push(city.il_adi);
                            }
                        } else {
                            selectedCities = [city.il_adi];
                        }

                        const promises = selectedCities.map(il =>
                            fetch(`http://localhost:3001/api/sorgu?il=${il}&ay=${month}`)
                                .then(response => response.json())
                        );

                        Promise.all(promises).then(results => {
                            let popupContent = '';
                            results.forEach((details, index) => {
                                const cityDetails = details[0];
                                popupContent += `
                                    <b>${selectedCities[index]}</b><br>
                                    Vaka Sayısı: ${formatNumber(cityDetails.toplam_vaka)}<br>
                                    Ölüm Sayısı: ${formatNumber(cityDetails.toplam_olum)}<br>
                                    Karantina Kapasitesi: ${formatNumber(cityDetails.toplam_kapasite)}<br>
                                    İlaç Miktarı: ${formatNumber(cityDetails.toplam_ilac)}<br><br>
                                `;
                            });
                            if (!marker.getPopup()) {
                                marker.bindPopup(popupContent).openPopup();
                            } else {
                                marker.setPopupContent(popupContent).openPopup();
                            }
                        }).catch(error => console.error('Popup içeriği güncellenemedi:', error));
                    });
                });
            })
            .catch(error => console.error('Markerlar yüklenirken hata oluştu:', error));
    } catch (error) {
        console.error('Markerlar yüklenirken hata oluştu:', error);
    }
}

function fetchAndCompareDataBottom(year) {
    const il1 = document.getElementById('ilSelectBottom').value;
    const il2 = document.getElementById('ilCompareBottom').value;

    const fetchIl1 = fetch(`http://localhost:3001/api/iller-trendi?il=${il1}&yil=${year}`).then(response => response.json());
    const fetchIl2 = fetch(`http://localhost:3001/api/iller-trendi?il=${il2}&yil=${year}`).then(response => response.json());

    Promise.all([fetchIl1, fetchIl2])
        .then(([dataIl1, dataIl2]) => {
            const labels = dataIl1.map(item => `${item.ay}. Ay`);
            const vakaIl1 = dataIl1.map(item => item.toplam_vaka || 0);
            const olumIl1 = dataIl1.map(item => item.toplam_olum || 0);
            const kapasiteIl1 = dataIl1.map(item => item.toplam_kapasite || 0);
            const ilacIl1 = dataIl1.map(item => item.toplam_ilac || 0);

            const vakaIl2 = dataIl2.map(item => item.toplam_vaka || 0);
            const olumIl2 = dataIl2.map(item => item.toplam_olum || 0);
            const kapasiteIl2 = dataIl2.map(item => item.toplam_kapasite || 0);
            const ilacIl2 = dataIl2.map(item => item.toplam_ilac || 0);

            createComparisonBottomChart(
                labels,
                { vaka: vakaIl1, olum: olumIl1, kapasite: kapasiteIl1, ilac: ilacIl1 },
                { vaka: vakaIl2, olum: olumIl2, kapasite: kapasiteIl2, ilac: ilacIl2 },
                il1,
                il2
            );
        })
        .catch(error => console.error('Alttaki il karşılaştırma verileri alınamadı:', error));
}




// Çizgi grafiği oluştur
function createComparisonBottomChart(labels, dataIl1, dataIl2, il1, il2) {
    const ctx = document.getElementById('comparisonBottomChart').getContext('2d');

    if (window.comparisonBottomChart instanceof Chart) {
        window.comparisonBottomChart.destroy();
    }

    window.comparisonBottomChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${il1} - Vaka Sayıları`,
                    data: dataIl1.vaka,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il2} - Vaka Sayıları`,
                    data: dataIl2.vaka,
                    borderColor: 'rgba(255, 99, 71, 1)',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il1} - Ölüm Sayıları`,
                    data: dataIl1.olum,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il2} - Ölüm Sayıları`,
                    data: dataIl2.olum,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il1} - Kapasite`,
                    data: dataIl1.kapasite,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il2} - Kapasite`,
                    data: dataIl2.kapasite,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il1} - İlaç Miktarı`,
                    data: dataIl1.ilac,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: `${il2} - İlaç Miktarı`,
                    data: dataIl2.ilac,
                    borderColor: 'rgba(255, 99, 71, 1)',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) =>
                            `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString('tr-TR')}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function createCombinedProvinceChart(labels, vakaData, olumData, kapasiteData, ilacData) {
    const ctx = document.getElementById('combinedProvinceChart').getContext('2d');

    // Eğer önceki grafik varsa yok et
    if (window.combinedProvinceChart instanceof Chart) {
        window.combinedProvinceChart.destroy();
    }

    // Yeni grafik oluştur
    window.combinedProvinceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Vaka Sayıları',
                    data: vakaData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Ölüm Sayıları',
                    data: olumData,
                    borderColor: 'rgba(255, 99, 71, 1)',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Kapasite',
                    data: kapasiteData,
                    borderColor: 'rgba(255, 165, 0, 1)',
                    backgroundColor: 'rgba(255, 165, 0, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'İlaç Sayıları',
                    data: ilacData,
                    borderColor: 'rgba(144, 238, 144, 1)',
                    backgroundColor: 'rgba(144, 238, 144, 0.2)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) =>
                            `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString('tr-TR')}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


document.getElementById('ilSelectBottom').addEventListener('change', () => fetchAndCompareDataBottom(2024));
document.getElementById('ilCompareBottom').addEventListener('change', () => fetchAndCompareDataBottom(2024));



// Formatlama fonksiyonu
function formatNumber(number) {
    if (number === undefined || number === null) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
