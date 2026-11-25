const RTCart={key:'rt_cart',get(){try{const v=JSON.parse(localStorage.getItem(this.key));return Array.isArray(v)?v:[]}catch{return[]}},
save(c){try{localStorage.setItem(this.key,JSON.stringify(c))}catch{}},
add(id,qty=1){const c=this.get(),i=c.find(x=>x.id===id);i?i.qty+=qty:c.push({id,qty});this.save(c)},
count(){return this.get().reduce((n,i)=>n+i.qty,0)}};
