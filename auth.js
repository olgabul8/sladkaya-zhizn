const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    alert('Вход выполнен успешно!');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Неверный email или пароль');
                }
            } catch (error) {
                alert('Ошибка соединения с сервером');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    alert('Регистрация успешна!');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Ошибка регистрации');
                }
            } catch (error) {
                alert('Ошибка соединения с сервером');
            }
        });
    }

    async function updateAuthButton() {
        const token = localStorage.getItem('token');
        const authBtn = document.getElementById('auth-btn-header');
        if (!authBtn) return;

        if (token) {
            try {
                const response = await fetch(`${API_URL}/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const user = await response.json();
                    authBtn.textContent = user.name;
                    authBtn.style.textDecoration = 'none';
                    authBtn.onclick = () => {
                        if (confirm('Выйти из аккаунта?')) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('currentUser');
                            window.location.reload();
                        }
                    };
                } else {
                    throw new Error();
                }
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                authBtn.textContent = 'Войти';
                authBtn.onclick = () => window.location.href = 'login.html';
            }
        } else {
            authBtn.textContent = 'Войти';
            authBtn.onclick = () => window.location.href = 'login.html';
        }
    }

    window.updateCartCount = async function() {
        const token = localStorage.getItem('token');
        const cartCount = document.getElementById('cart-count');
        if (!cartCount) return;
        if (token) {
            try {
                const response = await fetch(`${API_URL}/cart`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const cart = await response.json();
                    cartCount.textContent = cart.length;
                } else {
                    cartCount.textContent = '0';
                }
            } catch (error) {
                cartCount.textContent = '0';
            }
        } else {
            cartCount.textContent = '0';
        }
    };

    function setupCartButton() {
        const cartBtn = document.getElementById('cart-btn-header');
        if (cartBtn) {
            cartBtn.onclick = () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Войдите или зарегистрируйтесь');
                    window.location.href = 'login.html';
                    return;
                }
                window.location.href = 'cart.html';
            };
        }
    }

    updateAuthButton();
    window.updateCartCount();
    setupCartButton();
});