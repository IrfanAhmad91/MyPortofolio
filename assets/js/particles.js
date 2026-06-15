/* ==========================================================================
   Particle System - Hero Background Animation
   ==========================================================================
   Requirements: 2.1, 2.4, 1.3
   
   Canvas-based particle animation for hero section background.
   Falls back to CSS gradient if canvas or requestAnimationFrame
   is not supported.
   ========================================================================== */

const ParticleSystem = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  resizeHandler: null,

  /**
   * Initialize the particle system on the given canvas element.
   * Sets up canvas dimensions, creates particles, and starts animation.
   * Falls back to CSS gradient if canvas is not supported.
   * @param {string} canvasId - The ID of the canvas element
   */
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);

    // Fallback: canvas element not found or canvas not supported
    if (!this.canvas || !this.canvas.getContext) {
      this._showFallback();
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) {
      this._showFallback();
      return;
    }

    // Fallback: requestAnimationFrame not available
    if (!window.requestAnimationFrame) {
      this._showFallback();
      return;
    }

    // Set canvas to fill its container
    this._setCanvasSize();

    // Create particles (50-80 count)
    const count = Math.floor(Math.random() * 31) + 50; // 50 to 80
    this.createParticles(count);

    // Bind and attach resize handler
    this.resizeHandler = this.resize.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    // Start animation loop
    this.animate();
  },

  /**
   * Generate particle objects with random properties.
   * @param {number} count - Number of particles to create
   */
  createParticles(count) {
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5),         // -0.5 to 0.5
        vy: (Math.random() - 0.5),         // -0.5 to 0.5
        radius: Math.random() * 2 + 1,     // 1 to 3
        opacity: Math.random() * 0.4 + 0.1 // 0.1 to 0.5
      });
    }
  },

  /**
   * Animation loop using requestAnimationFrame.
   * Clears the canvas, updates particle positions, and redraws.
   */
  animate() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + p.opacity + ')';
      this.ctx.fill();
    }

    this.animationId = window.requestAnimationFrame(this.animate.bind(this));
  },

  /**
   * Handle window resize - update canvas dimensions and reposition particles.
   */
  resize() {
    if (!this.canvas) return;

    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;

    this._setCanvasSize();

    // Scale particle positions to new dimensions
    if (oldWidth > 0 && oldHeight > 0) {
      const scaleX = this.canvas.width / oldWidth;
      const scaleY = this.canvas.height / oldHeight;

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].x *= scaleX;
        this.particles[i].y *= scaleY;
      }
    }
  },

  /**
   * Cleanup: cancel animation frame and remove event listeners.
   * Call on page unload or when replacing the hero section.
   */
  destroy() {
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.particles = [];
    this.ctx = null;
    this.canvas = null;
  },

  /**
   * Set canvas width and height to match its display size.
   * @private
   */
  _setCanvasSize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
    this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
  },

  /**
   * Show CSS gradient fallback when canvas is not supported.
   * Hides the canvas element and ensures the gradient overlay is visible.
   * @private
   */
  _showFallback() {
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }

    // Ensure the gradient fallback overlay is visible
    var fallback = document.querySelector('.hero__gradient-overlay');
    if (fallback) {
      fallback.style.display = 'block';
    }
  }
};

// Initialize on DOMContentLoaded for fast render (Req 2.4: within 1 second)
document.addEventListener('DOMContentLoaded', function () {
  // Respect prefers-reduced-motion
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    ParticleSystem.init('particle-canvas');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
  ParticleSystem.destroy();
});
