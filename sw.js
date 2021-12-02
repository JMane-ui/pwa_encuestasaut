// imports
importScripts('js/sw-utils.js');

const STATIC_CACHE    = 'static-v1';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    //'index.html',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/sw-utils.js',
    './js/base.js',
    './img/favicon/favicon.ico',
    './img/favicon/favicon.png',
    './img/favicon/favicon-16x16.png',
    './img/favicon/favicon-32x32.png',
    './img/favicon/favicon-96x96.png',
    './img/favicon/favicon-256x256.png'
];

const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', e => {
    const cacheStatic = caches.open( STATIC_CACHE )
        .then(cache => 
            cache.addAll( APP_SHELL ))
        .catch(console.log(''))
    const cacheInmutable = caches.open( INMUTABLE_CACHE )
        .then(cache => 
            cache.addAll( APP_SHELL_INMUTABLE ))
        .catch(console.log(''))
    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );
});

self.addEventListener('activate', e => {
    const respuesta = caches.keys().then( keys => {
        keys.forEach( key => {
            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }
            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }
        });
    });
    e.waitUntil( respuesta );
});

self.addEventListener( 'fetch', e => {
    const respuesta = caches.match( e.request ).then( res => {
        if ( res ) {
            return res;
        } else {
            return fetch( e.request ).then( newRes => {
                return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );
            });
        }
    });
    e.respondWith( respuesta );
});

self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
      return;
    }
  
    var data = {};
    if (event.data) {
      data = event.data.json();
    }
    var title = data.title || "Solucionestai";
    var message = data.message || "Bienvenido. Has iniciado sesión correctamente.";
    var icon = "images/favicon.png";
  
    var notification = new self.Notification(title, {
      body: message,
      tag: 'simple-push-demo-notification',
      icon: icon
    });
  
    notification.addEventListener('click', function() {
      if (clients.openWindow) {
        clients.openWindow('https://jmane-ui.github.io/pwamodulo/dashboard.html?');
      }
    });
  });

self.addEventListener('error', function(e) {
    console.log(e.filename, e.lineno, e.colno, e.message);
  });