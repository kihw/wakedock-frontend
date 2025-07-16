/**
 * Composant d'installation PWA pour WakeDock
 * Gère l'installation, les mises à jour et la détection des fonctionnalités PWA
 */

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

interface PWAInstallProps {
  className?: string;
}

export const PWAInstall: React.FC<PWAInstallProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Détection du type d'appareil
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    // Vérifier si déjà installé
    const checkIfInstalled = () => {
      // PWA installée si en mode standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Ou si c'est une webapp
      const isWebapp = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || isWebapp);
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Afficher le banner d'installation après 30 secondes si pas encore installé
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true);
        }
      }, 30000);
    };

    // Écouter l'installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    // Détecter le statut online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker pour détecter les mises à jour
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erreur Service Worker:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Erreur installation PWA:', error);
    }
  };

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const InstallButton = () => (
    <button
      onClick={handleInstallClick}
      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
    >
      <Download className="w-4 h-4" />
      <span>Installer l'app</span>
    </button>
  );

  const UpdateButton = () => (
    <button
      onClick={handleUpdateClick}
      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Mettre à jour</span>
    </button>
  );

  const InstallBanner = () => (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {deviceType === 'mobile' ? (
            <Smartphone className="w-6 h-6 mt-0.5 flex-shrink-0" />
          ) : (
            <Monitor className="w-6 h-6 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-semibold text-sm">Installer WakeDock</h3>
            <p className="text-xs opacity-90 mt-1">
              {deviceType === 'mobile' 
                ? 'Ajoutez WakeDock à votre écran d\'accueil pour un accès rapide'
                : 'Installez WakeDock comme application de bureau'
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="ml-2 p-1 hover:bg-blue-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setShowInstallBanner(false)}
          className="text-xs opacity-75 hover:opacity-100"
        >
          Plus tard
        </button>
        <button
          onClick={handleInstallClick}
          className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Installer
        </button>
      </div>
    </div>
  );

  const OfflineIndicator = () => (
    <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">Mode hors ligne</span>
    </div>
  );

  const OnlineIndicator = () => (
    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
      <Wifi className="w-4 h-4" />
      <span className="text-sm">En ligne</span>
    </div>
  );

  return (
    <div className={className}>
      {/* Indicateur de connexion */}
      <div className="flex items-center justify-between">
        {isOnline ? <OnlineIndicator /> : <OfflineIndicator />}
        
        <div className="flex items-center space-x-2">
          {/* Bouton de mise à jour */}
          {updateAvailable && <UpdateButton />}
          
          {/* Bouton d'installation */}
          {isInstallable && !isInstalled && <InstallButton />}
          
          {/* Indicateur d'installation */}
          {isInstalled && (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <Download className="w-4 h-4" />
              <span className="text-sm">Installé</span>
            </div>
          )}
        </div>
      </div>

      {/* Banner d'installation */}
      {showInstallBanner && !isInstalled && <InstallBanner />}
    </div>
  );
};

// Hook pour les fonctionnalités PWA
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Statut online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Statut d'installation
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isWebapp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isWebapp);

    // Possibilité d'installation
    const handleBeforeInstallPrompt = () => setCanInstall(true);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return {
    isOnline,
    isInstalled,
    canInstall,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsNotifications: 'Notification' in window,
    supportsPush: 'PushManager' in window
  };
}

// Composant pour affichage conditionnel selon les capacités PWA
interface PWAFeatureProps {
  feature: 'serviceWorker' | 'notifications' | 'push' | 'installed' | 'online';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PWAFeature: React.FC<PWAFeatureProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  const pwa = usePWA();
  
  const isSupported = (() => {
    switch (feature) {
      case 'serviceWorker': return pwa.supportsServiceWorker;
      case 'notifications': return pwa.supportsNotifications;
      case 'push': return pwa.supportsPush;
      case 'installed': return pwa.isInstalled;
      case 'online': return pwa.isOnline;
      default: return false;
    }
  })();

  return isSupported ? <>{children}</> : <>{fallback}</>;
};

export default PWAInstall;
