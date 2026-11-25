/* Shared UI: header/footer, theme, toasts, product cards, homepage rendering */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
/* Small localStorage helper still used by client-only demo features (seller listings,
   exchange requests, contact messages). Anything that must persist server-side uses the API instead. */
const LS={get(k){try{const v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)?v:[]}catch{return[]}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{toast('Storage full or unavailable');return false}}};
const npr=n=>'Rs. '+n.toLocaleString('en-IN');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const discount=p=>Math.round((1-p.price/p.previousPrice)*100);
function toast(msg){let b=$('#toasts');if(!b){b=document.createElement('div');b.id='toasts';b.setAttribute('role','status');document.body.append(b)}
const t=document.createElement('div');t.className='toast';t.textContent=msg;b.append(t);setTimeout(()=>t.remove(),2600)}
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('rt_theme',t)}catch{}}
(function(){let t;try{t=localStorage.getItem('rt_theme')}catch{}setTheme(t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))})();
const NAV=[['index.html','Home'],['shop.html','Shop'],['sell.html','Sell'],['exchange.html','Exchange'],['about.html','About']];
function renderHeader(){const page=location.pathname.split('/').pop()||'index.html';
$('#site-header').outerHTML=`<div class="announce"><span>Special offers this week</span><span>Nationwide delivery</span><span>Every product verified</span></div>
<header class="site-header"><div class="container nav">
<a class="logo" href="index.html"><i>R</i>ReTech Nepal</a>
<nav class="nav-links" id="navLinks" aria-label="Main">${NAV.map(([h,l])=>`<a href="${h}"${h===page?' class="active"':''}>${l}</a>`).join('')}</nav>
<form class="search" action="shop.html" role="search"><input name="q" type="search" placeholder="Search phones, laptops, cameras…" aria-label="Search products"><button>Search</button></form>
<div class="nav-actions">
<a class="icon-btn" href="wishlist.html" aria-label="Wishlist">♡<span class="badge-count" id="wishCount"></span></a>
<a class="icon-btn" href="cart.html" aria-label="Cart">🛒<span class="badge-count" id="cartCount"></span></a>
<div class="account"><button class="icon-btn" id="acctBtn" aria-label="Account menu" aria-expanded="false">👤</button>
<div class="dropdown" id="acctMenu"><a href="login.html">Log in</a><a href="register.html">Create account</a><a href="profile.html">My profile</a><a href="orders.html">My orders</a><a href="dashboard.html">Seller dashboard</a></div></div>
<button class="icon-btn" id="themeBtn" aria-label="Toggle dark theme">◐</button>
<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">☰</button></div></div></header>`}
function renderFooter(){$('#site-footer').outerHTML=`<footer class="footer"><div class="container"><div class="footer-grid">
<div><a class="logo" href="index.html"><i>R</i>ReTech Nepal</a><p>Buy. Sell. Exchange. Upgrade.<br>Quality-tested electronics across Nepal.</p></div>
<div><h4>Marketplace</h4><a href="shop.html">Shop</a><a href="sell.html">Sell a device</a><a href="exchange.html">Exchange</a><a href="compare.html">Compare</a></div>
<div><h4>Account</h4><a href="login.html">Log in</a><a href="orders.html">Orders</a><a href="wishlist.html">Wishlist</a><a href="dashboard.html">Seller dashboard</a></div>
<div><h4>Company</h4><a href="about.html">About us</a><a href="contact.html">Contact</a><a href="faq.html">FAQ</a><a href="admin.html">Admin demo</a></div></div>
<div class="footer-bottom"><span>© 2026 ReTech Nepal. Frontend prototype: payments, accounts and valuations are simulated.</span><span>Made in Nepal</span></div></div></footer>`}
function updateCounts(){const w=RTWish.get().length,c=RTCart.count();[['wishCount',w],['cartCount',c]].forEach(([id,n])=>{const e=$('#'+id);if(e){e.textContent=n||'';e.dataset.n=n}})}
function imgFail(el,id){const p=byId(id);if(!el.dataset.tried&&p&&p.fallbackImage){el.dataset.tried='1';el.src=p.fallbackImage}else{el.onerror=null;el.src=RT_FALLBACK}}
function productCard(p){const on=RTWish.has(p.id);return`<article class="card"><div class="card-img"><a href="product.html?id=${p.id}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" onerror="imgFail(this,'${p.id}')"></a>
<span class="tag">${p.condition}</span><span class="tag off">-${discount(p)}%</span>
<button class="wish${on?' on':''}" data-wish="${p.id}" aria-pressed="${on}" aria-label="Save ${esc(p.name)} to wishlist">${on?'♥':'♡'}</button></div>
<div class="card-body"><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
<div class="price">${npr(p.price)}<s>${npr(p.previousPrice)}</s></div>
<div class="meta"><span>📍 ${p.location}</span>${p.verifiedSeller?'<span class="verified">✔ Verified seller</span>':'<span>Seller</span>'}</div>
<button class="btn btn-primary btn-sm" data-cart="${p.id}">Add to cart</button></div></article>`}
const byId=id=>RT_PRODUCTS.find(p=>p.id===id);
const LISTS={featured:()=>[...RT_PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,8),
recent:()=>[...RT_PRODUCTS].sort((a,b)=>a.daysAgo-b.daysAgo).slice(0,4),deals:()=>[...RT_PRODUCTS].sort((a,b)=>discount(b)-discount(a)).slice(0,4)};
function renderList(el,items){el.innerHTML=items.map(productCard).join('')}
function initHome(){const g=$('#categoryGrid');if(!g)return;
g.innerHTML=RT_CATS.map(c=>`<a class="cat" href="shop.html?category=${c.id}"><span>${c.icon}</span>${c.name}</a>`).join('');
const f=$('#featuredGrid');renderList(f,LISTS.featured());renderList($('#recentGrid'),LISTS.recent());renderList($('#dealsGrid'),LISTS.deals());
$$('.tab').forEach(t=>t.addEventListener('click',()=>{$$('.tab').forEach(x=>{x.classList.toggle('on',x===t);x.setAttribute('aria-selected',x===t)});
const cat=t.dataset.cat;renderList(f,cat==='all'?LISTS.featured():RT_PRODUCTS.filter(p=>p.category===cat).slice(0,8))}))}
function initGlobal(){
document.addEventListener('click',e=>{
const w=e.target.closest('[data-wish]');if(w){const on=RTWish.toggle(w.dataset.wish);$$(`[data-wish="${w.dataset.wish}"]`).forEach(b=>{b.classList.toggle('on',on);b.textContent=on?'♥':'♡';b.setAttribute('aria-pressed',on)});updateCounts();toast(on?'Saved to wishlist':'Removed from wishlist');return}
const c=e.target.closest('[data-cart]');if(c){const p=byId(c.dataset.cart);RTCart.add(p.id);updateCounts();toast(p.name+' added to cart');return}
if(e.target.closest('#themeBtn')){setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');return}
if(e.target.closest('#menuBtn')){$('#navLinks').classList.toggle('open');return}
const m=$('#acctMenu'),a=e.target.closest('#acctBtn');m.classList.toggle('open',!!a&&!m.classList.contains('open'));$('#acctBtn').setAttribute('aria-expanded',m.classList.contains('open'))});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#acctMenu')?.classList.remove('open')});
const nl=$('#newsletterForm');nl?.addEventListener('submit',e=>{e.preventDefault();const em=nl.email.value.trim();
if(!/^\S+@\S+\.\S+$/.test(em)){toast('Enter a valid email address');return}try{localStorage.setItem('rt_newsletter',em)}catch{}nl.reset();toast('Subscribed. Thanks for joining!')})}
document.addEventListener('DOMContentLoaded',()=>{rtReady(()=>{renderHeader();renderFooter();updateCounts();initHome()});initGlobal()});
