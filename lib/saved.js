// lib/saved.js

// LocalStorage key
const KEY = "savedProjects";
const COUNT_KEY = "saveCounts";

// Load saved list
export function getSaved() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function isSaved(id) {
  return getSaved().includes(id);
}

// Load save counts
export function getSaveCounts() {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem(COUNT_KEY) || "{}");
}

export function toggleSave(id) {
  if (typeof window === "undefined") return false;

  let saved = getSaved();
  let counts = getSaveCounts();

  let isNowSaved = false;

  if (saved.includes(id)) {
    // Remove from saved
    saved = saved.filter((x) => x !== id);
    counts[id] = Math.max((counts[id] || 1) - 1, 0);
  } else {
    // Add to saved
    saved.push(id);
    counts[id] = (counts[id] || 0) + 1;
    isNowSaved = true;
  }

  localStorage.setItem(KEY, JSON.stringify(saved));
  localStorage.setItem(COUNT_KEY, JSON.stringify(counts));

  return isNowSaved;
}
