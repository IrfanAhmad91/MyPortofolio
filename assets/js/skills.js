/* ==========================================================================
   SkillsAnimator Module - Scroll-triggered progress bar animations
   ==========================================================================
   Requirements: 7.3
   
   Uses Intersection Observer (threshold 0.2) to detect when the skills
   section enters the viewport and animates all progress bars from 0% to
   their assigned proficiency value (via CSS transition, 1000ms ease-out).
   Animation triggers only once per page load.
   Respects prefers-reduced-motion for accessibility.
   ========================================================================== */

const SkillsAnimator = {
  animated: false,

  /**
   * Initialize the SkillsAnimator module.
   * Sets up an Intersection Observer targeting the #skills section.
   * If prefers-reduced-motion is enabled, shows bars at full width immediately.
   */
  init() {
    var self = this;

    // Check for prefers-reduced-motion
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (motionQuery.matches) {
      // Show all bars at full width immediately without animation
      var bars = document.querySelectorAll('.skill-bar__fill');
      bars.forEach(function (bar) {
        bar.classList.add('animate');
      });
      self.animated = true;
      return;
    }

    // Find the skills section
    var skillsSection = document.querySelector('#skills');

    if (!skillsSection) return;

    // Guard: if IntersectionObserver not supported, show bars immediately
    if (!('IntersectionObserver' in window)) {
      self.animateBars();
      return;
    }

    // Set up Intersection Observer with 20% threshold
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !self.animated) {
          self.animateBars();
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    observer.observe(skillsSection);
  },

  /**
   * Trigger CSS animation on all skill bars.
   * Adds the .animate class to all .skill-bar__fill elements,
   * which triggers the CSS transition from width 0% to width: var(--skill-level).
   * Sets the animated flag to prevent re-triggering.
   */
  animateBars() {
    if (this.animated) return;

    var bars = document.querySelectorAll('.skill-bar__fill');
    bars.forEach(function (bar) {
      bar.classList.add('animate');
    });

    this.animated = true;
  },

  /**
   * Reset the animator for testing purposes.
   * Resets the animated flag and removes .animate class from all bars.
   */
  reset() {
    this.animated = false;

    var bars = document.querySelectorAll('.skill-bar__fill');
    bars.forEach(function (bar) {
      bar.classList.remove('animate');
    });
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  SkillsAnimator.init();
});
