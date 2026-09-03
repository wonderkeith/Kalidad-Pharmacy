import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const BASE = '/Kalidad-Pharmacy/';
const PUBLIC_PAGES = {
  '/services': 'services.html',
  '/contact': 'contact.html',
  '/careers': 'careers.html',
  '/news': 'news.html',
  '/about': 'about.html',
  '/otc-wellness': 'otc-wellness.html'
};

const publicKey = location.pathname.replace(BASE, '/');
if (PUBLIC_PAGES[publicKey]) {
  location.replace(BASE + PUBLIC_PAGES[publicKey]);
}

const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return map[char];
});

const money = (value) => 'UGX ' + Number(value || 0).toLocaleString();

function shell(title, body) {
  const root = document.querySelector('.admin');
  if (!root) return;
  root.innerHTML = '<aside>' +
    '<div class="admin-brand">KALIDAD<br><small>ADMIN</small></div>' +
    '<a href="' + BASE + 'admin">Dashboard</a>' +
    '<a href="' + BASE + 'admin/products">Products</a>' +
    '<a href="' + BASE + 'admin/orders">Orders</a>' +
    '<a href="' + BASE + 'admin/customers">Customers</a>' +
    '<a href="' + BASE + 'admin/content">Website Content</a>' +
    '<button id="admin-signout">Sign out</button>' +
    '</aside><main><span>ADMINISTRATION</span><h1>' + esc(title) + '</h1>' + body + '</main>';
  const button = document.getElementById('admin-signout');
  if (button) button.addEventListener('click', () => signOut(auth));
}

async function roleOk(user) {
  if (!user) return false;
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  if (!snapshot.exists()) return false;
  return ['admin', 'superadmin', 'staff'].includes(snapshot.data().role);
}

async function products() {
  shell('Products',
    '<div class="admin-toolbar"><button class="primary" id="add-product">+ Add product</button></div>' +
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
    '<th>Product</th><th>Category</th><th>Price</th><th>Active</th><th>Actions</th>' +
    '</tr></thead><tbody id="products-body"><tr><td colspan="5">Loading...</td></tr></tbody></table></div>'
  );

  const snapshot = await getDocs(query(collection(db, 'products'), limit(200)));
  const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const body = document.getElementById('products-body');
  if (!body) return;

  body.innerHTML = rows.map((product) =>
    '<tr><td><strong>' + esc(product.name) + '</strong></td>' +
    '<td>' + esc(product.categoryName || '—') + '</td>' +
    '<td>' + money(product.salePrice || product.price) + '</td>' +
    '<td><button class="status-btn" data-toggle="' + product.id + '">' +
      (product.active !== false ? 'Active' : 'Inactive') +
    '</button></td>' +
    '<td><button data-edit="' + product.id + '">Edit</button> ' +
    '<button data-delete="' + product.id + '">Delete</button></td></tr>'
  ).join('') || '<tr><td colspan="5">No products yet.</td></tr>';

  const addButton = document.getElementById('add-product');
  if (addButton) addButton.onclick = () => productForm();

  body.onclick = async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.dataset.toggle) {
      await updateDoc(doc(db, 'products', target.dataset.toggle), {
        active: target.textContent !== 'Active',
        updatedAt: serverTimestamp()
      });
      return products();
    }

    if (target.dataset.edit) {
      const product = rows.find((item) => item.id === target.dataset.edit);
      if (product) productForm(product);
    }

    if (target.dataset.delete && confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', target.dataset.delete));
      return products();
    }
  };
}

function productForm(product) {
  const data = product || {};
  const root = document.querySelector('.admin main');
  if (!root) return;

  const wrap = document.createElement('div');
  wrap.className = 'admin-modal';
  wrap.innerHTML =
    '<div class="admin-modal-card">' +
    '<h2>' + (data.id ? 'Edit' : 'Add') + ' product</h2>' +
    '<label>Name<input id="p-name" value="' + esc(data.name) + '"></label>' +
    '<label>Category<input id="p-cat" value="' + esc(data.categoryName) + '"></label>' +
    '<label>Price<input id="p-price" type="number" value="' + Number(data.price || 0) + '"></label>' +
    '<label>Sale price<input id="p-sale" type="number" value="' + Number(data.salePrice || 0) + '"></label>' +
    '<label>Image URL<input id="p-image" value="' + esc(data.image) + '"></label>' +
    '<label>Description<textarea id="p-desc">' + esc(data.description || data.shortDescription) + '</textarea></label>' +
    '<label><input id="p-active" type="checkbox" ' + (data.active !== false ? 'checked' : '') + '> Active</label>' +
    '<div class="modal-actions"><button id="p-cancel">Cancel</button><button class="primary" id="p-save">Save product</button></div>' +
    '</div>';

  root.appendChild(wrap);
  wrap.querySelector('#p-cancel').onclick = () => wrap.remove();
  wrap.querySelector('#p-save').onclick = async () => {
    const payload = {
      name: wrap.querySelector('#p-name').value.trim(),
      categoryName: wrap.querySelector('#p-cat').value.trim(),
      price: Number(wrap.querySelector('#p-price').value || 0),
      salePrice: Number(wrap.querySelector('#p-sale').value || 0),
      image: wrap.querySelector('#p-image').value.trim(),
      description: wrap.querySelector('#p-desc').value.trim(),
      active: wrap.querySelector('#p-active').checked,
      updatedAt: serverTimestamp()
    };

    if (!payload.name) {
      alert('Product name is required.');
      return;
    }

    if (data.id) {
      await updateDoc(doc(db, 'products', data.id), payload);
    } else {
      await setDoc(doc(collection(db, 'products')), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    wrap.remove();
    products();
  };
}

async function orders() {
  shell('Orders',
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
    '<th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Update</th>' +
    '</tr></thead><tbody id="orders-body"><tr><td colspan="5">Loading...</td></tr></tbody></table></div>'
  );

  const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200)));
  const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const body = document.getElementById('orders-body');
  if (!body) return;

  body.innerHTML = rows.map((order) =>
    '<tr><td><strong>' + esc(order.orderNumber || order.id) + '</strong></td>' +
    '<td>' + esc((order.customer && order.customer.name) || order.userId || '—') + '<br>' +
      esc((order.customer && order.customer.phone) || (order.deliveryAddress && order.deliveryAddress.phone) || '') + '</td>' +
    '<td>' + money(order.total) + '</td>' +
    '<td>' + esc(order.orderStatus || 'pending') + '</td>' +
    '<td><select data-status="' + order.id + '">' +
      '<option value="pending">pending</option><option value="confirmed">confirmed</option>' +
      '<option value="processing">processing</option><option value="ready">ready</option>' +
      '<option value="out_for_delivery">out_for_delivery</option><option value="completed">completed</option>' +
      '<option value="cancelled">cancelled</option></select></td></tr>'
  ).join('') || '<tr><td colspan="5">No orders yet.</td></tr>';

  document.querySelectorAll('[data-status]').forEach((select) => {
    const current = rows.find((order) => order.id === select.dataset.status);
    select.value = (current && current.orderStatus) || 'pending';
    select.onchange = async () => {
      await updateDoc(doc(db, 'orders', select.dataset.status), {
        orderStatus: select.value,
        updatedAt: serverTimestamp()
      });
    };
  });
}

