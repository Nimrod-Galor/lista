// This code executes in its own worker or thread
self.addEventListener("install", event => {
   console.log("Service worker installed");
   if (caches) {
      try{
         
         const urlsToCache = [
            "/",
            "/scripts/lista.js",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js",
            "/apple-touch-icon.png",
            "/favicon-32x32.png",
            "/favicon-16x16.png",
            "/lista.webmanifest",
            "/safari-pinned-tab.svg",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
            "/styles/themea.css" ]
         
         let cacheUrls = async () => {
            const cache = await caches.open("lista-pwa-assets")
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

 self.addEventListener("activate", event => {
   console.log("Service worker activated")
})
 