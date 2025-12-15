/**
 * Service Worker Registration for PWA
 * Handles installation, updates, and offline functionality
 */

export function registerSW() {
    if ('serviceWorker' in navigator) {
        // Register service worker after page load
        window.addEventListener('load', async () => {
            try {
                // Check if running in development mode
                const isDev = import.meta.env.DEV;

                if (isDev) {
                    console.log('🔧 Development mode: Service Worker enabled for testing');
                }

                const registration = await navigator.serviceWorker.register(
                    import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw',
                    { type: import.meta.env.MODE === 'production' ? 'classic' : 'module' }
                );

                console.log('✅ Service Worker registered successfully:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Check every hour

                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('🔄 New version available! Please refresh.');

                            // Show update notification to user
                            if (confirm('A new version is available. Reload to update?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });

                // Handle controller change (new SW activated)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 Service Worker updated. Reloading page...');
                    window.location.reload();
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        });

        // Handle offline/online status
        window.addEventListener('online', () => {
            console.log('🌐 Back online');
            // You can show a toast notification here
        });

        window.addEventListener('offline', () => {
            console.log('📴 You are offline. Some features may be limited.');
            // You can show a toast notification here
        });
    } else {
        console.warn('⚠️ Service Workers are not supported in this browser');
    }
}
