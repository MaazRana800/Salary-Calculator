/**
 * storage.js — localStorage read/write/delete layer
 * ONLY this file touches localStorage
 */

const STORAGE_KEYS = {
  saved:    "eu_calc_saved",
  settings: "eu_calc_settings",
  lastInput:"eu_calc_last_input"
};

/* ── SAVED COMPARISONS ──────────────────────────────────── */

function getSavedComparisons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.saved);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveComparison(name, salary, currency, type, period, selectedKeys, results) {
  const saved = getSavedComparisons();
  const item = {
    id:        Date.now(),
    name:      name.trim() || "Comparison " + (saved.length + 1),
    salary,
    currency,
    type,
    period,
    selectedKeys,
    results,
    date:      new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
  };
  saved.unshift(item); // newest first
  try {
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
    return item;
  } catch { return null; }
}

function deleteComparison(id) {
  const saved = getSavedComparisons().filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
    return true;
  } catch { return false; }
}

function clearAllComparisons() {
  localStorage.removeItem(STORAGE_KEYS.saved);
}

/* ── SETTINGS ───────────────────────────────────────────── */

function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? JSON.parse(raw) : { currency: "EUR", type: "employee", period: "annual" };
  } catch { return { currency: "EUR", type: "employee", period: "annual" }; }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {}
}

/* ── LAST INPUT ─────────────────────────────────────────── */

function getLastInput() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.lastInput);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLastInput(salary, selectedKeys) {
  try {
    localStorage.setItem(STORAGE_KEYS.lastInput, JSON.stringify({ salary, selectedKeys }));
  } catch {}
}
