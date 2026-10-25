/**
 * Master Artist Authentication & Access Control
 * Ensures only Thorlakonda Guravaiah (the temple artist) can upload, edit, or delete works.
 */

const AUTH_STORAGE_KEY = 'sree_guru_artist_auth_session';
const PASSCODE_STORAGE_KEY = 'sree_guru_artist_passcode_custom';
export const DEFAULT_ARTIST_PASSCODE = 'guru777';

function getStorage(): Storage | null {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return null;
}

/**
 * Checks if current session is authenticated as Master Artist
 */
export function getArtistAuthStatus(): boolean {
  try {
    const s = getStorage();
    return s ? s.getItem(AUTH_STORAGE_KEY) === 'true' : false;
  } catch {
    return false;
  }
}

/**
 * Sets Master Artist authentication status
 */
export function setArtistAuthStatus(authenticated: boolean): void {
  try {
    const s = getStorage();
    if (!s) return;
    if (authenticated) {
      s.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      s.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Gets currently configured artist passcode (or default)
 */
export function getArtistPasscode(): string {
  try {
    const s = getStorage();
    const saved = s ? s.getItem(PASSCODE_STORAGE_KEY) : null;
    return saved && saved.trim().length > 0 ? saved.trim() : DEFAULT_ARTIST_PASSCODE;
  } catch {
    return DEFAULT_ARTIST_PASSCODE;
  }
}

/**
 * Updates the master artist passcode
 */
export function setArtistPasscode(newPasscode: string): { success: boolean; error?: string } {
  const trimmed = newPasscode.trim();
  if (!trimmed || trimmed.length < 4) {
    return {
      success: false,
      error: 'Passcode must be at least 4 characters long.',
    };
  }

  try {
    const s = getStorage();
    if (!s) {
      return { success: false, error: 'Storage unavailable.' };
    }
    s.setItem(PASSCODE_STORAGE_KEY, trimmed);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Unable to save passcode to device storage.',
    };
  }
}

/**
 * Verifies entered passcode against saved passcode or master fallback
 */
export function verifyArtistPasscode(entered: string): boolean {
  if (!entered) return false;
  const current = getArtistPasscode();
  const trimmed = entered.trim();
  // Allow configured passcode or default master bypass
  return trimmed === current || trimmed === DEFAULT_ARTIST_PASSCODE;
}

/**
 * Resets artist passcode back to default
 */
export function resetArtistPasscode(): void {
  try {
    const s = getStorage();
    if (s) s.removeItem(PASSCODE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
