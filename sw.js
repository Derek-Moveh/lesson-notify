self.addEventListener('install', (e) => {
  console.log('Service Worker installed successfully.');
});

self.addEventListener('fetch', (e) => {
  // Default fetch handler
}); 