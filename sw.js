const CACHE="miranda-v12";
const ASSETS=[
  "./","./index.html","./archivo.html","./404.html","./manifest.json",
  "./css/style.css","./css/extras.css","./css/special.css","./css/ultimate.css","./css/planner.css","./css/chapters.css","./css/microdetails.css","./css/features.css","./css/hints.css","./css/expansion.css","./css/gameplus.css","./css/personalize.css",
  "./js/app.js","./js/extras.js","./js/special.js","./js/ultimate.js","./js/planner.js","./js/chapters.js","./js/microdetails.js","./js/features.js","./js/hints.js","./js/expansion.js","./js/gameplus.js","./js/photo-sprite-1.js","./js/photo-sprite-2.js","./js/photo-sprite-3.js","./js/photo-sprite-4.js","./js/photo-sprite-5.js","./js/personalize.js","./assets/favicon.svg"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
      return response;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match("./404.html")))
  );
});