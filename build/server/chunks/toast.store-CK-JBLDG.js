import { w as writable } from './index-5Il0_z1F.js';

function createToastStore() {
  const { subscribe, update } = writable([]);
  function add(type, message, duration = 4e3) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    update((toasts) => [...toasts, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }
  function remove(id) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }
  return {
    subscribe,
    success: (msg, duration) => add("success", msg, duration),
    error: (msg, duration) => add("error", msg, duration),
    info: (msg, duration) => add("info", msg, duration),
    pending: (msg) => add("pending", msg, 0),
    // no auto-dismiss
    remove
  };
}
createToastStore();
//# sourceMappingURL=toast.store-CK-JBLDG.js.map
