function fetchDateTime() {
    fetch('http://localhost:3001/api/tarih-saat')
        .then(response => response.json())
        .then(data => {
            const dateElement = document.querySelector('.date');
            if (dateElement) {
                dateElement.textContent = `Tarih: ${data.tarih} - ${data.saat}`;
            }
        })
        .catch(error => console.error('Tarih ve saat alınamadı:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    fetchDateTime();
    setInterval(fetchDateTime,0);
    fetchChangeData()
});