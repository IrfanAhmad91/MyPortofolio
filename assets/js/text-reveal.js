/* ==========================================================================
   TextReveal Module - Scroll-triggered word-by-word text animation
   ==========================================================================
   Requirements: 6.1, 6.2, 6.3, 6.4, 6.5

   Queries all [data-text-reveal] elements, splits their text content into
   individual <span> wrapped words, and reveals them sequentially when the
   element enters the viewport (20% threshold).

   Each word transitions over 400ms, staggered by 50ms between words.
   Total animation duration is capped at 3000ms (words beyond the cap
   animate together with the final group).

   One-shot: once revealed, the element is unobserved.
   Respects prefers-reduced-motion for accessibility.
   ========================================================================== */

var TextReveal = {
  elements: [],
  observer: null,

  /**
   * Initialize the TextReveal module.
   * Queries all [data-text-reveal] elements, splits words, and observes them.
   * If reduced-motion is preferred or IntersectionObserver is unavailable,
   * all words are shown immediately at full opacity.
   */
  init: function () {
    this.elements = document.querySelectorAll('[data-text-reveal]');
    if (!this.elements.length) return;

    // Split words for all elements
    var self = this;
    this.elements.forEach(function (el) {
      self.splitWords(el);
    });

    // Reduced-motion: show all words immediately
    if (this.prefersReducedMotion()) {
      this.elements.forEach(function (el) {
        self.showAllWords(el);
      });
      return;
    }

    // Fallback: if IntersectionObserver is not supported, show all immediately
    if (!('IntersectionObserver' in window)) {
      this.elements.forEach(function (el) {
        self.showAllWords(el);
      });
      return;
    }

    // Create IntersectionObserver at 20% threshold
    this.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          self.reveal(entry.target);
          self.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    // Observe each element
    this.elements.forEach(function (el) {
      self.observer.observe(el);
    });
  },

  /**
   * Split the text content of an element into <span> wrapped words.
   * Each word gets the class "word-reveal" and starts hidden
   * (opacity: 0, translateY: 10px).
   *
   * @param {Element} el - The element whose text to split
   */
  splitWords: function (el) {
    var text = el.textContent.trim();
    // Split on whitespace, filter out empty strings
    var words = text.split(/\s+/).filter(function (word) {
      return word.length > 0;
    });

    // Clear the element
    el.textContent = '';

    words.forEach(function (word, index) {
      var span = document.createElement('span');
      span.className = 'word-reveal';
      span.textContent = word;
      span.style.opacity = '0';
      span.style.transform = 'translateY(10px)';
      span.style.display = 'inline-block';
      span.style.transition = 'opacity 400ms ease, transform 400ms ease';

      el.appendChild(span);

      // Add a space between words (except after the last word)
      if (index < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
  },

  /**
   * Reveal words sequentially with staggered timing.
   * Each word is staggered by 50ms. Total animation is capped at 3000ms,
   * so words beyond the cap animate together with the final group.
   *
   * @param {Element} el - The element to reveal
   */
  reveal: function (el) {
    var words = el.querySelectorAll('.word-reveal');
    var staggerDelay = 50; // ms between each word
    var maxDuration = 3000; // ms cap for total animation
    var transitionDuration = 400; // ms per word transition

    // Maximum delay before the last word should start
    // (so that lastWord start + transitionDuration <= maxDuration)
    var maxStartDelay = maxDuration - transitionDuration;

    words.forEach(function (word, index) {
      var delay = index * staggerDelay;

      // Cap the delay so total duration doesn't exceed 3000ms
      if (delay > maxStartDelay) {
        delay = maxStartDelay;
      }

      setTimeout(function () {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      }, delay);
    });
  },

  /**
   * Show all words immediately at full opacity (for reduced-motion or fallback).
   *
   * @param {Element} el - The element whose words to show
   */
  showAllWords: function (el) {
    var words = el.querySelectorAll('.word-reveal');
    words.forEach(function (word) {
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
      word.style.transition = 'none';
    });
  },

  /**
   * Check if the user prefers reduced motion.
   *
   * @returns {boolean} True if reduced motion is preferred
   */
  prefersReducedMotion: function () {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return motionQuery.matches;
  },

  /**
   * Cleanup: disconnect observer and reset element styles.
   */
  destroy: function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.elements = [];
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  TextReveal.init();
});
