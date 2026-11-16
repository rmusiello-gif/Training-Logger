/* Training Logger — network first, cache as fallback. Online it always loads the live build,
   so an update can never be hidden by the cache; offline it opens the last copy it saw. */
var C="logger-v1";
self.addEventListener("install",function(e){self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url);if(u.origin!==location.origin)return;
 var key=u.origin+u.pathname;
 e.respondWith(fetch(r).then(function(res){
  if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(key,cp);});}
  return res;
 }).catch(function(){return caches.match(key).then(function(m){return m||caches.match(u.origin+u.pathname.replace(/[^/]*$/,""));});}));
});
