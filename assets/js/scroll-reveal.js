/* ==========================================================================
   ScrollReveal Module - General scroll-triggered reveal animations
   ==========================================================================
   Requirements: 8.1, 8.2, 8.3, 8.4, 8.5

   Uses Intersection Observer (threshold 0.2) to detect elements with
   [data-reveal] entering the viewport and applies a fade-in + slide-up
   animation (600ms ease-out). Staggers sibling elements by 150ms.
   Animation fires once per element (no re-trigger on scroll up).
   Respects prefers-reduced-motion for accessibility.

   Note: Timeline items (.timeline__item[data-reveal]) are handled by
   timeline.js and are excluded from this module to avoid conflicts.
   ========================================================================== */

var ScrollReveal = {
  observer: null,

  /**
   * Initialize the ScrollReveal module.
   * Creates an IntersectionObserver and observes all [data-reveal] elements
   * that are not already handled by other modules (e.g., timeline.js).
   *
   * If prefers-reduced-motion is enabled, all elements are shown immediately.
   * If IntersectionObserver is not supported, elements are shown immediately.
   */
  init: function () {
    // Req 8.5: If prefers-reduced-motion is enabled, show all content immediately
    if (this.respectsMotion()) {
      this.revealAll();
      return;
    }

    // Fallback: if IntersectionObserver is not supported, show all immediately
    if (!('IntersectionObserver' in window)) {
      this.revealAll();
      return;
    }

    // Create the observer
    var self = this;
    this.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          self.reveal(entry);
          self.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    // Select all [data-reveal] elements except timeline items
    // (timeline.js handles .timeline__item[data-reveal] with its own logic)
    var elements = document.querySelectorAll('[data-reveal]:not(.timeline__item)');
    this.observe(elements);
  },

  /**
   * Register a NodeList of elements for observation.
   * @param {NodeList} elements - Elements to observe
   */
  observe: function (elements) {
    var self = this;
    elements.forEach(function (el) {
      self.observer.observe(el);
    });
  },

  /**
   * Apply reveal animation to an element with stagger delay.
   * Calculates the sibling index among [data-reveal] elements sharing
   * the same parent to apply a 150ms stagger between consecutive items.
   *
   * @param {IntersectionObserverEntry} entry - The observer entry
   */
  reveal: function (entry) {
    var el = entry.target;
    var delay = this.getStaggerDelay(el);

    if (delay > 0) {
      setTimeout(function () {
        el.classList.add('revealed');
      }, delay);
    } else {
      el.classList.add('revealed');
    }
  },

  /**
   * Calculate stagger delay based on sibling position.
   * Finds all [data-reveal] siblings within the same parent and
   * returns index * 150ms delay.
   *
   * @param {Element} el - The element being revealed
   * @returns {number} Delay in milliseconds
   */
  getStaggerDelay: function (el) {
    var parent = el.parentElement;
    if (!parent) return 0;

    // Get all data-reveal siblings (excluding timeline items)
    var siblings = parent.querySelectorAll(':scope > [data-reveal]:not(.timeline__item)');
    if (siblings.length <= 1) return 0;

    // Find the index of this element among its siblings
    var index = 0;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i] === el) {
        index = i;
        break;
      }
    }

    return index * 150;
  },

  /**
   * Check if the user prefers reduced motion.
   * Req 8.5: If enabled, skip all scroll reveal animations.
   *
   * @returns {boolean} True if reduced motion is preferred
   */
  respectsMotion: function () {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return motionQuery.matches;
  },

  /**
   * Immediately reveal all [data-reveal] elements (fallback/accessibility).
   * Used when IntersectionObserver is unavailable or reduced motion is preferred.
   */
  revealAll: function () {
    var elements = document.querySelectorAll('[data-reveal]:not(.timeline__item)');
    elements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  ScrollReveal.init();
});
