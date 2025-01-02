document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini engelle

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    window.location.href = './index.html'; // Başarılı girişte yönlendirme
                } else {
                    throw new Error('Giriş bilgileri hatalı.');
                }
            } else {
                throw new Error('Sunucu hatası.');
            }
        } catch (error) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = error.message;
        }
    });
});
