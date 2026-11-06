window.API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    let currentSelectedProduct = null;

    function getToken() {
        return localStorage.getItem('token');
    }

    async function addToCart(product, filling) {
        const token = getToken();
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    product_name: product.name,
                    product_price: product.price,
                    filling: filling
                })
            });

            if (response.ok) {
                if (window.updateCartCount) window.updateCartCount();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    document.querySelectorAll('.product-card .order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const token = getToken();
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            const card = btn.closest('.product-card');
            let rawId = card.getAttribute('data-id') || '1';
            let cleanId = parseInt(rawId.replace(/\D/g, '')) || 1;
            
            currentSelectedProduct = {
                id: cleanId,
                name: card.querySelector('.product-name').textContent,
                price: parseInt(card.querySelector('.product-price').textContent),
                img: card.querySelector('img').getAttribute('src')
            };
            document.getElementById('modal-cake-title').textContent = currentSelectedProduct.name;
            document.getElementById('modal-cake-img').setAttribute('src', currentSelectedProduct.img);
            document.getElementById('modal-cake-price').textContent = currentSelectedProduct.price + 'Р';
            document.getElementById('cake-modal').classList.add('active');
        });
    });

    document.getElementById('add-cake-to-cart')?.addEventListener('click', async () => {
        const filling = document.querySelector('input[name="filling"]:checked')?.value || 'без начинки';
        const btn = document.getElementById('add-cake-to-cart');
        btn.textContent = 'Добавление...';
        
        const success = await addToCart(currentSelectedProduct, filling);
        
        if (success) {
            document.getElementById('cake-modal').classList.remove('active');
            btn.textContent = 'Добавить в корзину';
        } else {
            btn.textContent = 'Ошибка';
            setTimeout(() => { btn.textContent = 'Добавить в корзину'; }, 2000);
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('cake-modal')?.classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList?.contains('modal')) e.target.classList.remove('active');
    });
});