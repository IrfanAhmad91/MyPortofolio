/* ==========================================================================
   Timeline Module - Scroll-triggered animations for experience cards
   ==========================================================================
   Requirements: 6.4, 8.1, 8.2, 8.3
   
   Uses Intersection Observer (threshold 0.2) to detect timeline cards
   entering the viewport and animates them with staggered slide-in effects.
   Respects prefers-reduced-motion for accessibility.
   ========================================================================== */

const Timeline = {
  /**
   * Initialize the Timeline module.
   * Sets up Intersection Observers for timeline cards.
   * If prefers-reduced-motion is enabled, shows all cards immediately.
   */
  init() {
    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (motionQuery.matches) {
      // Show all cards immediately without animation
      const cards = document.querySelectorAll('.timeline__item[data-reveal]');
      cards.forEach(function (card) {
        card.classList.add('timeline__item--visible');
      });
      return;
    }

    // Proceed with Intersection Observer animations
    this.observeCards();
  },

  /**
   * Set up Intersection Observer to watch timeline cards entering viewport.
   * Uses threshold of 0.2 (20% of card visible triggers animation).
   * Once a card is revealed, it is unobserved (once-only animation).
   */
  observeCards() {
    var self = this;
    var cards = document.querySelectorAll('.timeline__item[data-reveal]');

    // Guard: if no cards found or IntersectionObserver not supported
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all cards immediately
      cards.forEach(function (card) {
        card.classList.add('timeline__item--visible');
      });
      return;
    }

    var visibleIndex = 0;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          self.animateCard(entry.target, visibleIndex);
          visibleIndex++;
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    cards.forEach(function (card) {
      observer.observe(card);
    });
  },

  /**
   * Trigger slide-in animation on a single card with stagger delay.
   * Animation: translateY(40px) + opacity(0) → translateY(0) + opacity(1)
   * Duration: 600ms ease-out
   * Stagger: 150ms delay between consecutive cards
   *
   * @param {Element} card - The timeline item element to animate
   * @param {number} index - The sequential index for stagger calculation
   */
  animateCard(card, index) {
    var delay = index * 150;

    setTimeout(function () {
      card.classList.add('timeline__item--visible');
    }, delay);
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  Timeline.init();
});
