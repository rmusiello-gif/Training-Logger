/* Training Logger — network first, cache as fallback.
   Online it always loads the live build, so an update can never be hidden by the cache.
   If the network fails, or has not answered within WAIT ms (bad signal at the gym),
   it opens the last copy it saw. Your logged data lives on the phone and is never touched here. */
var C="logger-v2", WAIT=4000;
self.addEventListener("install",function(e){self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function fromCache(key,u){
 return caches.match(key).then(function(m){return m||caches.match(u.origin+u.pathname.replace(/[^/]*$/,""));});
}
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url);if(u.origin!==location.origin)return;
 var key=u.origin+u.pathname;
 e.respondWith(new Promise(function(resolve,reject){
  var settled=false;
  var timer=setTimeout(function(){
   fromCache(key,u).then(function(m){if(m&&!settled){settled=true;resolve(m);}});
  },WAIT);
  fetch(r).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(key,cp);});}
   if(!settled){settled=true;clearTimeout(timer);resolve(res);}
  }).catch(function(err){
   clearTimeout(timer);
   fromCache(key,u).then(function(m){if(settled)return;settled=true;if(m)resolve(m);else reject(err);});
  });
 }));
});
