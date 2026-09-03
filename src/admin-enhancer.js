import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const BASE = '/Kalidad-Pharmacy/';

const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const money = (value) => 'UGX ' + Number(value || 0).toLocaleString();
const stockValue = (p) => {
  const raw = p.stockQuantity ?? p.stock;
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, n) : null;
};
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
  const data = snapshot.exists() ? snapshot.data() : {};
  return ['staff','admin','superadmin'].includes(data.role) && data.active !== false;
}

async function dashboard() {
  const [products, orders, users] = await Promise.all([
    getDocs(query(collection(db,'products'), limit(500))),
    getDocs(query(collection(db,'orders'), limit(500))),
    getDocs(query(collection(db,'users'), limit(500)))
  ]);
  const ps = products.docs.map(d=>d.data()); const os = orders.docs.map(d=>d.data());
  const active = ps.filter(p=>p.active !== false).length;
  const low = ps.filter(p=>{const s=stockValue(p);return s!==null&&s>0&&s<=5}).length;
  const out = ps.filter(p=>stockValue(p)===0).length;
  const pending = os.filter(o=>String(o.orderStatus||'pending').toLowerCase()==='pending').length;
  const completed = os.filter(o=>['completed','delivered'].includes(String(o.orderStatus||'').toLowerCase())).length;
  shell('Dashboard', '<p class="admin-muted">Live overview of your pharmacy store and customer activity.</p><div class="admin-cards">'+[
    ['Products',ps.length],['Active products',active],['Orders',os.length],['Customers',users.size],['Low stock',low],['Out of stock',out],['Pending orders',pending],['Completed',completed]
  ].map(([t,v])=>'<div class="admin-card"><span>'+t+'</span><strong>'+v+'</strong></div>').join('')+'</div><div class="admin-actions"><a class="primary" href="'+BASE+'admin/products">Manage products</a><a class="secondary" href="'+BASE+'admin/orders">Review orders</a></div>');
}

async function productsPage() {
  const snap = await getDocs(query(collection(db,'products'), limit(500)));
  const products = snap.docs.map(d=>({id:d.id,...d.data()}));
  shell('Products', '<div class="admin-toolbar"><input id="product-search" placeholder="Search products, brand or SKU…"><button class="primary" id="add-product">+ Add product</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Category</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody id="product-rows"></tbody></table></div>');
  const render = (list) => { const rows=document.getElementById('product-rows'); rows.innerHTML=list.map(p=>{const [sl,sc]=stockLabel(p);return '<tr><td><strong>'+esc(p.name)+'</strong><br><small>'+esc(p.brand||'')+'</small></td><td>'+esc(p.categoryName||p.category||'—')+'</td><td>'+esc(p.sku||'—')+'</td><td>'+money(p.salePrice ?? p.price)+'</td><td><button data-stock="down" data-id="'+p.id+'">−</button> '+(stockValue(p)===null?'—':stockValue(p))+' <button data-stock="up" data-id="'+p.id+'">+</button></td><td><span class="stock-badge '+sc+'">'+sl+'</span></td><td><button data-edit="'+p.id+'">Edit</button> <button data-toggle="'+p.id+'">'+(p.active===false?'Activate':'Deactivate')+'</button> <button data-delete="'+p.id+'">Delete</button></td></tr>'}).join('')||'<tr><td colspan="7">No products found.</td></tr>'; };
  render(products);
  document.getElementById('product-search').oninput=e=>{const q=e.target.value.toLowerCase();render(products.filter(p=>`${p.name} ${p.brand||''} ${p.sku||''} ${p.categoryName||p.category||''}`.toLowerCase().includes(q)))};
  document.getElementById('add-product').onclick=()=>productModal();
  document.querySelector('#product-rows').onclick=async e=>{
    const id=e.target.dataset.id;
    if(e.target.dataset.stock){const p=products.find(x=>x.id===id);if(!p)return;const current=stockValue(p)??0;const next=Math.max(0,current+(e.target.dataset.stock==='up'?1:-1));await updateDoc(doc(db,'products',id),{stockQuantity:next,stock:next,updatedAt:serverTimestamp()});p.stockQuantity=next;p.stock=next;render(products);}
    if(e.target.dataset.toggle){const p=products.find(x=>x.id===e.target.dataset.toggle);await updateDoc(doc(db,'products',p.id),{active:p.active===false,updatedAt:serverTimestamp()});p.active=p.active===false;render(products);}
    if(e.target.dataset.delete){if(confirm('Delete this product?')){await deleteDoc(doc(db,'products',e.target.dataset.delete));const i=products.findIndex(x=>x.id===e.target.dataset.delete);if(i>=0)products.splice(i,1);render(products);}}
    if(e.target.dataset.edit){productModal(products.find(x=>x.id===e.target.dataset.edit));}
  };
}

