/**
 * Magnetic Button Effect
 * Buttons subtly translate toward the cursor when within proximity zone.
 * Disabled on touch devices and when prefers-reduced-motion is active.
 */
const MagneticButton = {
  buttons: [],
  proximityZone: 60,
  maxTranslate: 8,
  _listeners: [],
  _rafIds: new Map(),

  init() {
    // Disable on touch devices or reduced motion
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    this.buttons = Array.from(document.querySelectorAll('.magnetic-btn'));
    if (!this.buttons.length) return;

    this.buttons.forEach(function(btn) {
      var self = MagneticButton;

      var onMouseMove = function(e) {
        self.handleMouseMove(btn, e);
      };

      var onMouseLeave = function() {
        self.handleMouseLeave(btn);
      };

      btn.addEventListener('mousemove', onMouseMove);
      btn.addEventListener('mouseleave', onMouseLeave);

      self._listeners.push({ el: btn, type: 'mousemove', fn: onMouseMove });
      self._listeners.push({ el: btn, type: 'mouseleave', fn: onMouseLeave });
    });
  },

  handleMouseMove(btn, e) {
    var rect = btn.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    var cursorX = e.clientX;
    var cursorY = e.clientY;

    var distX = cursorX - centerX;
    var distY = cursorY - centerY;
    var distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < this.proximityZone) {
      var translateX = distX * (this.maxTranslate / this.proximityZone);
      var translateY = distY * (this.maxTranslate / this.proximityZone);

      // Cancel any pending rAF for this button
      if (this._rafIds.has(btn)) {
        cancelAnimationFrame(this._rafIds.get(btn));
      }

      var self = this;
      var rafId = requestAnimationFrame(function() {
        btn.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px)';
        btn.style.transition = 'none';
        self._rafIds.delete(btn);
      });
      this._rafIds.set(btn, rafId);
    } else {
      this.handleMouseLeave(btn);
    }
  },

  handleMouseLeave(btn) {
    // Cancel any pending rAF
    if (this._rafIds.has(btn)) {
      cancelAnimationFrame(this._rafIds.get(btn));
      this._rafIds.delete(btn);
    }

    btn.style.transition = 'transform 300ms ease-out';
    btn.style.transform = 'translate(0px, 0px)';
  },

  destroy() {
    this._listeners.forEach(function(item) {
      item.el.removeEventListener(item.type, item.fn);
    });
    this._listeners = [];

    this._rafIds.forEach(function(id) {
      cancelAnimationFrame(id);
    });
    this._rafIds.clear();

    this.buttons.forEach(function(btn) {
      btn.style.transform = '';
      btn.style.transition = '';
    });
    this.buttons = [];
  }
};

document.addEventListener('DOMContentLoaded', function() {
  MagneticButton.init();
});
