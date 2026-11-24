'use strict';
const scope = new URL(self.registration.scope);
const prefix = 'zns-demo-pwa:' + scope.pathname + ':';
const cacheName = prefix + '2026-11-24-v4';
const index = new URL('index.html', scope).href;
const assets = [
  'index.html', 'install.js', 'assets/studio-logo.png', 'manifest.webmanifest', 'icons/apple-touch-icon.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
].map(path => new URL(path, scope).href);
const permitted = new Set(assets);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(assets.map(url => new Request(url, {cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const oldRelease = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\d{4}-\\d{2}-\\d{2}-v\\d+$');
    await Promise.all((await caches.keys()).filter(key => oldRelease.test(key) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin) return;
  const page = request.mode === 'navigate' && (url.pathname === scope.pathname ||
    url.pathname === new URL(index).pathname);
  if (page) {
    event.respondWith((async () => {
      // The cached HTML and assets are the same verified release.
      const cached = await (await caches.open(cacheName)).match(index);
      return cached || fetch(request);
    })());
    return;
  }
  if (!permitted.has(url.href)) return;
  event.respondWith((async () => (await (await caches.open(cacheName)).match(url.href)) ||
    fetch(request))());
});
