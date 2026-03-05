self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const title = data.title || "Atualização do seu pedido!";
        const options = {
            body: data.body || "Acesse o app para ver os detalhes.",
            icon: "/icon512_maskable.png", // Seu icone de app atual
            badge: "/icon512_maskable.png",
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: data.url || "/", // Para abrir ao clicar
        };

        const promiseChain = self.registration.showNotification(title, options);
        event.waitUntil(promiseChain);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = new URL(event.notification.data, self.location.origin).href;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            return matchingClient.focus();
        } else {
            return clients.openWindow(urlToOpen);
        }
    });

    event.waitUntil(promiseChain);
});
