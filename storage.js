export function readPreference(storage, key, fallback) {
  try { return JSON.parse(storage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function writePreference(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
