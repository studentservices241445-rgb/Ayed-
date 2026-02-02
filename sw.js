// sw.js (course)
const CACHE='ayed-step-course-v1';
const CORE=['./','./index.html','./course-content.html','./step-guide.html','./faq.html','./testimonials.html','./support.html','./register.html','./terms.html','./privacy.html','./refund.html','./404.html','./assets/styles.css','./assets/app.js','./assets/site-data.js','./assets/icon.svg','./manifest.json'];
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>k===CACHE?null:caches.delete(k)));self.clients.claim();})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith((async()=>{
    try{
      const net=await fetch(e.request);
      const c=await caches.open(CACHE); c.put(e.request, net.clone());
      return net;
    }catch(err){
      return (await caches.match(e.request)) || (await caches.match('./index.html'));
    }
  })());
});