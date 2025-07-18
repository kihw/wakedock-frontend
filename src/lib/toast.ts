/**
 * Système de toast pour les notifications
 */

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  title?: string;
  description?: string;
}

class ToastManager {
  private toasts: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof window === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
    document.body.appendChild(this.container);
  }

  private show(message: string, options: ToastOptions = {}) {
    if (!this.container) return;

    const {
      type = 'info',
      duration = 5000,
      title,
      description
    } = options;

    const id = Math.random().toString(36).substring(2, 9);
    const toast = document.createElement('div');
    
    // Styles de base
    toast.className = `
      max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5
      transform transition-all duration-300 ease-out translate-x-full opacity-0
    `;

    // Couleurs selon le type
    const colors = {
      success: 'border-l-4 border-green-500',
      error: 'border-l-4 border-red-500',
      warning: 'border-l-4 border-yellow-500',
      info: 'border-l-4 border-blue-500'
    };

    toast.className += ` ${colors[type]}`;

    // Icônes selon le type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    // Contenu du toast
    toast.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-lg">${icons[type]}</span>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            ${title ? `<p class="text-sm font-medium text-gray-900">${title}</p>` : ''}
            <p class="text-sm text-gray-500">${description || message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Bouton de fermeture
    const closeButton = toast.querySelector('button');
    closeButton?.addEventListener('click', () => {
      this.hide(id);
    });

    // Ajouter au container
    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Animation d'entrée
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    // Auto-fermeture
    if (duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    return id;
  }

  private hide(id: string) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    // Animation de sortie
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-full', 'opacity-0');

    // Suppression après animation
    setTimeout(() => {
      toast.remove();
      this.toasts.delete(id);
    }, 300);
  }

  success(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'error' });
  }

  warning(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }

  info(message: string, options: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  // Méthodes pour compatibilité
  show(message: string, options: ToastOptions = {}) {
    return this.show(message, options);
  }

  dismiss(id: string) {
    return this.hide(id);
  }

  clear() {
    this.toasts.forEach((_, id) => {
      this.hide(id);
    });
  }
}

// Instance singleton
const toastManager = new ToastManager();

// Export des fonctions utilitaires
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    toastManager.success(message, options),
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    toastManager.error(message, options),
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    toastManager.warning(message, options),
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    toastManager.info(message, options),
  show: (message: string, options?: ToastOptions) => 
    toastManager.show(message, options),
  dismiss: (id: string) => toastManager.dismiss(id),
  clear: () => toastManager.clear(),
};

export default toast;