import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const BASE = '/Kalidad-Pharmacy/';
const PUBLIC_PAGES = {
  '/services': 'services.html', '/contact': 'contact.html', '/careers': 'careers.html',
  '/news': 'news.html', '/about': 'about.html', '/otc-wellness': 'otc-wellness.html'
};
const publicKey = location.pathname.replace(BASE, '/');
if (PUBLIC_PAGES[publicKey]) location.replace(BASE + PUBLIC_PAGES[publicKey]);

const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const money = (value) => 'UGX ' + Number(value || 0).toLocaleString();
const stockValue = (p) => Number.isFinite(Number(p.stock)) ? Math.max(0, Number(p.stock)) : null;
const stockLabel = (p) => { const s = stockValue(p); if (s === null) return ['Unmanaged','stock-unmanaged']; if (s <= 0) return ['Out of stock','stock-out']; if (s <= 5) return ['Low stock','stock-low']; return ['In stock','stock-in']; };

function shell(title, body) {
  const root = document.querySelector('.admin'); if (!root) return;
  root.innerHTML = '<aside><div class="admin-brand">KALIDAD<br><small>ADMIN</small></div>' +
    '<a href="' + BASE + 'admin">Dashboard</a><a href="' + BASE + 'admin/products">Products</a>' +
    '<a href="' + BASE + 'admin/orders">Orders</a><a href="' + BASE + 'admin/customers">Customers</a>' +
    '<a href="' + BASE + 'admin/content">Website Content</a><a href="' + BASE + 'store">Store</a>' +
    '<button id="admin-signout">Sign out</button></aside><main><span>ADMINISTRATION</span><h1>' + esc(title) + '</h1>' + body + '</main>';
  document.getElementById('admin-signout')?.addEventListener('click', () => signOut(auth));
}

async function roleOk(user) {
  if (!user) return false;
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  return snapshot.exists() && ['admin','superadmin','staff'].includes(snapshot.data().role) && snapshot.data().active !== false;
}

