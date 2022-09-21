var CACHE_STATIC_NAME = 'static-v4';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
self.addEventListener("install", function (evt) {
  console.log("[Service Worker] Installing service worker ...", evt);
  evt.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[service worker] pre caching shell");
      cache.addAll([
        "/",
        "/index.html",
        "/styles.css",
        "/runtime.js",
        "/polyfills.js",
        "/vendor.js",        
      ]);
      //   cache.add("/");
      //   cache.add("/index.html");
      //   cache.add("/src/js/app.js");
    })
  );
});

self.addEventListener("activate", function (evt) {
  console.log("[Service Worker] Activating service worker ...", evt);
  evt.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[service worker removeing all cache");
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
  // console.log('[server worker] fetch event triggered ', evt);
  //   evt.respondWith(fetch(evt.request));
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(evt.request)
          .then(function (res) {
            return caches.open("dynamic").then(function (cache) {
              cache.put(evt.request.url, res.clone());
              return res;
            });
          })
          .catch(function (error) {});
      }
    })
  );
});
