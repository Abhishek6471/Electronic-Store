/* Merges admin-approved seller listings, admin categories and seller verification into the catalogue. Load right after products.js. */
(function(){const r=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},arr=k=>Array.isArray(r(k))?r(k):[];
arr('rt_cats').forEach(c=>RT_CATS.push(c));const ver=r('rt_sellerver')||{},users=arr('rt_users');
arr('rt_listings').filter(l=>l.status==='Approved'&&l.images&&l.images.length).forEach(l=>{const u=users.find(x=>x.id===l.sellerId);
RT_PRODUCTS.push({id:l.id,name:l.name,brand:l.brand,category:l.category,price:l.price,previousPrice:l.previousPrice,condition:l.condition,location:l.location,stock:l.stock,rating:4.5,sellerId:l.sellerId,sellerName:u&&u.store?u.store.name:'Seller',
daysAgo:Math.max(0,Math.floor((Date.now()-new Date(l.createdAt))/864e5)),description:l.description,specs:Object.assign({Brand:l.brand,Model:l.model,Condition:l.condition},l.specs),warranty:l.warranty,image:l.images[0],images:l.images,verifiedSeller:false})});
RT_PRODUCTS.forEach(p=>{if(ver[p.sellerId]!==undefined)p.verifiedSeller=!!ver[p.sellerId]})})();
