const KEY="kalidadCart";
export function getCart(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function saveCart(cart){localStorage.setItem(KEY,JSON.stringify(cart));window.dispatchEvent(new CustomEvent("cartchange"));return cart}
export function addToCart(product,qty=1){const cart=getCart(),i=cart.findIndex(x=>x.id===product.id),price=Number(product.salePrice??product.price??0);if(i>=0)cart[i].quantity+=qty;else cart.push({id:product.id,name:product.name,price,image:product.image||(product.images?.[0]||""),quantity:qty});return saveCart(cart)}
export function removeFromCart(id){return saveCart(getCart().filter(x=>x.id!==id))}
export function updateQuantity(id,quantity){const cart=getCart(),item=cart.find(x=>x.id===id);if(item)item.quantity=Math.max(1,Number(quantity)||1);return saveCart(cart)}
export function clearCart(){return saveCart([])}
export function cartCount(){return getCart().reduce((n,x)=>n+Number(x.quantity||0),0)}
export function cartTotal(){return getCart().reduce((n,x)=>n+Number(x.price||0)*Number(x.quantity||0),0)}
export function bindCartCount(el){const update=()=>{if(el)el.textContent=cartCount()};update();window.addEventListener("cartchange",update)}
