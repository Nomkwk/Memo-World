import { useEffect, useState } from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

let toasts = [];
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

function toast({ title, description, variant } = {}) {
  const id = crypto.randomUUID();

  toasts = [{ id, title, description, variant }, ...toasts].slice(0, TOAST_LIMIT);
  emit();
  window.setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY);

  return {
    id,
    dismiss: () => dismiss(id),
  };
}

function useToast() {
  const [state, setState] = useState(toasts);

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  return {
    toast,
    toasts: state,
    dismiss,
  };
}

export { toast, useToast };
