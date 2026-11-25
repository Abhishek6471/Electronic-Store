/* Sample data: 24 products. Images are generated SVGs (no external dependency). */
const RT_CATS=[['smartphones','Smartphones','📱'],['laptops','Laptops','💻'],['tablets','Tablets','📲'],['monitors','Monitors','🖥️'],['audio','Audio Devices','🎧'],['gaming','Gaming','🎮'],['components','PC Components','🧩'],['cameras','Cameras','📷']].map(([id,name,icon])=>({id,name,icon}));
function rtImg(icon,hue){const s=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="hsl(${hue},35%,92%)"/><circle cx="320" cy="240" r="150" fill="hsl(${hue},40%,85%)"/><text x="320" y="300" font-size="150" text-anchor="middle">${icon}</text></svg>`;return 'data:image/svg+xml,'+encodeURIComponent(s)}
const RT_FALLBACK=rtImg('📦',210);
// [name, brand, category, price, previous, condition, location, stock, rating, sellerId, daysAgo]
const RT_RAW=[
['iPhone 13 128GB','Apple','smartphones',89000,115000,'Like New','Kathmandu',4,4.8,1,1],
['iPhone 12 64GB','Apple','smartphones',62000,82000,'Excellent','Lalitpur',3,4.6,2,3],
['iPhone 14 Pro 256GB','Apple','smartphones',142000,175000,'Like New','Kathmandu',2,4.9,1,2],
['Samsung Galaxy S22','Samsung','smartphones',58000,85000,'Good','Pokhara',5,4.4,3,5],
['Samsung Galaxy A54','Samsung','smartphones',34500,52000,'Excellent','Biratnagar',6,4.5,4,7],
['OnePlus 9 Pro','OnePlus','smartphones',47000,70000,'Good','Kathmandu',2,4.3,2,4],
['Xiaomi Redmi Note 12','Xiaomi','smartphones',19500,29000,'Refurbished','Butwal',8,4.2,5,9],
['iPad 9th Gen 64GB','Apple','tablets',38000,52000,'Excellent','Bhaktapur',3,4.7,1,6],
['HP Pavilion 15 i5 11th Gen','HP','laptops',72000,98000,'Excellent','Kathmandu',3,4.5,6,2],
['Dell Latitude 7490 i7','Dell','laptops',54000,78000,'Refurbished','Lalitpur',5,4.4,7,8],
['Lenovo ThinkPad T480','Lenovo','laptops',46000,68000,'Good','Pokhara',4,4.6,3,10],
['Asus ROG Strix G15','Asus','laptops',135000,185000,'Like New','Kathmandu',1,4.8,6,1],
['Acer Aspire 5 Ryzen 5','Acer','laptops',52000,70000,'Fair','Chitwan',2,4.0,5,12],
['Dell UltraSharp 27" 4K','Dell','monitors',32000,48000,'Excellent','Kathmandu',2,4.6,7,5],
['Samsung Odyssey 144Hz 24"','Samsung','monitors',21000,32000,'Good','Lalitpur',3,4.3,4,6],
['Sony WH-1000XM4','Sony','audio',24500,42000,'Like New','Kathmandu',3,4.9,2,2],
['JBL Flip 6 Speaker','JBL','audio',9800,17500,'Excellent','Pokhara',6,4.5,3,4],
['Apple AirPods Pro 2','Apple','audio',21000,34000,'Like New','Bhaktapur',4,4.7,1,3],
['Logitech G Pro Mechanical Keyboard','Logitech','gaming',8500,16000,'Good','Kathmandu',5,4.4,6,7],
['Logitech G502 Gaming Mouse','Logitech','gaming',4200,8500,'Excellent','Butwal',7,4.6,5,11],
['Sony PlayStation 5 Disc','Sony','gaming',78000,98000,'Excellent','Kathmandu',2,4.8,2,1],
['NVIDIA GTX 1660 Super 6GB','Asus','components',19500,32000,'Good','Lalitpur',3,4.3,7,9],
['NVIDIA RTX 3060 12GB','Asus','components',42000,65000,'Excellent','Kathmandu',2,4.7,6,3],
['Sony Alpha A6000 Mirrorless','Sony','cameras',52000,78000,'Good','Pokhara',2,4.6,3,5]];
const RT_PRODUCTS=RT_RAW.map((r,i)=>{const [name,brand,category,price,prev,condition,location,stock,rating,sellerId,days]=r;const c=RT_CATS.find(x=>x.id===category);
return{id:'p'+(i+1),name,brand,category,price,previousPrice:prev,condition,location,stock,rating,sellerId,daysAgo:days,
description:`${name} in ${condition.toLowerCase()} condition. Tested and checked by the seller before listing.`,
specs:{Brand:brand,Condition:condition,Category:c.name},warranty:condition==='Refurbished'?'6 months seller warranty':'3 months seller warranty',
image:'assets/images/p'+(i+1)+'.jpg',fallbackImage:rtImg(c.icon,(i*37)%360),verifiedSeller:sellerId%3!==0}});
