const CACHE = "english-course-v1";
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/dictionary",
  "/vocabulary",
  "/reading",
  "/crossword",
  "/resources",
  "/settings",
  "/level/a1",
  "/level/a2",
  "/level/b1",
  "/level/b1+",
  "/level/b2",
  "/level/b2+",
  "/manifest.json",
  "/reading/a1-my-day",
  "/reading/a1-toms-pet",
  "/reading/a1-the-park",
  "/reading/a1-my-family",
  "/reading/a1-school",
  "/reading/a1-food",
  "/reading/a2-weekend-trip",
  "/reading/a2-shopping",
  "/reading/a2-restaurant",
  "/reading/a2-weather",
  "/reading/a2-hobbies",
  "/reading/a2-city",
  "/reading/b1-travel-story",
  "/reading/b1-environment",
  "/reading/b1-job-interview",
  "/reading/b1-health",
  "/reading/b1-tech",
  "/reading/b1-culture",
  "/reading/b1p-relationships",
  "/reading/b1p-city-life",
  "/reading/b1p-traditions",
  "/reading/b1p-environment",
  "/reading/b1p-social-media",
  "/reading/b1p-learning",
  "/reading/b2-innovation",
  "/reading/b2-psychology",
  "/reading/b2-economics",
  "/reading/b2-science",
  "/reading/b2-art",
  "/reading/b2-society",
  "/reading/b2p-business",
  "/reading/b2p-politics",
  "/reading/b2p-philosophy",
  "/reading/b2p-literature",
  "/reading/b2p-persuasion",
  "/reading/b2p-leadership",
];

const CACHE_STRATEGY_URLS = [
  /\.(js|css|woff2?|svg|png|jpg|webp|avif)$/,
  /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Partial precache is acceptable
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin or known CDN requests
  const isSameOrigin = url.origin === self.location.origin;
  const isCacheable = CACHE_STRATEGY_URLS.some((r) => r.test(request.url));

  if (isSameOrigin || isCacheable) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API calls - network first
  if (url.hostname === "api.dictionaryapi.dev" || url.hostname === "images.unsplash.com") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigation requests - network first with fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await caches.match("/");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}
