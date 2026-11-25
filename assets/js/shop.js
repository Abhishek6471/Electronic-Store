/* Shop: search, filters, sorting, view toggle, load more */
const PER=9,SORTS={newest:(a,b)=>a.daysAgo-b.daysAgo,low:(a,b)=>a.price-b.price,high:(a,b)=>b.price-a.price,popular:(a,b)=>b.rating-a.rating,discount:(a,b)=>discount(b)-discount(a)};
const CONDS=['Like New','Excellent','Good','Fair','Refurbished'];
const BRANDS=['Apple','Samsung','Xiaomi','OnePlus','HP','Dell','Lenovo','Asus','Acer','Sony','JBL','Logitech'];
const LOCS=[...new Set(RT_PRODUCTS.map(p=>p.location))].sort();
const S={q:'',category:'',min:'',max:'',cond:[],brand:[],loc:[],sort:'newest',view:'grid',shown:PER};
const checks=(name,list)=>list.map(v=>`<label><input type="checkbox" data-f="${name}" value="${v}"> ${v}</label>`).join('');
function buildFilters(){$('#filters').innerHTML=`<fieldset><legend>Category</legend><select id="fCat" aria-label="Category"><option value="">All categories</option>${RT_CATS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></fieldset>
<fieldset><legend>Price (Rs.)</legend><div class="price-row"><input id="fMin" type="number" min="0" placeholder="Min" aria-label="Minimum price"><input id="fMax" type="number" min="0" placeholder="Max" aria-label="Maximum price"></div></fieldset>
<fieldset><legend>Condition</legend>${checks('cond',CONDS)}</fieldset><fieldset><legend>Brand</legend>${checks('brand',BRANDS)}</fieldset><fieldset><legend>Location</legend>${checks('loc',LOCS)}</fieldset>
<button class="btn btn-light btn-sm" id="clearAll" type="button">Clear all filters</button>`}
function filtered(){const q=S.q.toLowerCase(),mn=+S.min||0,mx=+S.max||Infinity;
return RT_PRODUCTS.filter(p=>(!q||(p.name+' '+p.brand+' '+p.category).toLowerCase().includes(q))&&(!S.category||p.category===S.category)&&p.price>=mn&&p.price<=mx&&(!S.cond.length||S.cond.includes(p.condition))&&(!S.brand.length||S.brand.includes(p.brand))&&(!S.loc.length||S.loc.includes(p.location))).sort(SORTS[S.sort])}
function chipList(){const c=[];if(S.q)c.push(['q','Search: '+S.q]);if(S.category)c.push(['category',RT_CATS.find(x=>x.id===S.category).name]);
if(S.min||S.max)c.push(['price','Rs. '+(S.min||0)+' – '+(S.max||'any')]);['cond','brand','loc'].forEach(k=>S[k].forEach(v=>c.push([k+':'+v,v])));return c}
function render(){const all=filtered(),items=all.slice(0,S.shown);
$('#count').textContent=`${all.length} product${all.length===1?'':'s'}`;
const g=$('#shopGrid');g.className='grid'+(S.view==='list'?' list':'');
g.innerHTML=items.length?items.map(productCard).join(''):`<div class="empty" style="grid-column:1/-1"><h3>No products match</h3><p>Try removing a filter or searching for something else.</p><button class="btn btn-primary btn-sm" data-clear style="margin-top:1rem">Clear all filters</button></div>`;
$('#moreWrap').hidden=all.length<=S.shown;
const ch=chipList();$('#chips').innerHTML=ch.map(([k,l])=>`<span class="chip">${esc(l)}<button data-rm="${esc(k)}" aria-label="Remove ${esc(l)}">✕</button></span>`).join('');
$('#fCat').value=S.category;$('#fMin').value=S.min;$('#fMax').value=S.max;$('#sort').value=S.sort;
$$('[data-f]').forEach(i=>i.checked=S[i.dataset.f].includes(i.value));$$('.view-btn').forEach(b=>b.classList.toggle('on',b.dataset.view===S.view));
$('#searchBox').value=S.q}
function reset(){Object.assign(S,{q:'',category:'',min:'',max:'',cond:[],brand:[],loc:[],shown:PER});render()}
function initShop(){buildFilters();const u=new URLSearchParams(location.search);S.q=u.get('q')||'';const c=u.get('category');if(RT_CATS.some(x=>x.id===c))S.category=c;
$('#clearAll').onclick=reset;
document.addEventListener('click',e=>{if(e.target.closest('[data-clear]'))reset();
const r=e.target.closest('[data-rm]');if(r){const k=r.dataset.rm;if(k==='q')S.q='';else if(k==='category')S.category='';else if(k==='price')S.min=S.max='';else{const[f,v]=k.split(':');S[f]=S[f].filter(x=>x!==v)}S.shown=PER;render()}
const vb=e.target.closest('.view-btn');if(vb){S.view=vb.dataset.view;render()}
if(e.target.closest('#loadMore')){S.shown+=PER;render()}
if(e.target.closest('#filterToggle'))$('#filters').classList.toggle('open')});
$('#filters').addEventListener('input',e=>{const t=e.target;if(t.id==='fCat')S.category=t.value;else if(t.id==='fMin')S.min=t.value;else if(t.id==='fMax')S.max=t.value;
else if(t.dataset.f){const a=S[t.dataset.f];S[t.dataset.f]=t.checked?[...a,t.value]:a.filter(x=>x!==t.value)}S.shown=PER;render()});
$('#sort').onchange=e=>{S.sort=e.target.value;render()};
$('#shopSearch').onsubmit=e=>{e.preventDefault();S.q=$('#searchBox').value.trim();S.shown=PER;render()};render()}
document.addEventListener('DOMContentLoaded',()=>rtReady(initShop));