async function products() {
  shell('Products', '<div class="admin-toolbar"><input id="product-search" placeholder="Search products..." aria-label="Search products"><button class="primary" id="add-product">+ Add product</button></div>' +
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Category</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody id="products-body"><tr><td colspan="7">Loading products...</td></tr></tbody></table></div>');
  const snapshot = await getDocs(query(collection(db, 'products'), limit(200)));
  const rows = snapshot.docs.map((item) => ({ id:item.id, ...item.data() }));
  const body = document.getElementById('products-body'); if (!body) return;
  const renderRows = (list) => { body.innerHTML = list.length ? list.map((p) => { const st = stockLabel(p); return '<tr><td><strong>' + esc(p.name) + '</strong></td><td>' + esc(p.categoryName || p.category || '—') + '</td><td>' + esc(p.sku || '—') + '</td><td>' + money(p.salePrice || p.price) + '</td><td><strong>' + (stockValue(p) === null ? '—' : stockValue(p)) + '</strong><br><span class="stock-badge ' + st[1] + '">' + st[0] + '</span></td><td><button class="status-btn" data-toggle="' + p.id + '">' + (p.active !== false ? 'Active' : 'Inactive') + '</button></td><td><button data-stock="' + p.id + '" data-delta="-1" aria-label="Decrease stock">−</button> <button data-stock="' + p.id + '" data-delta="1" aria-label="Increase stock">+</button> <button data-edit="' + p.id + '">Edit</button> <button data-delete="' + p.id + '">Delete</button></td></tr>'; }).join('') : '<tr><td colspan="7">No products found.</td></tr>'; };
  renderRows(rows);
  document.getElementById('product-search')?.addEventListener('input', (e) => { const term = e.target.value.toLowerCase().trim(); renderRows(rows.filter(p => [p.name,p.categoryName,p.category,p.brand,p.sku].some(v => String(v || '').toLowerCase().includes(term)))); });
  document.getElementById('add-product')?.addEventListener('click', () => productForm());
  body.onclick = async (event) => { const target = event.target; if (!(target instanceof HTMLElement)) return;
    if (target.dataset.toggle) { await updateDoc(doc(db,'products',target.dataset.toggle), { active: target.textContent !== 'Active', updatedAt:serverTimestamp() }); return products(); }
    if (target.dataset.stock) { const p = rows.find(x => x.id === target.dataset.stock); const current = stockValue(p) ?? 0; await updateDoc(doc(db,'products',p.id), { stock:Math.max(0,current + Number(target.dataset.delta)), updatedAt:serverTimestamp() }); return products(); }
    if (target.dataset.edit) { const p = rows.find(x => x.id === target.dataset.edit); if (p) productForm(p); }
    if (target.dataset.delete && confirm('Delete this product?')) { await deleteDoc(doc(db,'products',target.dataset.delete)); return products(); }
  };
}

function productForm(product) {
  const data = product || {}; const root = document.querySelector('.admin main'); if (!root) return;
  const wrap = document.createElement('div'); wrap.className='admin-modal';
  wrap.innerHTML = '<div class="admin-modal-card"><h2>' + (data.id ? 'Edit' : 'Add') + ' product</h2>' +
    '<label>Product name<input id="p-name" required value="' + esc(data.name) + '"></label>' +
    '<label>Category<input id="p-cat" value="' + esc(data.categoryName || data.category) + '"></label>' +
    '<label>Brand<input id="p-brand" value="' + esc(data.brand) + '"></label>' +
    '<label>SKU<input id="p-sku" value="' + esc(data.sku) + '"></label>' +
    '<label>Regular price<input id="p-price" type="number" min="0" step="1" value="' + Number(data.price || 0) + '"></label>' +
    '<label>Sale price<input id="p-sale" type="number" min="0" step="1" value="' + Number(data.salePrice || 0) + '"></label>' +
    '<label>Stock quantity<input id="p-stock" type="number" min="0" step="1" value="' + (stockValue(data) ?? 0) + '"></label>' +
    '<label>Image URL<input id="p-image" value="' + esc(data.image) + '"></label>' +
    '<label>Short description<textarea id="p-short">' + esc(data.shortDescription) + '</textarea></label>' +
    '<label>Description<textarea id="p-desc">' + esc(data.description) + '</textarea></label>' +
    '<label><input id="p-featured" type="checkbox" ' + (data.featured ? 'checked' : '') + '> Featured</label>' +
    '<label><input id="p-active" type="checkbox" ' + (data.active !== false ? 'checked' : '') + '> Active</label>' +
    '<div class="modal-actions"><button id="p-cancel">Cancel</button><button class="primary" id="p-save">Save product</button></div></div>';
  root.appendChild(wrap);
  wrap.querySelector('#p-cancel').onclick=()=>wrap.remove();
  wrap.querySelector('#p-save').onclick=async()=>{
    const price=Number(wrap.querySelector('#p-price').value || 0), sale=Number(wrap.querySelector('#p-sale').value || 0), stock=Number(wrap.querySelector('#p-stock').value || 0);
    if (!wrap.querySelector('#p-name').value.trim()) return alert('Product name is required.');
    if (price < 0 || sale < 0 || stock < 0) return alert('Price and stock cannot be negative.');
    if (sale && price && sale > price) return alert('Sale price cannot exceed the regular price.');
    const payload={ name:wrap.querySelector('#p-name').value.trim(), categoryName:wrap.querySelector('#p-cat').value.trim(), brand:wrap.querySelector('#p-brand').value.trim(), sku:wrap.querySelector('#p-sku').value.trim(), price, salePrice:sale, stock, image:wrap.querySelector('#p-image').value.trim(), shortDescription:wrap.querySelector('#p-short').value.trim(), description:wrap.querySelector('#p-desc').value.trim(), featured:wrap.querySelector('#p-featured').checked, active:wrap.querySelector('#p-active').checked, updatedAt:serverTimestamp() };
    if (data.id) await updateDoc(doc(db,'products',data.id),payload); else await setDoc(doc(collection(db,'products')), {...payload,createdAt:serverTimestamp()});
    wrap.remove(); products();
  };
}

async function orders() {
  shell('Orders','<div class="admin-toolbar"><input id="order-search" placeholder="Search order or customer..." aria-label="Search orders"></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody id="orders-body"><tr><td colspan="5">Loading orders...</td></tr></tbody></table></div>');
  const snapshot=await getDocs(query(collection(db,'orders'),orderBy('createdAt','desc'),limit(200))); const rows=snapshot.docs.map(d=>({id:d.id,...d.data()})); const body=document.getElementById('orders-body'); if(!body)return;
  const renderRows=(list)=>{body.innerHTML=list.length?list.map(o=>'<tr><td><strong>'+esc(o.orderNumber||o.id)+'</strong></td><td>'+esc(o.customer?.name||o.userId||'—')+'<br>'+esc(o.customer?.phone||o.deliveryAddress?.phone||'')+'</td><td>'+money(o.total)+'</td><td>'+esc(o.orderStatus||'pending')+'</td><td><select data-status="'+o.id+'" aria-label="Update order status"><option>pending</option><option>confirmed</option><option>processing</option><option>ready</option><option>out_for_delivery</option><option>completed</option><option>cancelled</option></select></td></tr>').join(''):'<tr><td colspan="5">No orders found.</td></tr>'; list.forEach(o=>{const s=document.querySelector('[data-status="'+o.id+'"]');if(s)s.value=o.orderStatus||'pending';});};
  renderRows(rows);
  document.getElementById('order-search')?.addEventListener('input',(e)=>{const term=e.target.value.toLowerCase().trim();renderRows(rows.filter(o=>[o.orderNumber,o.userId,o.customer?.name,o.customer?.phone].some(v=>String(v||'').toLowerCase().includes(term))));});
  body.addEventListener('change',async(e)=>{const s=e.target.closest('[data-status]');if(!s)return;await updateDoc(doc(db,'orders',s.dataset.status),{orderStatus:s.value,updatedAt:serverTimestamp()});});
}

async function customers() {
  shell('Customers','<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Active</th></tr></thead><tbody id="customers-body"><tr><td colspan="5">Loading customers...</td></tr></tbody></table></div>');
  const snapshot=await getDocs(query(collection(db,'users'),limit(200))); const rows=snapshot.docs.map(d=>({id:d.id,...d.data()})); const body=document.getElementById('customers-body'); if(!body)return;
  body.innerHTML=rows.map(u=>'<tr><td>'+esc(((u.firstName||'')+' '+(u.lastName||'')).trim()||'—')+'</td><td>'+esc(u.email)+'</td><td>'+esc(u.phone)+'</td><td>'+esc(u.role||'customer')+'</td><td>'+(u.active===false?'No':'Yes')+'</td></tr>').join('')||'<tr><td colspan="5">No customers found.</td></tr>';
}

function content() {
  const pages=[['Home','/'],['Services','/services'],['About Us','/about'],['Contact Us','/contact'],['Careers','/careers'],['News','/news'],['Wellness Catalogue','/otc-wellness']];
  const cards=pages.map(([name,path])=>'<article class="content-card"><h3>'+esc(name)+'</h3><p>Review this page as visitors see it.</p><a class="primary" href="'+BASE+(path==='/'?'':path.slice(1))+'">Open page →</a></article>').join('');
  shell('Website Content','<p class="admin-muted">Open each public page to review its original layout and content.</p><div class="content-grid">'+cards+'</div>');
}

async function dashboard() {
  shell('Dashboard','<div class="admin-stats"><div><b id="stat-products">—</b><span>Total products</span></div><div><b id="stat-active">—</b><span>Active products</span></div><div><b id="stat-low">—</b><span>Low stock</span></div><div><b id="stat-out">—</b><span>Out of stock</span></div><div><b id="stat-orders">—</b><span>Total orders</span></div><div><b id="stat-pending">—</b><span>Pending orders</span></div><div><b id="stat-completed">—</b><span>Completed orders</span></div><div><b id="stat-customers">—</b><span>Customers</span></div></div><section class="admin-panel"><h2>Quick actions</h2><div class="quick"><a href="'+BASE+'admin/products">Add / manage products →</a><a href="'+BASE+'admin/orders">Review orders →</a><a href="'+BASE+'admin/customers">View customers →</a><a href="'+BASE+'admin/content">Website Content →</a><a href="'+BASE+'store">Open store →</a></div></section>');
  const [ps,os,us]=await Promise.all([getDocs(query(collection(db,'products'),limit(500))),getDocs(query(collection(db,'orders'),limit(500))),getDocs(query(collection(db,'users'),limit(500)))]);
  const productsRows=ps.docs.map(d=>d.data()), ordersRows=os.docs.map(d=>d.data());
  document.getElementById('stat-products').textContent=ps.size;
  document.getElementById('stat-active').textContent=productsRows.filter(p=>p.active!==false).length;
  document.getElementById('stat-low').textContent=productsRows.filter(p=>{const s=stockValue(p);return s!==null&&s>0&&s<=5;}).length;
  document.getElementById('stat-out').textContent=productsRows.filter(p=>stockValue(p)===0).length;
  document.getElementById('stat-orders').textContent=os.size;
  document.getElementById('stat-pending').textContent=ordersRows.filter(o=>(o.orderStatus||'pending')==='pending').length;
  document.getElementById('stat-completed').textContent=ordersRows.filter(o=>o.orderStatus==='completed').length;
  document.getElementById('stat-customers').textContent=us.size;
}

async function render() {
  if (!location.pathname.startsWith(BASE+'admin') || location.pathname.endsWith('/login')) return;
  const user=auth.currentUser; if (!(await roleOk(user))) return;
  let path=location.pathname.replace(BASE,''); if(path.endsWith('/'))path=path.slice(0,-1);
  if(path==='admin/products')return products(); if(path==='admin/orders')return orders(); if(path==='admin/customers')return customers(); if(path==='admin/content')return content(); return dashboard();
}

onAuthStateChanged(auth,()=>render());
window.addEventListener('popstate',()=>render());