async function customers() {
  shell('Customers',
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
    '<th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Active</th>' +
    '</tr></thead><tbody id="customers-body"><tr><td colspan="5">Loading...</td></tr></tbody></table></div>'
  );

  const snapshot = await getDocs(query(collection(db, 'users'), limit(200)));
  const rows = snapshot.docs.map((item) => item.data());
  const body = document.getElementById('customers-body');
  if (!body) return;

  body.innerHTML = rows.map((user) => {
    const name = ((user.firstName || '') + ' ' + (user.lastName || '')).trim();
    return '<tr><td>' + esc(name || '—') + '</td><td>' + esc(user.email) + '</td>' +
      '<td>' + esc(user.phone) + '</td><td>' + esc(user.role || 'customer') + '</td>' +
      '<td>' + (user.active === false ? 'No' : 'Yes') + '</td></tr>';
  }).join('') || '<tr><td colspan="5">No customers found.</td></tr>';
}

function content() {
  const pages = [
    ['Home', '/'],
    ['Services', '/services'],
    ['About Us', '/about'],
    ['Contact Us', '/contact'],
    ['Careers', '/careers'],
    ['News', '/news'],
    ['Wellness Catalogue', '/otc-wellness']
  ];

  const cards = pages.map((page) => {
    const name = page[0];
    const path = page[1];
    const target = path === '/' ? '' : path.slice(1);
    return '<article class="content-card"><h3>' + esc(name) + '</h3>' +
      '<p>Review this page as visitors see it.</p>' +
      '<a class="primary" href="' + BASE + target + '">Open page →</a></article>';
  }).join('');

  shell('Website Content',
    '<p class="admin-muted">Open each public page to review its original layout and content.</p>' +
    '<div class="content-grid">' + cards + '</div>'
  );
}

async function dashboard() {
  const body =
    '<div class="admin-stats">' +
    '<div><b id="stat-products">—</b><span>Products</span></div>' +
    '<div><b id="stat-orders">—</b><span>Orders</span></div>' +
    '<div><b id="stat-customers">—</b><span>Customers</span></div>' +
    '</div>' +
    '<section class="admin-panel"><h2>Quick actions</h2><div class="quick">' +
    '<a href="' + BASE + 'admin/products">Manage products →</a>' +
    '<a href="' + BASE + 'admin/orders">Review orders →</a>' +
    '<a href="' + BASE + 'admin/customers">Customers →</a>' +
    '<a href="' + BASE + 'admin/content">Website Content →</a>' +
    '<a href="' + BASE + 'store">View store →</a>' +
    '</div></section>';

  shell('Dashboard', body);

  const results = await Promise.all([
    getDocs(query(collection(db, 'products'), limit(200))),
    getDocs(query(collection(db, 'orders'), limit(200))),
    getDocs(query(collection(db, 'users'), limit(200)))
  ]);

  document.getElementById('stat-products').textContent = results[0].size;
  document.getElementById('stat-orders').textContent = results[1].size;
  document.getElementById('stat-customers').textContent = results[2].size;
}

async function render() {
  if (!location.pathname.startsWith(BASE + 'admin')) return;
  if (location.pathname.endsWith('/login')) return;

  const user = auth.currentUser;
  if (!(await roleOk(user))) return;

  let path = location.pathname.replace(BASE, '');
  if (path.endsWith('/')) path = path.slice(0, -1);

  if (path === 'admin/products') return products();
  if (path === 'admin/orders') return orders();
  if (path === 'admin/customers') return customers();
  if (path === 'admin/content') return content();
  return dashboard();
}

onAuthStateChanged(auth, () => render());
window.addEventListener('popstate', () => render());
