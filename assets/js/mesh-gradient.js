/* ==========================================================================
   Mesh Gradient Module
   Provides a programmatic reduced-motion handling layer on top of the
   CSS @media query already in mesh-gradient.css. Ensures the animation
   is paused when the user prefers reduced motion, and listens for live
   changes to the preference.
   ========================================================================== */

const MeshGradient = {
  /** @type {HTMLElement|null} */
  _element: null,

  /** @type {MediaQueryList|null} */
  _motionQuery: null,

  /** @type {((e: MediaQueryListEvent) => void)|null} */
  _listener: null,

  /**
   * Initialize the mesh gradient module.
   * Checks prefers-reduced-motion and pauses/resumes CSS animation accordingly.
   */
  init() {
    this._element = document.querySelector('.hero__mesh-gradient');
    if (!this._element) return;

    this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Apply initial state
    this._applyMotionPreference(this._motionQuery.matches);

    // Listen for live changes (user toggles system setting)
    this._listener = function(e) {
      this._applyMotionPreference(e.matches);
    }.bind(this);

    this._motionQuery.addEventListener('change', this._listener);
  },

  /**
   * Pause or resume the mesh gradient animation based on motion preference.
   * @param {boolean} reduceMotion - true if user prefers reduced motion
   */
  _applyMotionPreference(reduceMotion) {
    if (!this._element) return;

    if (reduceMotion) {
      this._element.style.animationPlayState = 'paused';
      this._element.classList.add('mesh-gradient--static');
    } else {
      this._element.style.animationPlayState = 'running';
      this._element.classList.remove('mesh-gradient--static');
    }
  },

  /**
   * Cleanup event listeners.
   */
  destroy() {
    if (this._motionQuery && this._listener) {
      this._motionQuery.removeEventListener('change', this._listener);
    }
    this._element = null;
    this._motionQuery = null;
    this._listener = null;
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  MeshGradient.init();
});
