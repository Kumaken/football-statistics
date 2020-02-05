// Main Logic:
        // Periksa service worker
        if (!('serviceWorker' in navigator)) {
            console.log("Service worker tidak didukung browser ini.");
        } else {
            registerServiceWorker();
        }

        // Periksa fitur Notification API
        if ("Notification" in window) {
            requestPermission();
        } else {
            console.error("Browser tidak mendukung notifikasi.");
        }

      // Utility Function Declarations
        // Register service worker
        function registerServiceWorker() {
            return navigator.serviceWorker.register('service-worker.js')
                .then(function (registration) {
                console.log('Registrasi service worker berhasil.');
                return registration;
            })
                .catch(function (err) {
                console.error('Registrasi service worker gagal.', err);
            });
        }


      // Meminta ijin menggunakan Notification API
      function requestPermission() {
            Notification.requestPermission().then(function (result) {
              if (result === "denied") {
                console.log("Fitur notifikasi tidak diijinkan.");
                return;
              } else if (result === "default") {
                console.error("Pengguna menutup kotak dialog permintaan ijin.");
                return;
              }

              // When using your VAPID key in your web app, you'll need to convert the URL safe base64 string to a Uint8Array to pass into the subscribe call, which you can do like so:
              const vapidPublicKey = vapidKeys.publicKey;
              const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

              if (('PushManager' in window)) {
                  navigator.serviceWorker.getRegistration().then(function(registration) {
                      registration.pushManager.subscribe({
                          userVisibleOnly: true,
                          applicationServerKey: convertedVapidKey
                      }).then(function(subscribe) {
                          console.log('Berhasil melakukan subscribe dengan endpoint: ', subscribe.endpoint);
                          console.log('Berhasil melakukan subscribe dengan p256dh key: ', btoa(String.fromCharCode.apply(
                              null, new Uint8Array(subscribe.getKey('p256dh')))));
                          console.log('Berhasil melakukan subscribe dengan auth key: ', btoa(String.fromCharCode.apply(
                              null, new Uint8Array(subscribe.getKey('auth')))));
                      }).catch(function(e) {
                          console.error('Tidak dapat melakukan subscribe ', e.message);
                      });
                  });
              }
            });
      }

      function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      // Preloader logic
      window.onload = function(){ document.getElementById("loadingCircle").style.display = "none" };
