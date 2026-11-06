document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const imageCache = {
        'Торт "Оранжевые маки"': 'оранжевые.png',
        'Торт "Аладдин" с веерами': 'аладдин.png',
        'Торт "Розовая мечта"': 'мечта.png',
        'Торт "Ягодная долина"': 'ягодный.png',
        'Торт "Ламбет с вишней"': 'вишня.png',
        'Бенто-торт "Цветы"': 'цветы.png',
        'Торт "Ламбет с бантиком"': 'бантики.png',
        'Торт "Цветочный рай"': 'цветочный.png',
        'Торт "Незабудка"': 'незабудка.png',
        'Бенто-торт "Жемчужная корона"': 'корона.png',
        'Торт "Ромашковая долина"': 'ромашки.png',
        'Бенто-торт "Зайка"': 'зайка.png',
        'Банановый чизкейк в виде пудинга': 'банан.png',
        'Мини-чизкейки с начинкой "Брауни"': 'брауни.png',
        'Мини-чизкейк "Красный бархат"': 'красный.png',
        'Чизкейк "Морковный с грецким орехом"': 'морковка.png',
        'Мини-чизкейк с вишней и лаймом': 'лайм.png',
        'Мини-чизкейк творожно-черничный': 'творог.png',
        'Клубничный чизкейк': 'клубничка.png',
        'Мини-чизкейки с киви': 'киви.png',
        'Мини-чизкейк "Кокосик"': 'кокосик.png',
        'Круассан ванильный с клубникой': 'круассан.png',
        'Пирог малиновый': 'пирог.png',
        'Слойка вишнёвая': 'слойка.png',
        'Тарталетка ягодная': 'тарталетка.png',
        'Синабоны': 'синабоны.png',
        'Эклер ягодный': 'эклер.png',
        'Сырок "Клубничная нежность"': 'сырок.png',
        'Рулет "Вишнёвая долина"': 'рулет.png',
        'Макаронс': 'макаронс.png'
    };

    function getProductImage(productName) {
        return imageCache[productName] || 'главная.png';
    }

    async function loadCart() {
        try {
            const response = await fetch(`${window.API_URL || 'http://localhost:3000/api'}/cart`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) return await response.json();
            return [];
        } catch (error) { return []; }
    }

    async function removeFromCart(cartId) {
        try {
            const response = await fetch(`${window.API_URL || 'http://localhost:3000/api'}/cart/${cartId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.ok;
        } catch (error) { return false; }
    }

    async function renderCart() {
        const cart = await loadCart();
        const container = document.getElementById('cart-items-list');
        const totalSpan = document.getElementById('cart-total-amount');
        const itemsCountSpan = document.getElementById('cart-items-count');
        
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart-page"><p>Корзина пуста</p><a href="torty.html" style="color:#B29691;">Перейти к покупкам</a></div>';
            if (totalSpan) totalSpan.textContent = '0Р';
            if (itemsCountSpan) itemsCountSpan.textContent = '0 товаров';
            return;
        }

        let total = 0;
        container.innerHTML = '';
        
        for (const item of cart) {
            total += parseFloat(item.total_price);
            const div = document.createElement('div');
            div.className = 'cart-item-page';
            div.innerHTML = `
                <div class="cart-item-img">
                    <img src="${getProductImage(item.product_name)}" alt="${item.product_name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.product_name)}</div>
                    <div class="cart-item-filling">Начинка: ${escapeHtml(item.filling)}</div>
                    <div class="cart-item-quantity">Количество: ${item.quantity}</div>
                </div>
                <div class="cart-item-price">${item.total_price}Р</div>
                <button class="remove-cart-item" data-id="${item.id}">✕</button>
            `;
            container.appendChild(div);
        }
        
        if (totalSpan) totalSpan.textContent = total + 'Р';
        if (itemsCountSpan) itemsCountSpan.textContent = `${cart.length} ${cart.length === 1 ? 'товар' : 'товаров'}`;

        document.querySelectorAll('.remove-cart-item').forEach(btn => {
            btn.addEventListener('click', async () => {
                const success = await removeFromCart(btn.getAttribute('data-id'));
                if (success) {
                    await renderCart();
                    if (window.updateCartCount) window.updateCartCount();
                }
            });
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    await renderCart();

    document.getElementById('checkout-page-btn')?.addEventListener('click', async () => {
        const cart = await loadCart();
        if (cart.length === 0) return;
        
        const btn = document.getElementById('checkout-page-btn');
        btn.textContent = 'Оформление...';

        try {
            const response = await fetch(`${window.API_URL || 'http://localhost:3000/api'}/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                btn.textContent = 'Заказ оформлен!';
                setTimeout(() => { btn.textContent = 'Оформить заказ'; }, 2000);
                await renderCart();
                if (window.updateCartCount) window.updateCartCount();
                loadMyOrders();
            } else {
                btn.textContent = 'Ошибка';
                setTimeout(() => { btn.textContent = 'Оформить заказ'; }, 2000);
            }
        } catch (error) {
            btn.textContent = 'Ошибка сети';
            setTimeout(() => { btn.textContent = 'Оформить заказ'; }, 2000);
        }
    });

    async function loadMyOrders() {
        try {
            const response = await fetch(`${window.API_URL || 'http://localhost:3000/api'}/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const orders = await response.json();
            const container = document.getElementById('my-orders-list');
            
            if (!container) return;
            
            if (orders.length === 0) {
                container.innerHTML = '<p style="color:#777;">У вас пока нет заказов.</p>';
                return;
            }

            container.innerHTML = orders.map(o => `
                <div class="my-order-card" style="border: 1px solid #ddd; padding: 15px; border-radius: 10px; margin-bottom: 10px; background: #fff;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                        <strong>Заказ №${o.id}</strong>
                        <span>${new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-bottom: 10px;">Сумма: <strong>${o.total_amount} ₽</strong></div>
                    <div>Статус: 
                        <span class="order-status status-${o.status}">
                            ${getStatusText(o.status)}
                        </span>
                    </div>
                </div>
            `).join('');
        } catch (error) { console.error(error); }
    }

    function getStatusText(status) {
        const statuses = {
            'new': 'Новый',
            'processing': 'В обработке',
            'done': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statuses[status] || status;
    }

    loadMyOrders();
});