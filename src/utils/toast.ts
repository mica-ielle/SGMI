// Utilitaire simple pour les notifications toast

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

class ToastManager {
  private toasts: Map<string, HTMLElement> = new Map();

  private createToastElement(message: string, type: ToastType): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `
      fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm
      transform transition-all duration-300 ease-in-out
      ${this.getTypeClasses(type)}
    `.trim();
    
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">${this.getIcon(type)}</div>
        <div class="flex-1 text-sm font-medium">${message}</div>
        <button class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    return toast;
  }

  private getTypeClasses(type: ToastType): string {
    const classes = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };
    return classes[type];
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type];
  }

  private show(message: string, type: ToastType, duration: number = 4000): void {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = this.createToastElement(message, type);
    
    // Ajouter l'événement de fermeture
    const closeButton = toast.querySelector('button');
    closeButton?.addEventListener('click', () => this.remove(id));

    // Positionner le toast
    this.updatePositions();
    document.body.appendChild(toast);
    this.toasts.set(id, toast);

    // Animation d'entrée
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    // Auto-remove
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  private remove(id: string): void {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toasts.delete(id);
        this.updatePositions();
      }, 300);
    }
  }

  private updatePositions(): void {
    let offset = 16;
    this.toasts.forEach(toast => {
      toast.style.top = `${offset}px`;
      offset += toast.offsetHeight + 8;
    });
  }

  success(message: string, options?: ToastOptions): void {
    this.show(message, 'success', options?.duration);
  }

  error(message: string, options?: ToastOptions): void {
    this.show(message, 'error', options?.duration);
  }

  info(message: string, options?: ToastOptions): void {
    this.show(message, 'info', options?.duration);
  }

  warning(message: string, options?: ToastOptions): void {
    this.show(message, 'warning', options?.duration);
  }
}

export const toast = new ToastManager();