function productModal(product={}) {
  const wrap=document.createElement('div');wrap.className='admin-modal';wrap.innerHTML='<form class="admin-modal-card"><h2>'+(product.id?'Edit product':'Add product')+'</h2>'+[
    ['name','Product name','text',product.name||'',true],['category','Category','text',product.category||product.categoryName||'',true],['brand','Brand','text',product.brand||''],['sku','SKU','text',product.sku||''],['price','Regular price','number',product.price??'',true],['salePrice','Sale price','number',product.salePrice??''],['stockQuantity','Stock quantity','number',product.stockQuantity??product.stock??''],['image','Image URL','url',product.image||'']
  ].map(([n,l,t,v,r])=>'<label>'+l+'<input name="'+n+'" type="'+t+'" value="'+esc(v)+'" '+(r?'required':'')+'></label>').join('')+'<label>Short description<textarea name="shortDescription">'+esc(product.shortDescription||'')+'</textarea></label><label>Description<textarea name="description">'+esc(product.description||'')+'</textarea></label><label><input name="featured" type="checkbox" '+(product.featured?'checked':'')+'> Featured</label><label><input name="active" type="checkbox" '+(product.active!==false?'checked':'')+'> Active</label><div class="modal-actions"><button type="button" id="cancel-product">Cancel</button><button class="primary">Save product</button></div></form>';
  document.body.appendChild(wrap);wrap.querySelector('#cancel-product').onclick=()=>wrap.remove();wrap.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const data={name:f.get('name'),category:f.get('category'),categoryName:f.get('category'),brand:f.get('brand'),sku:f.get('sku'),price:Number(f.get('price')||0),salePrice:f.get('salePrice')?Number(f.get('salePrice')):null,stockQuantity:f.get('stockQuantity')===''?null:Number(f.get('stockQuantity')),image:f.get('image'),shortDescription:f.get('shortDescription'),description:f.get('description'),featured:f.get('featured')==='on',active:f.get('active')==='on',updatedAt:serverTimestamp()};if(data.stockQuantity!==null)data.stock=data.stockQuantity;if(product.id)await updateDoc(doc(db,'products',product.id),data);else await setDoc(doc(collection(db,'products')), {...data,createdAt:serverTimestamp()});wrap.remove();productsPage();};
}

async function ordersPage(){const snap=await getDocs(query(collection(db,'orders'),limit(500)));const orders=snap.docs.map(d=>({id:d.id,...d.data()}));shell('Orders','<p class="admin-muted">Review customer orders and update their status.</p><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Created</th></tr></thead><tbody>'+orders.map(o=>'<tr><td><strong>'+esc(o.orderNumber||o.id)+'</strong></td><td>'+esc(o.customerName||o.email||o.userId||'—')+'</td><td>'+money(o.total)+'</td><td>'+esc(o.paymentStatus||'pending')+'</td><td><select data-order="'+o.id+'"><option '+(o.orderStatus==='pending'?'selected':'')+'>pending</option><option '+(o.orderStatus==='processing'?'selected':'')+'>processing</option><option '+(o.orderStatus==='ready'?'selected':'')+'>ready</option><option '+(o.orderStatus==='completed'?'selected':'')+'>completed</option><option '+(o.orderStatus==='cancelled'?'selected':'')+'>cancelled</option></select></td><td>'+esc(o.createdAt?.toDate?.().toLocaleString?.()||'—')+'</td></tr>').join('')||'<tr><td colspan="6">No orders yet.</td></tr>'+'</tbody></table></div>');document.querySelectorAll('[data-order]').forEach(s=>s.onchange=async e=>updateDoc(doc(db,'orders',e.target.dataset.order),{orderStatus:e.target.value,updatedAt:serverTimestamp()}));}
async function customersPage(){const snap=await getDocs(query(collection(db,'users'),limit(500)));const users=snap.docs.map(d=>({id:d.id,...d.data()}));shell('Customers','<p class="admin-muted">Customer accounts registered with Kalidad.</p><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead><tbody>'+users.map(u=>'<tr><td>'+esc([u.firstName,u.lastName].filter(Boolean).join(' ')||u.displayName||'—')+'</td><td>'+esc(u.email||'—')+'</td><td>'+esc(u.phone||'—')+'</td><td>'+esc(u.role||'customer')+'</td><td>'+((u.active===false)?'Inactive':'Active')+'</td></tr>').join('')+'</tbody></table></div>');}
function contentPage(){shell('Website Content','<p class="admin-muted">Open the live public pages to review the website experience.</p><div class="content-grid">'+[['Home',''],['Services','services'],['Contact Us','contact'],['Careers','careers'],['News','news'],['About Us','about'],['Wellness','otc-wellness']].map(([n,p])=>'<article class="content-card"><h3>'+n+'</h3><p>Review this public page.</p><a class="primary" href="'+BASE+(p||'')+'">Open page</a></article>').join('')+'</div>');}

onAuthStateChanged(auth, async user=>{
  if(!location.pathname.startsWith(BASE+'admin')) return;
  if(location.pathname===BASE+'admin/login') return;
  if(!(await roleOk(user).catch(()=>false))){location.href=BASE+'admin/login';return;}
  const path=location.pathname.replace(BASE,'/').replace(/\/$/,'')||'/';
  try{if(path==='/admin')await dashboard();else if(path==='/admin/products')await productsPage();else if(path==='/admin/orders')await ordersPage();else if(path==='/admin/customers')await customersPage();else if(path==='/admin/content')contentPage();else await dashboard();}catch(error){console.error(error);shell('Admin error','<div class="error">Unable to load this section. Please refresh and try again.</div>');}
});
