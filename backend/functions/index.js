document.addEventListener('DOMContentLoaded', () => {
    // Ay seçim kutusunu doldur
    const monthSelect = document.getElementById('monthSelect');
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // 1'den başlayarak ay numaraları
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Varsayılan olarak Aralık ayını göster
    monthSelect.value = 12;

    // Ay değiştiğinde verileri güncelle
    monthSelect.addEventListener('change', () => {
        const selectedMonth = parseInt(monthSelect.value, 10);
        fetchAndDisplayData(selectedMonth);
    });

    // Varsayılan olarak Aralık ayını yükle
    fetchAndDisplayData(12);
});

// Global veri saklama
let previousMonthData = {};

function fetchAndDisplayData(month) {
    const apiUrl = `http://localhost:3001/api/genel-bilgiler?yil=2024&ay=${month}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Önceki ayın verisi mevcutsa artış/azalış hesapla
            if (Object.keys(previousMonthData).length > 0) {
                updateCardsWithDifference(data, previousMonthData);
            } else {
                updateCards(data);
            }

            // Şimdiki ayın verisini sakla
            previousMonthData = { ...data };
        })
        .catch(error => console.error('Veri alınamadı:', error));
}

function updateCards(data) {
    const toplamVaka = data.toplam_vaka || 0;
    const toplamOlum = data.toplam_olum || 0;
    const toplamKapasite = data.toplam_karantina || 0;
    const toplamIlac = data.toplam_ilac || 0;

    // Kartları güncelle
    document.querySelector('.card.green p').textContent = formatNumber(toplamVaka);
    document.querySelector('.card.red p').textContent = formatNumber(toplamOlum);
    document.querySelector('.card.blue p').textContent = formatNumber(toplamKapasite);
    document.querySelector('.card.purple p').textContent = formatNumber(toplamIlac);
}

function updateCardsWithDifference(currentData, previousData) {
    const fields = [
        { field: 'toplam_vaka', cardClass: '.card.green' },
        { field: 'toplam_olum', cardClass: '.card.red' },
        { field: 'toplam_karantina', cardClass: '.card.blue' },
        { field: 'toplam_ilac', cardClass: '.card.purple' }
    ];

    fields.forEach(({ field, cardClass }) => {
        const currentValue = currentData[field] || 0;
        const previousValue = previousData[field] || 0;
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

// Formatlama fonksiyonu
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
//-------------------------------------GRAFİKLER--------------------------------------------------------

function fetchChangeData() {
    fetch('http://localhost:3001/api/grafik-degisim?yil=2024')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => `${item.ay}. Ay`);
            const vakaDegisim = data.map(item => item.vaka_degisim || 0);
            const olumDegisim = data.map(item => item.olum_degisim || 0);
            const kapasiteDegisim = data.map(item => item.kapasite_degisim || 0);
            const ilacDegisim = data.map(item => item.ilac_degisim || 0);

            createCombinedChart(labels, vakaDegisim, olumDegisim, kapasiteDegisim, ilacDegisim);
        })
        .catch(error => console.error('Değişim verileri alınamadı:', error));
}


function createCombinedChart(labels, vakaDegisim, olumDegisim, kapasiteDegisim, ilacDegisim) {
    const ctx = document.getElementById('combinedChart').getContext('2d');

    // Eğer önceden bir grafik varsa yok et
    if (window.combinedChart instanceof Chart) {
        window.combinedChart.destroy();
    }

    // Yeni grafik oluştur
    window.combinedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Vaka Değişimi',
                    data: vakaDegisim,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Ölüm Değişimi',
                    data: olumDegisim,
                    borderColor: 'rgba(255, 99, 71, 1)',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Kapasite Değişimi',
                    data: kapasiteDegisim,
                    borderColor: 'rgba(255, 165, 0, 1)',
                    backgroundColor: 'rgba(255, 165, 0, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'İlaç Değişimi',
                    data: ilacDegisim,
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
