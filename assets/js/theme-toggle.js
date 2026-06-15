/**
 * ThemeManager Module
 * Handles dark/light theme toggling with localStorage persistence.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const ThemeManager = (function () {
  const STORAGE_KEY = 'portfolio-theme';
  const DEFAULT_THEME = 'dark';
  const TOGGLE_BUTTON_ID = 'theme-toggle';

  // In-memory fallback when localStorage is unavailable (private browsing)
  let memoryTheme = null;
  let storageAvailable = true;

  /**
   * Check if localStorage is available and functional.
   * @returns {boolean}
   */
  function checkStorageAvailable() {
    try {
      const testKey = '__theme_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Read theme from storage (localStorage or memory fallback).
   * @returns {string|null}
   */
  function readTheme() {
    if (storageAvailable) {
      return localStorage.getItem(STORAGE_KEY);
    }
    return memoryTheme;
  }

  /**
   * Write theme to storage (localStorage or memory fallback).
   * @param {string} theme - 'dark' or 'light'
   */
  function writeTheme(theme) {
    if (storageAvailable) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        // If write fails, switch to memory fallback
        storageAvailable = false;
        memoryTheme = theme;
      }
    } else {
      memoryTheme = theme;
    }
  }

  /**
   * Validate a stored theme value.
   * @param {string|null} value
   * @returns {string} Valid theme ('dark' or 'light')
   */
  function validateTheme(value) {
    if (value === 'dark' || value === 'light') {
      return value;
    }
    return DEFAULT_THEME;
  }

  /**
   * Apply the theme to the document root element.
   * @param {string} theme - 'dark' or 'light'
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Update the toggle button's aria-label and icon.
   * @param {string} theme - The current active theme
   */
  function updateToggleButton(theme) {
    const btn = document.getElementById(TOGGLE_BUTTON_ID);
    if (!btn) return;

    if (theme === 'dark') {
      btn.setAttribute('aria-label', 'Switch to light mode');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-moon';
      }
    } else {
      btn.setAttribute('aria-label', 'Switch to dark mode');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-sun';
      }
    }
  }

  return {
    /**
     * Initialize the theme system.
     * Reads saved preference from localStorage, validates it,
     * and applies the theme before paint to prevent FOUC.
     */
    init: function () {
      storageAvailable = checkStorageAvailable();

      let savedTheme = readTheme();
      let theme = validateTheme(savedTheme);

      // If stored value was invalid, overwrite with default
      if (savedTheme !== null && savedTheme !== 'dark' && savedTheme !== 'light') {
        writeTheme(theme);
      }

      // If no saved preference, persist the default
      if (savedTheme === null) {
        writeTheme(theme);
      }

      applyTheme(theme);
      updateToggleButton(theme);
    },

    /**
     * Toggle between dark and light themes.
     * Persists the new theme to localStorage immediately and
     * updates the toggle button's aria-label.
     */
    toggle: function () {
      var current = this.getCurrentTheme();
      var newTheme = current === 'dark' ? 'light' : 'dark';

      applyTheme(newTheme);
      writeTheme(newTheme);
      updateToggleButton(newTheme);
    },

    /**
     * Get the currently active theme.
     * @returns {string} 'dark' or 'light'
     */
    getCurrentTheme: function () {
      var attr = document.documentElement.getAttribute('data-theme');
      return validateTheme(attr);
    }
  };
})();

// Initialize theme on script load (called from inline head script or on DOMContentLoaded)
// When loaded as a deferred/async module, attach toggle event on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  // Re-run to ensure button state is synced (button may not exist during head inline script)
  var theme = ThemeManager.getCurrentTheme();
  var btn = document.getElementById('theme-toggle');
  if (btn) {
    // Update button state
    if (theme === 'dark') {
      btn.setAttribute('aria-label', 'Switch to light mode');
      var icon = btn.querySelector('i');
      if (icon) icon.className = 'fas fa-moon';
    } else {
      btn.setAttribute('aria-label', 'Switch to dark mode');
      var icon = btn.querySelector('i');
      if (icon) icon.className = 'fas fa-sun';
    }

    // Attach click handler
    btn.addEventListener('click', function () {
      ThemeManager.toggle();
    });
  }
});
