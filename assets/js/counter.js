/**
 * Counter Animation Module
 * Animates numeric counters from 0 to their target value on scroll.
 * Uses IntersectionObserver at 20% threshold, fires once per element.
 * Respects prefers-reduced-motion by showing final value immediately.
 *
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4
 */
const CounterAnimation = {
  counters: [],

  /**
   * Initialize counter animation.
   * Queries all [data-counter] elements, sets up IntersectionObserver.
   * Gracefully degrades if IntersectionObserver is not supported.
   */
  init() {
    this.counters = document.querySelectorAll('[data-counter]');

    if (!this.counters.length) return;

    // Reduced-motion: display final values immediately without animation
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.counters.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-counter'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target + suffix;
      });
      return;
    }

    // Graceful degradation: if IntersectionObserver is not supported, show final values
    if (!('IntersectionObserver' in window)) {
      this.counters.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-counter'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target + suffix;
      });
      return;
    }

    var self = this;

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            self.animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    this.counters.forEach(function (el) {
      observer.observe(el);
    });
  },

  /**
   * Animate a single counter element from 0 to its target value.
   * Uses requestAnimationFrame over 2000ms with cubic ease-out.
   * @param {HTMLElement} el - The counter element with data-counter attribute.
   */
  animateCounter(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 2000;
    var startTime = null;
    var self = this;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = self.easeOut(progress);

      var currentValue = Math.round(easedProgress * target);
      el.textContent = currentValue + (progress >= 1 ? suffix : '');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure final value is exact
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  },

  /**
   * Cubic ease-out timing function.
   * @param {number} t - Progress value from 0 to 1.
   * @returns {number} Eased value from 0 to 1.
   */
  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  CounterAnimation.init();
});
