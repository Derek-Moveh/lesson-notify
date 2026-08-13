// Handles turning on push notifications for the logged-in user.
// Call enablePushNotifications() from a button click — browsers require
// a real user gesture before they'll show the permission prompt.

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function enablePushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported in this browser.');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Notifications were not enabled. You can turn them on later from your browser settings.');
            return false;
        }

        const registration = await navigator.serviceWorker.ready;

        const keyResponse = await authFetch('/api/push/vapid-public-key');
        if (!keyResponse.ok) {
            alert('Push notifications are not configured on this server yet.');
            return false;
        }
        const { publicKey } = await keyResponse.json();

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
        }

        const subJson = subscription.toJSON();
        await authFetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys })
        });

        return true;
    } catch (err) {
        console.error('Failed to enable push notifications:', err);
        alert('Something went wrong turning on notifications. Please try again.');
        return false;
    }
}

async function refreshPushButtonState() {
    const btn = document.getElementById('pushToggleBtn');
    if (!btn) return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        btn.textContent = '🔕 Notifications not supported';
        btn.disabled = true;
        return;
    }

    if (Notification.permission === 'denied') {
        btn.textContent = '🔕 Notifications blocked in browser';
        btn.disabled = true;
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        btn.textContent = subscription ? '🔔 Notifications enabled' : '🔕 Enable notifications';
    } catch (err) {
        btn.textContent = '🔕 Enable notifications';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('pushToggleBtn');
    if (btn) {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Enabling...';
            await enablePushNotifications();
            btn.disabled = false;
            refreshPushButtonState();
        });
        refreshPushButtonState();
    }
});