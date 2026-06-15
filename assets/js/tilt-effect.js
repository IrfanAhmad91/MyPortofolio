/**
 * TiltEffect Module
 * Applies 3D perspective tilt to the hero content based on cursor position.
 * Disabled on touch devices and when reduced motion is preferred.
 */
const TiltEffect = {
  element: null,
  heroSection: null,
  maxRotation: 5,
  isActive: false,
  rafId: null,
  currentRotateX: 0,
  currentRotateY: 0,

  // Bound listeners for cleanup
  _boundHandleMove: null,
  _boundHandleLeave: null,

  /**
   * Initialize the tilt effect on the given selector element.
   * Attaches mousemove to the parent hero section, applies transform to the element.
   * @param {string} selector - CSS selector for the target element (e.g. '.hero__content')
   */
  init(selector) {
    // Check media queries — disable on touch devices or reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    // Check for rAF availability
    if (typeof window.requestAnimationFrame !== 'function') {
      return;
    }

    this.element = document.querySelector(selector);
    if (!this.element) {
      return;
    }

    // The hero section is the parent of .hero__content
    this.heroSection = this.element.closest('section') || this.element.parentElement;
    if (!this.heroSection) {
      return;
    }

    // Set initial GPU-hint styles on the element
    this.element.style.willChange = 'transform';
    this.element.style.transformStyle = 'preserve-3d';

    // Bind listeners
    this._boundHandleMove = this.handleMove.bind(this);
    this._boundHandleLeave = this.handleLeave.bind(this);

    this.heroSection.addEventListener('mousemove', this._boundHandleMove);
    this.heroSection.addEventListener('mouseleave', this._boundHandleLeave);

    this.isActive = true;
  },

  /**
   * Handle mousemove: calculate rotation from cursor position relative to hero center.
   * @param {MouseEvent} e
   */
  handleMove(e) {
    if (!this.isActive || !this.element) return;

    const rect = this.heroSection.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const cursorX = e.clientX;
    const cursorY = e.clientY;

    // Calculate rotation (inverted X for natural tilt direction)
    const rotateX = -((cursorY - centerY) / (rect.height / 2)) * this.maxRotation;
    const rotateY = ((cursorX - centerX) / (rect.width / 2)) * this.maxRotation;

    // Clamp to max rotation
    this.currentRotateX = Math.max(-this.maxRotation, Math.min(this.maxRotation, rotateX));
    this.currentRotateY = Math.max(-this.maxRotation, Math.min(this.maxRotation, rotateY));

    // Remove any transition during movement for immediate response
    this.element.style.transition = '';

    // Apply via requestAnimationFrame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      if (this.element) {
        this.element.style.transform =
          'perspective(1000px) rotateX(' + this.currentRotateX + 'deg) rotateY(' + this.currentRotateY + 'deg)';
      }
    });
  },

  /**
   * Handle mouseleave: reset rotation to 0 with a 400ms ease-out transition.
   */
  handleLeave() {
    if (!this.element) return;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Add transition for smooth reset
    this.element.style.transition = 'transform 400ms ease-out';
    this.element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

    // Remove transition after it completes so it doesn't interfere with mouse tracking
    setTimeout(() => {
      if (this.element) {
        this.element.style.transition = '';
      }
    }, 400);

    this.currentRotateX = 0;
    this.currentRotateY = 0;
  },

  /**
   * Destroy the tilt effect: remove event listeners and reset styles.
   */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.heroSection && this._boundHandleMove) {
      this.heroSection.removeEventListener('mousemove', this._boundHandleMove);
    }

    if (this.heroSection && this._boundHandleLeave) {
      this.heroSection.removeEventListener('mouseleave', this._boundHandleLeave);
    }

    if (this.element) {
      this.element.style.willChange = '';
      this.element.style.transformStyle = '';
      this.element.style.transform = '';
      this.element.style.transition = '';
    }

    this.element = null;
    this.heroSection = null;
    this.isActive = false;
    this._boundHandleMove = null;
    this._boundHandleLeave = null;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  TiltEffect.init('.hero__content');
});
