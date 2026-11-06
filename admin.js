const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

if (!token || !user.isAdmin) {
    alert('Доступ только для администратора');
    window.location.href = 'index.html';
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

async function loadOrders() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/orders', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!res.ok) throw new Error('Ошибка загрузки');
        
        const orders = await res.json();
        const tbody = document.getElementById('orders-table');
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Заказов пока нет</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.name || 'Аноним'}</td>
                <td>${o.phone || '-'}</td>
                <td>${o.total_amount} ₽</td>
                <td>
                    <select class="status-select" onchange="updateStatus(${o.id}, this.value)">
                        <option value="new" ${o.status === 'new' ? 'selected' : ''}>Новый</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>В обработке</option>
                        <option value="done" ${o.status === 'done' ? 'selected' : ''}>Выполнен</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                    </select>
                </td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
    }
}

async function updateStatus(id, status) {
    try {
        await fetch(`http://localhost:3000/api/admin/orders/${id}`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ status })
        });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
    }
}

loadOrders();