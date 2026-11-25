/* Checkout: validation, order creation via the backend API, confirmation */
const PROVINCES=['Koshi','Madhesh','Bagmati','Gandaki','Lumbini','Karnali','Sudurpashchim'];
const RULES={name:v=>v.trim().length>=3||'Enter your full name',phone:v=>/^9[78]\d{8}$/.test(v.trim())||'Enter a 10-digit Nepali mobile number (98/97…)',email:v=>/^\S+@\S+\.\S+$/.test(v.trim())||'Enter a valid email',province:v=>!!v||'Select a province',district:v=>v.trim().length>=2||'Enter your district',city:v=>v.trim().length>=2||'Enter your city',address:v=>v.trim().length>=6||'Enter your full address'};
const field=(id,label,type='text',extra='')=>`<div class="field" id="f-${id}"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" ${extra}><div class="err" id="e-${id}"></div></div>`;
async function confirmation(id){const r=$('#checkoutRoot');let o=null;
try{const mine=await api('/orders');o=(mine||[]).find(x=>x.id===id)}catch{}
if(!o){r.innerHTML=emptyBox('Order not found','We could not find that order on your account.','Back to shop','shop.html');return}
r.innerHTML=`<div class="done"><div class="tick">✓</div><h1>Order placed</h1><p style="margin:.6rem 0">Your order ID is <code>${esc(o.id)}</code></p>
<p class="meta" style="display:block">${o.items.length} item(s) · Total ${npr(o.total)} · Payment: ${esc(o.paymentMethod==='COD'?'Cash on Delivery':o.paymentMethod)}<br>Deliver to ${esc(o.address.name)}, ${esc(o.address.city)}, ${esc(o.address.district)}</p>
<p class="notice" style="margin-top:1rem">Order saved to your account. Stock has been reserved. Cash on delivery — pay when it arrives.</p><a class="btn btn-primary" href="shop.html">Continue shopping</a> <a class="btn btn-light" href="orders.html">My orders</a></div>`}
async function initCheckout(){const r=$('#checkoutRoot'),oid=new URLSearchParams(location.search).get('order');if(oid)return confirmation(oid);
const user=await RTAuth.me();
if(!user){r.innerHTML=emptyBox('Log in to check out','You need an account so your order is saved and tracked.','Log in','login.html?next=checkout.html');return}
const items=cartItems();if(!items.length)return r.innerHTML=emptyBox('Your cart is empty','Add something before checking out.','Browse products','shop.html');
r.innerHTML=`<form class="two-col" id="coForm" novalidate><div><div class="box" style="margin-top:0"><h3>Delivery details</h3><div class="form-grid">
${field('name','Full name','text','autocomplete="name"')}${field('phone','Phone number','tel','autocomplete="tel" placeholder="98XXXXXXXX"')}<div class="full">${field('email','Email','email','autocomplete="email"')}</div>
<div class="field" id="f-province"><label for="province">Province</label><select id="province" name="province"><option value="">Select…</option>${PROVINCES.map(p=>`<option>${p}</option>`).join('')}</select><div class="err" id="e-province"></div></div>
${field('district','District')}${field('city','City')}<div class="full">${field('address','Full address','text','autocomplete="street-address"')}</div>
<div class="field full"><label for="notes">Delivery instructions (optional)</label><textarea id="notes" rows="2"></textarea></div></div></div>
<div class="box"><h3>Payment method</h3><p class="notice">Online payments (eSewa, Khalti) are not connected yet. Cash on Delivery is available now.</p>
<label class="pay"><input type="radio" name="pay" value="Cash on Delivery" checked><span>Cash on Delivery<small>Pay when the device arrives.</small></span></label></div></div>
<aside class="summary">${summaryHTML(items,'<button class="btn btn-primary">Place order</button>')}<p class="meta" style="margin-top:.6rem">${items.map(i=>esc(i.p.name)+' × '+i.qty).join('<br>')}</p></aside></form>`;
$('#coForm').addEventListener('submit',async e=>{e.preventDefault();let ok=true,first=null;const c={};
Object.entries(RULES).forEach(([k,f])=>{const el=$('#'+k),res=f(el.value);c[k]=el.value.trim();$('#f-'+k).classList.toggle('bad',res!==true);$('#e-'+k).textContent=res===true?'':res;if(res!==true){ok=false;first=first||el}});
if(!ok){first.focus();toast('Please fix the highlighted fields');return}
const btn=$('#coForm').querySelector('button.btn-primary');btn.disabled=true;btn.textContent='Placing order…';
const cur=cartItems();
try{
  const order=await api('/orders',{method:'POST',body:{
    idempotencyKey:'web-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),
    paymentMethod:'COD',
    items:cur.map(i=>({productId:i.p.id,qty:i.qty})),
    address:{...c,notes:$('#notes').value.trim()||undefined}
  }});
  RTCart.save([]);updateCounts();location.href='checkout.html?order='+order.id;
}catch(err){btn.disabled=false;btn.textContent='Place order';toast(err.message||'Could not place the order')}
})}
document.addEventListener('DOMContentLoaded',initCheckout);
