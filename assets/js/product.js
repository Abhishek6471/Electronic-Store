/* Product detail page */
const SELLERS={1:'Himal Mobiles',2:'KTM Gadget Hub',3:'Pokhara Tech Store',4:'Biratnagar Digital',5:'Butwal Electronics',6:'Newa Computers',7:'Lalitpur Laptops'};
function gallery(p){if(p.images&&p.images.length)return p.images;const ic=RT_CATS.find(c=>c.id===p.category).icon,h=parseInt(p.id.slice(1))*37%360;return[p.image]}
function model(p){return p.name.replace(p.brand,'').trim()||p.name}
function showProduct(){const root=$('#productRoot'),id=new URLSearchParams(location.search).get('id'),p=byId(id);
if(!p){root.innerHTML=`<div class="empty"><h3>Product not found</h3><p>This listing may have been removed.</p><a class="btn btn-primary btn-sm" href="shop.html" style="margin-top:1rem">Back to shop</a></div>`;return}
document.title=p.name+' | ReTech Nepal';const imgs=gallery(p),cat=RT_CATS.find(c=>c.id===p.category),seller=SELLERS[p.sellerId]||p.sellerName||'Seller';let qty=1;
const specs={...p.specs,Model:model(p),'Stock':p.stock+' available'};
root.innerHTML=`<p class="crumbs"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?category=${p.category}">${cat.name}</a> / ${esc(p.name)}</p>
<div class="pd"><div><div class="gallery-main"><img id="mainImg" src="${imgs[0]}" alt="${esc(p.name)}" onerror="imgFail(this,'${p.id}')"></div>
<div class="thumbs">${imgs.length<2?'':imgs.map((s,i)=>`<button class="${i?'':'on'}" data-img="${i}" aria-label="Image ${i+1}"><img src="${s}" alt="${esc(p.name)} photo ${i+1}"></button>`).join('')}</div></div>
<div><span class="pill">${p.condition}</span><span class="pill">${p.brand}</span>
<h1>${esc(p.name)}</h1><div class="price">${npr(p.price)}<s>${npr(p.previousPrice)}</s> <span class="pill off">-${discount(p)}%</span></div>
<p style="margin:.6rem 0">★ ${p.rating} · <span class="pill ${p.stock>0?'ok':'off'}">${p.stock>0?'In stock ('+p.stock+')':'Out of stock'}</span></p>
<p>${esc(p.description)}</p>
<div class="buy-row"><div class="qty"><button id="qm" aria-label="Decrease quantity">−</button><output id="qv">1</output><button id="qp" aria-label="Increase quantity">+</button></div>
<button class="btn btn-primary" id="addBtn">Add to cart</button><button class="btn btn-light" id="buyBtn">Buy now</button></div>
<div class="buy-row" style="margin-top:0"><button class="btn btn-light btn-sm" data-wish="${p.id}" style="border-radius:99px">${RTWish.has(p.id)?'♥ Saved':'♡ Wishlist'}</button><button class="btn btn-light btn-sm" id="cmpBtn">⇄ Compare</button><button class="btn btn-light btn-sm" id="contactBtn">✉ Contact seller</button></div>
<div class="box"><h3>${esc(seller)} ${p.verifiedSeller?'<span class="verified">✔ Verified</span>':''}</h3><p>📍 ${p.location}${p.verifiedSeller?'':' · Verification pending'}</p></div>
<div class="box"><h3>Delivery, warranty and returns</h3><p>🚚 Delivery in 2–5 days across Nepal. Charges are calculated at checkout.<br>🛡 ${p.warranty}.<br>↩ 7-day return if the device does not match its listing.</p></div></div></div>
<div class="box"><h3>Specifications</h3><table class="specs">${Object.entries(specs).map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></div>
<div class="section-head" style="margin-top:var(--s4)"><h2>Related products</h2></div><div class="grid" id="related"></div>
<div class="modal" id="contactModal" role="dialog" aria-modal="true" aria-labelledby="cmTitle"><form class="modal-box" id="contactForm" novalidate><h3 id="cmTitle">Message ${esc(seller)}</h3>
<label for="cmName">Your name</label><input id="cmName" required><label for="cmMsg">Message</label><textarea id="cmMsg" rows="4" required>Hi, is the ${esc(p.name)} still available?</textarea><div class="err" id="cmErr" role="alert"></div>
<div class="buy-row"><button class="btn btn-primary btn-sm">Send message</button><button type="button" class="btn btn-light btn-sm" id="cmClose">Cancel</button></div><p class="meta">Prototype: messages are saved in this browser only.</p></form></div>`;
const rel=RT_PRODUCTS.filter(x=>x.id!==p.id&&x.category===p.category);const more=RT_PRODUCTS.filter(x=>x.id!==p.id&&x.category!==p.category&&x.brand===p.brand);
$('#related').innerHTML=[...rel,...more,...RT_PRODUCTS].filter((x,i,a)=>x.id!==p.id&&a.indexOf(x)===i).slice(0,4).map(productCard).join('');
const setQ=n=>{qty=Math.max(1,Math.min(p.stock,n));$('#qv').textContent=qty};
root.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
if(t.dataset.img){$('#mainImg').src=imgs[t.dataset.img];$$('.thumbs button').forEach(b=>b.classList.toggle('on',b===t))}
if(t.id==='qm')setQ(qty-1);if(t.id==='qp'){qty>=p.stock?toast('Only '+p.stock+' in stock'):setQ(qty+1)}
if(t.id==='addBtn'){RTCart.add(p.id,qty);updateCounts();toast(qty+' × '+p.name+' added to cart')}
if(t.id==='buyBtn'){RTCart.add(p.id,qty);location.href='cart.html'}
if(t.id==='cmpBtn'){let c=[];try{c=JSON.parse(localStorage.getItem('rt_compare'))||[]}catch{}if(c.includes(p.id))toast('Already in compare list');else if(c.length>=3)toast('Compare up to 3 products');else{c.push(p.id);try{localStorage.setItem('rt_compare',JSON.stringify(c))}catch{}toast('Added to compare ('+c.length+'/3)')}}
if(t.id==='contactBtn')$('#contactModal').classList.add('open');if(t.id==='cmClose')$('#contactModal').classList.remove('open');
if(t.dataset.wish)setTimeout(()=>t.textContent=RTWish.has(p.id)?'♥ Saved':'♡ Wishlist')});
$('#contactForm').onsubmit=e=>{e.preventDefault();const n=$('#cmName').value.trim(),m=$('#cmMsg').value.trim();
if(!n||m.length<5){$('#cmErr').textContent='Enter your name and a message of at least 5 characters.';return}
let l=[];try{l=JSON.parse(localStorage.getItem('rt_inquiries'))||[]}catch{}l.push({productId:p.id,sellerId:p.sellerId,name:n,message:m,date:new Date().toISOString()});
try{localStorage.setItem('rt_inquiries',JSON.stringify(l))}catch{}$('#cmErr').textContent='';$('#contactModal').classList.remove('open');toast('Message sent to '+seller)}}
document.addEventListener('DOMContentLoaded',()=>rtReady(showProduct));
