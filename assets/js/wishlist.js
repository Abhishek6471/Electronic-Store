const RTWish={key:'rt_wishlist',get(){try{const v=JSON.parse(localStorage.getItem(this.key));return Array.isArray(v)?v:[]}catch{return[]}},
has(id){return this.get().includes(id)},
toggle(id){let l=this.get();const on=!l.includes(id);l=on?[...l,id]:l.filter(x=>x!==id);try{localStorage.setItem(this.key,JSON.stringify(l))}catch{}return on}};
