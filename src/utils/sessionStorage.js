export const setsessionStorage = (name, items) => {
if (typeof window !== "undefined") {
    window.sessionStorage.setItem(name, JSON.stringify(items));
  }
};
export const getsessionStorage = (name) => {
  if (typeof window === "undefined") return [];
  const data = window.sessionStorage.getItem(name);
  if (data) return JSON.parse(data);
  window.sessionStorage.setItem(name, JSON.stringify([]));
  return [];
};
export const setLocalStorage = (key, value) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getLocalStorage = (key) => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};
