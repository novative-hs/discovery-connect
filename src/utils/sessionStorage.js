export const setsessionStorage = (name, items) => {
  sessionStorage.setItem(name, JSON.stringify(items));
};
export const getsessionStorage = (name) => {
  const data = sessionStorage.getItem(name);
  if (data) {
    return JSON.parse(data);
  } else {
    sessionStorage.setItem(name, JSON.stringify([]));
    return [];
  }
};
