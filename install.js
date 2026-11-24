'use strict';
if ('serviceWorker' in navigator && window.isSecureContext) {
  // Relative scope works both at username.github.io and a project subpath.
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).catch(() => {
    // Online demo still works if offline installation is unavailable.
  });
}
