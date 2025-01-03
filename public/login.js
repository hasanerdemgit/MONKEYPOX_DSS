document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini engelle

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Giriş başarılı, index.html'e yönlendir
                    window.location.href = '/index.html';
                } else {
                    // Hatalı giriş
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = result.message || 'Kullanıcı adı veya şifre hatalı.';
                }
            } else {
                // Hatalı yanıt
                const errorData = await response.json();
                errorMessage.style.display = 'block';
                errorMessage.textContent = errorData.message || 'Kullanıcı adı veya şifre hatalı.';
            }
        } catch (error) {
            console.error('Sunucu hatası:', error);
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Sunucu hatası. Lütfen tekrar deneyin.';
        }
    });
});
