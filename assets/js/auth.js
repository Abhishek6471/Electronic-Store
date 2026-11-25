/* Accounts via the real backend API (session cookie). Helpers + shared form builders. */
const RTAuth={
  _me:null,
  async me(){ if(this._me) return this._me; try{ const r=await api('/auth/me'); this._me=r.user||null; }catch{ this._me=null; } return this._me; },
  async logout(){ try{ await api('/auth/logout',{method:'POST'}); }catch{} this._me=null; },
  cache(u){ this._me=u; }
};
const apiOrToast = async (path, opts) => { try { return await api(path, opts); } catch (e) { toast(e.message || 'Something went wrong'); throw e; } };
const fld=(id,label,type='text',extra='',cls='')=>`<div class="field ${cls}" id="f-${id}"><label for="${id}">${label}</label>${type==='textarea'?`<textarea id="${id}" rows="3" ${extra}></textarea>`:`<input id="${id}" type="${type}" ${extra}>`}<div class="err" id="e-${id}"></div></div>`;
const sel=(id,label,opts,cls='')=>`<div class="field ${cls}" id="f-${id}"><label for="${id}">${label}</label><select id="${id}"><option value="">Select…</option>${opts.map(o=>Array.isArray(o)?`<option value="${o[0]}">${o[1]}</option>`:`<option>${o}</option>`).join('')}</select><div class="err" id="e-${id}"></div></div>`;
const bad=(id,m)=>{$('#f-'+id).classList.toggle('bad',!!m);$('#e-'+id).textContent=m||'';return!m};
function readImgs(files,max=4){return Promise.all([...files].slice(0,max).filter(f=>f.type.startsWith('image/')).map(f=>new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,640/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};im.onerror=()=>res(null);im.src=r.result};r.onerror=()=>res(null);r.readAsDataURL(f)}))).then(a=>a.filter(Boolean))}
async function guard(){const u=await RTAuth.me();if(!u)location.href='login.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search);return u}
const root=()=>$('#pageRoot');
async function fixMenu(){const m=$('#acctMenu');if(!m)return;const u=await RTAuth.me();
m.innerHTML=u?`<a href="profile.html">${esc(u.name)}</a><a href="orders.html">My orders</a><a href="${u.isSeller?'dashboard.html':'sell.html'}">${u.isSeller?'Seller dashboard':'Start selling'}</a><a href="exchange.html">Exchange</a><a href="#" id="logoutLink">Log out</a>`:'<a href="login.html">Log in</a><a href="register.html">Create account</a>';
$('#logoutLink')?.addEventListener('click',e=>{e.preventDefault();RTAuth.logout();location.href='index.html'})}
const NOTE='<p class="notice">Accounts, passwords and sessions are now handled by a real backend (hashed passwords, HTTP-only session cookies).</p>';
function pgRegister(){root().innerHTML=`<form class="auth-card" id="rf" novalidate><div class="grid2">${fld('name','Full name')}${fld('email','Email','email')}${fld('password','Password (8+ characters)','password')}${fld('confirm','Confirm password','password')}${sel('role','Account type',['Customer','Seller'],'full')}
<div class="full" id="storeBox" hidden>${fld('store','Store name')}${fld('desc','Store description','textarea')}</div></div><button class="btn btn-primary">Create account</button><p class="meta" style="margin:.8rem 0">Already registered? <a class="verified" href="login.html">Log in</a></p>${NOTE}</form>`;
$('#role').onchange=e=>$('#storeBox').hidden=e.target.value!=='Seller';
$('#rf').onsubmit=async e=>{e.preventDefault();const v=id=>$('#'+id).value.trim(),em=v('email').toLowerCase(),sel=v('role');let ok=true;
ok=bad('name',v('name').length<3&&'Enter your full name')&ok;ok=bad('email',!/^\S+@\S+\.\S+$/.test(em)?'Enter a valid email':'')&ok;
ok=bad('password',$('#password').value.length<8&&'Use at least 8 characters')&ok;ok=bad('confirm',$('#confirm').value!==$('#password').value&&'Passwords do not match')&ok;ok=bad('role',!sel&&'Choose an account type')&ok;
if(sel==='Seller')ok=bad('store',v('store').length<3&&'Enter a store name')&ok;if(!ok)return;
try{const r=await apiOrToast('/auth/register',{method:'POST',body:{name:v('name'),email:em,password:$('#password').value,wantsToSell:sel==='Seller',storeName:sel==='Seller'?v('store'):undefined}});
RTAuth.cache(r.user);location.href=sel==='Seller'?'dashboard.html':'profile.html'}catch{}}}
function pgLogin(){root().innerHTML=`<form class="auth-card" id="lf" novalidate>${fld('email','Email','email')}${fld('password','Password','password')}<button class="btn btn-primary">Log in</button><p class="meta" style="margin:.8rem 0">New here? <a class="verified" href="register.html">Create an account</a></p>${NOTE}</form>`;
$('#lf').onsubmit=async e=>{e.preventDefault();const em=$('#email').value.trim().toLowerCase();bad('email','');
try{const r=await apiOrToast('/auth/login',{method:'POST',body:{email:em,password:$('#password').value}});
RTAuth.cache(r.user);const n=new URLSearchParams(location.search).get('next');location.href=n&&/^[\w.-]+\.html/.test(n)?n:'profile.html'}catch{}}}
async function pgProfile(){if(!await guard())return;const r=root();
const u=await RTAuth.me();
r.innerHTML=`<div class="box" style="margin-top:0"><h3>Account details</h3>
<div class="grid2">${fld('name','Full name','text','value="'+esc(u.name)+'" readonly')}${fld('phone','Phone','tel','value="'+esc(u.phone||'')+'" readonly')}
<p class="meta full">${esc(u.email)} · ${esc(u.role)} account${u.isSeller?' · Seller':''}${u.emailVerified?' · ✔ Email verified':''}</p></div>
<p class="meta">Profile editing, saved addresses and the store profile are handled by the backend in a later update.</p></div>
<div class="box"><h3>Settings</h3><button class="btn btn-light btn-sm" id="lo">Log out</button></div>`;
r.addEventListener('click',e=>{if(e.target.id==='lo'){RTAuth.logout();location.href='index.html'}})}
async function pgOrders(){const u=await guard();if(!u)return;
let os=[];try{os=await api('/orders')}catch(e){os=[]}
root().innerHTML=os.length?os.map(o=>`<div class="req"><div class="toolbar" style="margin:0"><b>${esc(o.id)}</b><span class="count">${new Date(o.createdAt).toLocaleDateString()} · ${esc(o.paymentMethod==='COD'?'Cash on Delivery':o.paymentMethod)}</span><span class="st ${(o.status||'').toLowerCase()}">${esc(o.status)}</span></div>
<p class="meta" style="display:block;margin:.5rem 0">${o.items.map(i=>esc(i.name)+' × '+i.qty).join('<br>')}</p><b>Total ${npr(o.total)}</b></div>`).join('')
:`<div class="empty"><h3>No orders yet</h3><p>Orders you place at checkout will appear here, saved on the server.</p><a class="btn btn-primary btn-sm" href="shop.html" style="margin-top:1rem">Start shopping</a></div>`}
document.addEventListener('DOMContentLoaded',()=>{fixMenu();({register:pgRegister,login:pgLogin,profile:pgProfile,orders:pgOrders}[document.body.dataset.page]||(()=>{}))()});
