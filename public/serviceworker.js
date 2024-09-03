// This code executes in its own worker or thread
self.addEventListener("install", event => {
   console.log("Service worker installed");
   if (caches) {
      try{
         const urlsToCache = [
            "/",
            "/login",
            "/styles/themea.css",
            "/scripts/lista.js",
            "/apple-touch-icon.png",
            "/favicon-32x32.png",
            "/favicon-16x16.png",
            "/lista.webmanifest",
            "/safari-pinned-tab.svg",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"]

         let cacheUrls = async () => {
            const cache = await caches.open("lista-pwa")
            return cache.addAll(urlsToCache)
         }
         event.waitUntil(cacheUrls())

      } catch (error) {
         console.error("Error while caching multiple files. " + error.message);
      }
   } else {
      console.error("Cache Storage not available")
   }
})

// network first
self.addEventListener("fetch", event => {
   console.log("Handling fetch event for", event.request.url);
   // Let the browser do its default thing
   // for non-GET requests.
   if (event.request.method !== "GET" || event.request.url.indexOf('?') > -1){
      console.log(event.request.url)
      return
   } 

   event.respondWith(
      fetch(event.request)
      .then(response => {
         
            // update the cache with a clone of the network response
            const responseClone = response.clone();

            caches.open('lista-pwa').then(cache => {
               cache.put(event.request, responseClone)
            })
         
         return response
      }).catch(error => {
         return caches.match(event.request)
      })
   )
})

 
// Stale while revalidate
// self.addEventListener('fetch', event => {
//    event.respondWith(
//      caches.match(event.request).then(cachedResponse => {
//          const networkFetch = fetch(event.request).then(response => {
// //            // update the cache with a clone of the network response
//             const responseClone = response.clone();

//             caches.open('lista-pwa').then(cache => {
//                cache.put(event.request, responseClone)
//             })
//             return response
//          }).catch(function (reason) {
//            console.error('ServiceWorker fetch failed: ', reason)
//          })
// //          // prioritize cached response over network
//          return cachedResponse || networkFetch
//       })
//    )
//  })



 



 self.addEventListener("activate", event => {
   console.log("Service worker activated")
})
 