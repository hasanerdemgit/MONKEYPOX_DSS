document.addEventListener('DOMContentLoaded', () => {
    const defaultMonth = 12; // Varsayılan ay: Aralık
    fetchGeneralData(defaultMonth);
    fetchRegionalData(defaultMonth);

    // Ay seçim kutusunu varsayılan olarak Aralık ayına ayarla
    document.getElementById('monthSelect').value = defaultMonth;
});


// Global grafik nesneleri
let barChartInstance;
let pieChartInstance;
let monthlyComparisonChartInstance;
let deathBarChartInstance;
let medicinePieChartInstance;

function fetchGeneralData(month) {
    fetch(`http://localhost:3001/api/genel-bilgiler?yil=2024&ay=${month}`)
        .then(response => response.json())
        .then(data => {
            const toplamVaka = data.toplam_vaka || 0;
            const toplamOlum = data.toplam_olum || 0;
            const toplamKapasite = data.toplam_karantina || 0;
            const toplamIlac = data.toplam_ilac || 0;

            const aylar = [
                "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
            ];
            const secilenAy = aylar[month - 1];

            document.getElementById('totalCasesTitle').textContent = `${secilenAy} Ayı Vaka Sayıları Toplamı`;
            document.getElementById('totalDeathsTitle').textContent = `${secilenAy} Ayı Ölüm Sayıları Toplamı`;
            document.getElementById('totalCapacityTitle').textContent = `${secilenAy} Ayı Karantina Kapasiteleri Toplamı`;
            document.getElementById('totalMedicineTitle').textContent = `${secilenAy} Ayı İlaç Miktarı Toplamı`;

            // Kartları güncelle
            document.querySelector('.card.green p').textContent = formatNumber(toplamVaka);
            document.querySelector('.card.red p').textContent = formatNumber(toplamOlum);
            document.querySelector('.card.blue p').textContent = formatNumber(toplamKapasite);
            document.querySelector('.card.purple p').textContent = formatNumber(toplamIlac);
        })
        .catch(error => console.error('Genel bilgiler alınamadı:', error));
}

function fetchRegionalData(month) {
    fetch(`http://localhost:3001/api/bolgesel-veriler?yil=2024&ay=${month}`)
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => item.bolge);
            const vakaSayilari = data.map(item => item.toplam_vaka || 0);
            const olumSayilari = data.map(item => item.toplam_olum || 0);
            const kapasiteSayilari = data.map(item => item.toplam_kapasite || 0);
            const ilacSayilari = data.map(item => item.toplam_ilac || 0);

            createCombinedRegionalChart(labels, vakaSayilari, olumSayilari, kapasiteSayilari, ilacSayilari);
        })
        .catch(error => console.error('Bölgesel veriler alınamadı:', error));
}

function createCombinedRegionalChart(labels, vakaSayilari, olumSayilari, kapasiteSayilari, ilacSayilari) {
    const ctx = document.getElementById('combinedRegionalChart').getContext('2d');

    // Önceden bir grafik varsa yok et
    if (window.combinedRegionalChart instanceof Chart) {
        window.combinedRegionalChart.destroy();
    }

    // Yeni grafik oluştur
    window.combinedRegionalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Vaka Sayıları',
                    data: vakaSayilari,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Ölüm Sayıları',
                    data: olumSayilari,
                    backgroundColor: 'rgba(255, 99, 71, 0.6)',
                    borderColor: 'rgba(255, 99, 71, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Kapasite',
                    data: kapasiteSayilari,
                    backgroundColor: 'rgba(255, 165, 0, 0.6)',
                    borderColor: 'rgba(255, 165, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: 'İlaç Sayıları',
                    data: ilacSayilari,
                    backgroundColor: 'rgba(144, 238, 144, 0.6)',
                    borderColor: 'rgba(144, 238, 144, 1)',
                    borderWidth: 1
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
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value.toLocaleString('tr-TR'),
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels] // Chart.js'de datalabels eklentisini kullanıyoruz
    });
}



// Ay seçiminde verileri güncelle
document.getElementById('monthSelect').addEventListener('change', (event) => {
    const selectedMonth = parseInt(event.target.value, 10);
    fetchGeneralData(selectedMonth); // Kartları güncelle
    fetchRegionalData(selectedMonth); // Grafik verilerini güncelle
});

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
