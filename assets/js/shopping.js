/* Wishlist, cart and compare pages (picked by <body data-page>) */
const _s=(()=>{try{return JSON.parse(localStorage.getItem('rt_settings'))||{}}catch{return{}}})(),FREE_OVER=+_s.freeOver||50000,DELIVERY=(_s.delivery===undefined||_s.delivery==='')?200:+_s.delivery;
const totals=items=>{const sub=items.reduce((s,i)=>s+i.p.price*i.qty,0);const del=sub===0||sub>=FREE_OVER?0:DELIVERY;return{sub,del,total:sub+del}};
const cartItems=()=>RTCart.get().map(i=>({p:byId(i.id),qty:i.qty})).filter(i=>i.p);
const emptyBox=(t,m,l,h)=>`<div class="empty"><h3>${t}</h3><p>${m}</p><a class="btn btn-primary btn-sm" href="${h}" style="margin-top:1rem">${l}</a></div>`;
function summaryHTML(items,btn){const t=totals(items);return`<h2>Order summary</h2><div class="sum-row"><span>Subtotal</span><span>${npr(t.sub)}</span></div>
<div class="sum-row"><span>Delivery</span><span>${t.del?npr(t.del):'Free'}</span></div><div class="sum-row total"><span>Total</span><span>${npr(t.total)}</span></div>
<p class="meta" style="margin-top:.5rem">Free delivery on orders over ${npr(FREE_OVER)}.</p>${btn||''}`}
function renderWishlist(){const r=$('#wishRoot'),items=RTWish.get().map(byId).filter(Boolean);
r.innerHTML=items.length?`<div class="toolbar"><span class="count">${items.length} saved</span><button class="btn btn-light btn-sm" id="allToCart">Add all to cart</button></div><div class="grid">${items.map(productCard).join('')}</div>`
:emptyBox('Your wishlist is empty','Tap the heart on any product to save it here.','Browse products','shop.html')}
function renderCart(){const r=$('#cartRoot'),items=cartItems();
if(!items.length){r.innerHTML=emptyBox('Your cart is empty','Add a device to get started.','Continue shopping','shop.html');return}
r.innerHTML=`<div class="two-col"><div>${items.map(({p,qty})=>`<div class="line"><a href="product.html?id=${p.id}"><img src="${p.image}" alt="${esc(p.name)}" onerror="imgFail(this,'${p.id}')"></a>
<div><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3><div class="meta">${p.condition} · ${npr(p.price)} each · ${p.stock} in stock</div>
<div class="qty"><button data-q="${p.id}" data-d="-1" aria-label="Decrease">−</button><output>${qty}</output><button data-q="${p.id}" data-d="1" aria-label="Increase">+</button></div><button class="link-btn" data-rm="${p.id}">Remove</button></div>
<div class="line-total">${npr(p.price*qty)}</div></div>`).join('')}</div>
<aside class="summary">${summaryHTML(items,'<a class="btn btn-primary" href="checkout.html">Proceed to checkout</a>')}</aside></div>`}
function renderCompare(){const r=$('#cmpRoot');let ids=[];try{ids=JSON.parse(localStorage.getItem('rt_compare'))||[]}catch{}
const ps=ids.map(byId).filter(Boolean);
const picker=ps.length<3?`<div class="toolbar"><select id="cmpAdd" aria-label="Add a product to compare"><option value="">Add a product…</option>${RT_PRODUCTS.filter(p=>!ids.includes(p.id)).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>`:'';
if(!ps.length){r.innerHTML=picker+emptyBox('Nothing to compare yet','Add up to 3 products using the picker or the Compare button on a product page.','Browse products','shop.html');return}
const rows=[['Price',p=>npr(p.price)],['Previous price',p=>npr(p.previousPrice)],['Discount',p=>'-'+discount(p)+'%'],['Brand',p=>p.brand],['Category',p=>RT_CATS.find(c=>c.id===p.category).name],['Condition',p=>p.condition],['Rating',p=>'★ '+p.rating],['Location',p=>p.location],['Warranty',p=>p.warranty],['Stock',p=>p.stock]];
r.innerHTML=picker+`<div class="cmp-wrap"><table class="cmp"><tr><th></th>${ps.map(p=>`<td><img src="${p.image}" alt="${esc(p.name)}" onerror="imgFail(this,'${p.id}')"><br><a href="product.html?id=${p.id}"><b>${esc(p.name)}</b></a><br><button class="link-btn" data-cr="${p.id}">Remove</button> <button class="btn btn-primary btn-sm" data-cart="${p.id}" style="margin-top:.4rem">Add to cart</button></td>`).join('')}</tr>
${rows.map(([l,f])=>`<tr><th>${l}</th>${ps.map(p=>`<td>${esc(f(p))}</td>`).join('')}</tr>`).join('')}</table></div>`}
const saveCmp=ids=>{try{localStorage.setItem('rt_compare',JSON.stringify(ids))}catch{}renderCompare()};
document.addEventListener('DOMContentLoaded',()=>{const pg=document.body.dataset.page;
({wishlist:renderWishlist,cart:renderCart,compare:renderCompare}[pg]||(()=>{}))();
document.addEventListener('click',e=>{
if(pg==='wishlist'){if(e.target.closest('[data-wish]'))setTimeout(renderWishlist);if(e.target.closest('#allToCart')){RTWish.get().forEach(id=>RTCart.add(id));updateCounts();toast('All saved items added to cart')}}
if(pg==='cart'){const q=e.target.closest('[data-q]'),rm=e.target.closest('[data-rm]');
if(q){const c=RTCart.get(),i=c.find(x=>x.id===q.dataset.q),p=byId(i.id),n=i.qty+ +q.dataset.d;if(n>p.stock){toast('Only '+p.stock+' in stock');return}if(n<1)return;i.qty=n;RTCart.save(c);updateCounts();renderCart()}
if(rm){RTCart.save(RTCart.get().filter(x=>x.id!==rm.dataset.rm));updateCounts();renderCart();toast('Item removed')}}
if(pg==='compare'){const c=e.target.closest('[data-cr]');if(c){let ids=[];try{ids=JSON.parse(localStorage.getItem('rt_compare'))||[]}catch{}saveCmp(ids.filter(x=>x!==c.dataset.cr))}}});
document.addEventListener('change',e=>{if(e.target.id==='cmpAdd'&&e.target.value){let ids=[];try{ids=JSON.parse(localStorage.getItem('rt_compare'))||[]}catch{}saveCmp([...ids,e.target.value])}})});
