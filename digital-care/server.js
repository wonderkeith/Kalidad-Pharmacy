const express = require('express');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 8787);
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }) : null;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function orderNumber() {
  return `KAL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

app.get('/api/health', async (_req, res) => {
  let database = 'not-configured';
  if (pool) {
    try { await pool.query('SELECT 1'); database = 'ok'; } catch (_e) { database = 'error'; }
  }
  res.json({ ok: database !== 'error', service: 'kalidad-digital-care', database });
});

app.get('/api/products', async (req, res) => {
  if (!pool) return res.json({ products: [], source: 'database-not-configured' });
  const q = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const values = [];
  const clauses = ['is_active = TRUE'];
  if (q) { values.push(`%${q}%`); clauses.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length} OR sku ILIKE $${values.length})`); }
  if (category) { values.push(category); clauses.push(`category = $${values.length}`); }
  const result = await pool.query(`SELECT id, sku, name, slug, category, description, price_ugx, stock_quantity, requires_prescription, image_url FROM products WHERE ${clauses.join(' AND ')} ORDER BY name LIMIT 100`, values);
  res.json({ products: result.rows });
});

app.post('/api/orders', async (req, res) => {
  const { items, fulfilmentType = 'collection', guestEmail, guestPhone, deliveryAddress, customerNote } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'At least one product is required.' });
  if (!pool) return res.status(503).json({ error: 'Ordering service is not configured yet.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let subtotal = 0;
    const normalized = [];
    for (const item of items) {
      const result = await client.query('SELECT id,name,price_ugx,stock_quantity,requires_prescription FROM products WHERE id=$1 AND is_active=TRUE FOR UPDATE', [item.productId]);
      if (!result.rowCount) throw new Error('Product not found.');
      const p = result.rows[0];
      const quantity = Math.max(1, Number(item.quantity || 1));
      if (p.stock_quantity < quantity) throw new Error(`${p.name} does not have enough stock.`);
      const line = Number(p.price_ugx) * quantity;
      subtotal += line;
      normalized.push({ ...p, quantity, line });
    }
    const deliveryFee = fulfilmentType === 'delivery' ? 5000 : 0;
    const orderId = crypto.randomUUID();
    const number = orderNumber();
    await client.query(`INSERT INTO orders (id,order_number,guest_email,guest_phone,status,fulfilment_type,subtotal_ugx,delivery_fee_ugx,total_ugx,delivery_address,customer_note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [orderId, number, guestEmail || null, guestPhone || null, normalized.some(x => x.requires_prescription) ? 'awaiting_prescription' : 'pending', fulfilmentType, subtotal, deliveryFee, subtotal + deliveryFee, deliveryAddress || null, customerNote || null]);
    for (const item of normalized) {
      await client.query('INSERT INTO order_items (order_id,product_id,product_name,unit_price_ugx,quantity,line_total_ugx) VALUES ($1,$2,$3,$4,$5,$6)', [orderId,item.id,item.name,item.price_ugx,item.quantity,item.line]);
      await client.query('UPDATE products SET stock_quantity=stock_quantity-$1,updated_at=now() WHERE id=$2', [item.quantity,item.id]);
    }
    await client.query('COMMIT');
    res.status(201).json({ order: { id: orderId, orderNumber: number, status: normalized.some(x => x.requires_prescription) ? 'awaiting_prescription' : 'pending', totalUgx: subtotal + deliveryFee } });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message || 'Unable to create order.' });
  } finally { client.release(); }
});

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error.' }); });
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(port, () => console.log(`Kalidad Digital Care listening on ${port}`));
