import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'pending';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, 0 = no auto-dismiss
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function add(type: ToastType, message: string, duration = 4000): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    update(toasts => [...toasts, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }

  function remove(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    success: (msg: string, duration?: number) => add('success', msg, duration),
    error:   (msg: string, duration?: number) => add('error',   msg, duration),
    info:    (msg: string, duration?: number) => add('info',    msg, duration),
    pending: (msg: string) => add('pending', msg, 0), // no auto-dismiss
    remove,
  };
}

export const toastStore = createToastStore();
