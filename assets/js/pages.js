/* Contact form */
document.addEventListener('DOMContentLoaded',()=>{const f=$('#contactForm');if(!f)return;
f.innerHTML=`<div class="grid2">${fld('name','Your name')}${fld('email','Email','email')}${fld('subject','Subject','text','','full')}${fld('message','Message','textarea','rows="5"','full')}</div><button class="btn btn-primary">Send message</button><p class="meta" style="margin-top:.6rem">Prototype: messages are saved in this browser and shown in the admin demo.</p>`;
f.onsubmit=e=>{e.preventDefault();const v=id=>$('#'+id).value.trim();let ok=true;
ok=bad('name',v('name').length<2&&'Enter your name')&ok;ok=bad('email',!/^\S+@\S+\.\S+$/.test(v('email'))&&'Enter a valid email')&ok;ok=bad('subject',v('subject').length<3&&'Enter a subject')&ok;ok=bad('message',v('message').length<10&&'Write at least 10 characters')&ok;
if(!ok)return;if(LS.set('rt_messages',[...LS.get('rt_messages'),{id:'M'+Date.now(),name:v('name'),email:v('email'),subject:v('subject'),message:v('message'),date:new Date().toISOString()}])){f.reset();toast('Message sent. We will reply soon.')}}});
