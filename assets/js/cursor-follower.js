/* ==========================================================================
   Custom Cursor Follower
   ==========================================================================
   Requirements: 8.1, 8.2, 8.3, 8.4, 14.2, 14.5

   Creates a decorative cursor-following dot that trails the user's mouse
   with a smooth lerp animation. Scales up on interactive elements.
   Hidden on touch devices and when reduced-motion is preferred.
   ========================================================================== */

const CursorFollower = {
  dot: null,
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  animationId: null,
  isHovering: false,
  isEnabled: false,

  /**
   * Initialize the cursor follower.
   * Creates the DOM element, attaches event listeners, and starts the
   * animation loop. Exits early on touch devices or reduced-motion.
   */
  init() {
    // Req 8.4: Hide on touch devices (pointer: coarse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    // Req 8.3 / 14.2: Hide when reduced-motion is preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Create the dot element
    this.dot = document.createElement('div');
    this.dot.className = 'cursor-follower';
    // Req 14.5: Decorative element hidden from screen readers
    this.dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.dot);

    this.isEnabled = true;

    // Bind methods for proper listener removal
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseOver = this._handleMouseOver.bind(this);
    this._handleMouseOut = this._handleMouseOut.bind(this);
    this._animate = this._animate.bind(this);

    // Attach listeners
    document.addEventListener('mousemove', this._handleMouseMove, { passive: true });
    document.addEventListener('mouseover', this._handleMouseOver, { passive: true });
    document.addEventListener('mouseout', this._handleMouseOut, { passive: true });

    // Start animation loop
    this._animate();
  },

  /**
   * Track cursor position for lerp targeting.
   * @param {MouseEvent} e
   */
  _handleMouseMove(e) {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
  },

  /**
   * Req 8.2: Scale up on interactive elements (a, button, [role="button"]).
   * @param {MouseEvent} e
   */
  _handleMouseOver(e) {
    if (e.target.closest('a, button, [role="button"]')) {
      this.isHovering = true;
      this.dot.classList.add('cursor-follower--hover');
    }
  },

  /**
   * Remove hover state when leaving interactive elements.
   * @param {MouseEvent} e
   */
  _handleMouseOut(e) {
    if (e.target.closest('a, button, [role="button"]')) {
      // Only remove if we're not entering another interactive element
      if (!e.relatedTarget || !e.relatedTarget.closest('a, button, [role="button"]')) {
        this.isHovering = false;
        this.dot.classList.remove('cursor-follower--hover');
      }
    }
  },

  /**
   * Req 8.1: Lerp toward target position with 0.15 factor per frame
   * for ~100ms trailing delay feel. Uses requestAnimationFrame.
   */
  _animate() {
    if (!this.isEnabled) return;

    // Lerp factor 0.15 gives a smooth trailing effect (~100ms perceived delay)
    const lerp = 0.15;
    this.x += (this.targetX - this.x) * lerp;
    this.y += (this.targetY - this.y) * lerp;

    // Apply position via transform for GPU-accelerated rendering
    this.dot.style.transform = this.isHovering
      ? 'translate(' + this.x + 'px, ' + this.y + 'px) translate(-50%, -50%) scale(1.5)'
      : 'translate(' + this.x + 'px, ' + this.y + 'px) translate(-50%, -50%) scale(1)';

    this.animationId = requestAnimationFrame(this._animate);
  },

  /**
   * Handle hover state changes (public API matching design interface).
   * @param {MouseEvent} e
   */
  handleHover(e) {
    if (e.type === 'mouseover') {
      this._handleMouseOver(e);
    } else {
      this._handleMouseOut(e);
    }
  },

  /**
   * Clean up: remove element, cancel animation, detach listeners.
   */
  destroy() {
    this.isEnabled = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.dot && this.dot.parentNode) {
      this.dot.parentNode.removeChild(this.dot);
      this.dot = null;
    }

    document.removeEventListener('mousemove', this._handleMouseMove);
    document.removeEventListener('mouseover', this._handleMouseOver);
    document.removeEventListener('mouseout', this._handleMouseOut);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  CursorFollower.init();
});
