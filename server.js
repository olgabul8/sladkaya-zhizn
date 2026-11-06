const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());
app.use(express.static(__dirname));

const JWT_SECRET = 'sladkaya_zhizn_secret_key_2024';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет доступа' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.isAdmin = decoded.isAdmin || false;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен' });
    }
}

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing && existing.length > 0) return res.status(400).json({ error: 'Email уже существует' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute('INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, phone || '']);
        
        const userId = result.insertId;
        const token = jwt.sign({ id: userId, email, isAdmin: false }, JWT_SECRET);
        res.json({ success: true, token, user: { id: userId, name, email, phone: phone || '', isAdmin: false } });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (!users || users.length === 0) return res.status(401).json({ error: 'Неверный email или пароль' });
        
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Неверный email или пароль' });
        
        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, JWT_SECRET);
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.is_admin } });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, phone, is_admin as isAdmin FROM users WHERE id = ?', [req.userId]);
        res.json(users[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/products', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products ORDER BY id');
        res.json(products || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/cart', authMiddleware, async (req, res) => {
    try {
        const [cart] = await db.execute('SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json(cart || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
    try {
        const { product_id, product_name, product_price, filling } = req.body;
        const [existing] = await db.execute('SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND filling = ?', [req.userId, product_id, filling]);
        if (existing && existing.length > 0) {
            const newQuantity = existing[0].quantity + 1;
            const newTotal = existing[0].product_price * newQuantity;
            await db.execute('UPDATE cart SET quantity = ?, total_price = ? WHERE id = ?', [newQuantity, newTotal, existing[0].id]);
        } else {
            await db.execute('INSERT INTO cart (user_id, product_id, product_name, product_price, filling, quantity, total_price) VALUES (?, ?, ?, ?, ?, 1, ?)', [req.userId, product_id, product_name, product_price, filling, product_price]);
        }
        res.json({ success: true, message: 'Товар добавлен' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/cart/:id', authMiddleware, async (req, res) => {
    try {
        await db.execute('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/cart', authMiddleware, async (req, res) => {
    try {
        await db.execute('DELETE FROM cart WHERE user_id = ?', [req.userId]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/checkout', authMiddleware, async (req, res) => {
    try {
        const [cart] = await db.execute('SELECT * FROM cart WHERE user_id = ?', [req.userId]);
        if (!cart || cart.length === 0) return res.status(400).json({ error: 'Корзина пуста' });

        let total = 0;
        cart.forEach(item => total += parseFloat(item.total_price));
        const [orderResult] = await db.execute('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [req.userId, total]);
        const orderId = orderResult.insertId;

        for (const item of cart) {
            await db.execute('INSERT INTO order_items (order_id, product_name, quantity, price, filling) VALUES (?, ?, ?, ?, ?)', [orderId, item.product_name, item.quantity, item.product_price, item.filling]);
        }
        await db.execute('DELETE FROM cart WHERE user_id = ?', [req.userId]);
        res.json({ success: true, message: 'Заказ оформлен' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/my-orders', authMiddleware, async (req, res) => {
    try {
        const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json(orders || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/orders', authMiddleware, async (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: 'Доступ запрещен' });
    try {
        const [orders] = await db.execute('SELECT o.*, u.name, u.phone FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
        res.json(orders);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/admin/orders/:id', authMiddleware, async (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: 'Доступ запрещен' });
    try {
        const { status } = req.body;
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});