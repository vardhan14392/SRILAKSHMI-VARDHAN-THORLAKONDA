/**
 * Robust IndexedDB storage for Sree Guru Arts portfolio
 * Eliminates localStorage 5MB QuotaExceededError by using IndexedDB (hundreds of MBs capacity)
 * with graceful fallback to localStorage and in-memory cache.
 */

import { PortfolioItem } from './portfolioLogic';

const DB_NAME = 'SreeGuruArtsDB';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio_store';
const KEY_NAME = 'current_portfolio';
const FALLBACK_KEY = 'sree_guru_portfolio_v2';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

const SAMPLE_MOCK_IDS = new Set([
  'art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6', 'art-7', 'art-8', 'art-9'
]);

function cleanArtworksList(items: PortfolioItem[]): { cleaned: PortfolioItem[]; hadSamples: boolean } {
  if (!Array.isArray(items)) return { cleaned: [], hadSamples: false };
  const cleaned = items.filter((item) => {
    if (!item) return false;
    if (SAMPLE_MOCK_IDS.has(item.id)) return false;
    // Remove sample stock Unsplash items seeded by default
    if (item.image && item.image.includes('images.unsplash.com') && SAMPLE_MOCK_IDS.has(item.id)) return false;
    return true;
  });
  return { cleaned, hadSamples: cleaned.length !== items.length };
}

/**
 * Loads the saved portfolio from IndexedDB with fallback to localStorage
 */
export async function loadSavedPortfolio(
  defaultItems: PortfolioItem[]
): Promise<PortfolioItem[]> {
  const { cleaned: cleanedDefaults } = cleanArtworksList(defaultItems);

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);

      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result)) {
          const { cleaned, hadSamples } = cleanArtworksList(req.result);
          if (hadSamples) {
            saveSavedPortfolio(cleaned).catch(console.warn);
          }
          resolve(cleaned);
        } else {
          // Check localStorage migration
          try {
            const ls = localStorage.getItem(FALLBACK_KEY);
            if (ls) {
              const parsed = JSON.parse(ls);
              if (Array.isArray(parsed)) {
                const { cleaned, hadSamples } = cleanArtworksList(parsed);
                // Save sanitized list to IndexedDB
                saveSavedPortfolio(cleaned).catch(console.warn);
                resolve(cleaned);
                return;
              }
            }
          } catch {
            // ignore
          }
          resolve(cleanedDefaults);
        }
      };

      req.onerror = () => {
        resolve(cleanedDefaults);
      };
    });
  } catch {
    // Fallback if IndexedDB fails
    try {
      const ls = localStorage.getItem(FALLBACK_KEY);
      if (ls) {
        const parsed = JSON.parse(ls);
        if (Array.isArray(parsed)) {
          const { cleaned } = cleanArtworksList(parsed);
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return cleanedDefaults;
  }
}

/**
 * Saves the portfolio items to IndexedDB with safety against QuotaExceededError
 */
export async function saveSavedPortfolio(
  items: PortfolioItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(items, KEY_NAME);

      req.onsuccess = () => {
        resolve({ success: true });
      };

      req.onerror = () => {
        // Fallback attempt to localStorage with compressed data
        trySaveToLocalStorage(items);
        resolve({ success: true });
      };
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('IndexedDB save failed, attempting localStorage fallback:', errorMsg);
    const lsSaved = trySaveToLocalStorage(items);
    return { success: lsSaved, error: lsSaved ? undefined : errorMsg };
  }
}

/**
 * Clears the portfolio store back to defaults
 */
export async function clearSavedPortfolio(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY_NAME);
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(FALLBACK_KEY);
  } catch {
    // ignore
  }
}

const ARTIST_PORTRAIT_KEY = 'artist_portrait_custom';

/**
 * Loads the saved artist portrait image URL or returns default
 */
export async function loadArtistPortrait(defaultUrl: string): Promise<string> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ARTIST_PORTRAIT_KEY);
      req.onsuccess = () => {
        if (req.result && typeof req.result === 'string') {
          resolve(req.result);
        } else {
          try {
            const ls = localStorage.getItem(ARTIST_PORTRAIT_KEY);
            if (ls) return resolve(ls);
          } catch {
            // ignore
          }
          resolve(defaultUrl);
        }
      };
      req.onerror = () => resolve(defaultUrl);
    });
  } catch {
    try {
      const ls = localStorage.getItem(ARTIST_PORTRAIT_KEY);
      if (ls) return ls;
    } catch {
      // ignore
    }
    return defaultUrl;
  }
}

/**
 * Saves custom artist portrait to IndexedDB and localStorage
 */
export async function saveArtistPortrait(imageUrl: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(imageUrl, ARTIST_PORTRAIT_KEY);
      req.onsuccess = () => {
        try {
          // If not a huge data URI, also mirror to localStorage
          if (!imageUrl.startsWith('data:image/') || imageUrl.length < 150000) {
            localStorage.setItem(ARTIST_PORTRAIT_KEY, imageUrl);
          }
        } catch {
          // ignore
        }
        resolve(true);
      };
      req.onerror = () => resolve(false);
    });
  } catch {
    try {
      localStorage.setItem(ARTIST_PORTRAIT_KEY, imageUrl);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Resets custom artist portrait to default
 */
export async function resetArtistPortrait(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(ARTIST_PORTRAIT_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(ARTIST_PORTRAIT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Helper to safely save to localStorage without crashing if quota exceeded
 */
function trySaveToLocalStorage(items: PortfolioItem[]): boolean {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(items));
    return true;
  } catch (e: unknown) {
    console.warn('LocalStorage quota exceeded or unavailable:', e);
    // If it's a quota error, try stripping large data URLs for thumbnails
    try {
      const stripped = items.map((it) => ({
        ...it,
        // if image is a massive data URI > 200kb, don't crash localStorage
        image: it.image.startsWith('data:image/') && it.image.length > 200000 ? it.thumbnail : it.image,
      }));
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(stripped));
      return true;
    } catch {
      return false;
    }
  }
}
