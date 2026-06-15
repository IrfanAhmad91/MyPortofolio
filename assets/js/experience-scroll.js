/**
 * experience-scroll.js
 * Horizontal drag-scroll, keyboard navigation, and dot indicator
 * for the Experience section cards.
 *
 * Requirements: 11.3, 11.4, 11.7, 11.8
 */
const ExperienceScroll = {
  container: null,
  track: null,
  cards: [],
  dots: [],
  reducedMotion: false,

  // Drag state
  isDragging: false,
  startX: 0,
  scrollStart: 0,
  hasDragged: false,

  // Bound handlers (for cleanup)
  _onMouseDown: null,
  _onMouseMove: null,
  _onMouseUp: null,
  _onMouseLeave: null,
  _onKeyDown: null,
  _onScroll: null,
  _rafId: null,
  _scrollPending: false,

  init() {
    this.container = document.querySelector('.experience-scroll');
    this.track = document.querySelector('.experience-scroll__track');

    if (!this.container || !this.track) return;

    this.cards = Array.from(this.track.querySelectorAll('.experience-card'));
    this.dots = Array.from(document.querySelectorAll('.experience-scroll__dot'));

    if (this.cards.length === 0) return;

    // Check reduced motion preference
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', function(e) {
      ExperienceScroll.reducedMotion = e.matches;
    });

    this.setupDragScroll();
    this.setupKeyboard();
    this.setupScrollListener();
    this.updateDots();
  },

  setupDragScroll() {
    var self = this;

    this._onMouseDown = function(e) {
      // Only handle left mouse button
      if (e.button !== 0) return;

      self.isDragging = true;
      self.hasDragged = false;
      self.startX = e.pageX;
      self.scrollStart = self.container.scrollLeft;
      self.container.style.cursor = 'grabbing';
      self.container.style.userSelect = 'none';
      e.preventDefault();
    };

    this._onMouseMove = function(e) {
      if (!self.isDragging) return;

      var dx = e.pageX - self.startX;
      if (Math.abs(dx) > 3) {
        self.hasDragged = true;
      }

      self.container.scrollLeft = self.scrollStart - dx;
    };

    this._onMouseUp = function() {
      if (!self.isDragging) return;
      self.isDragging = false;
      self.container.style.cursor = 'grab';
      self.container.style.userSelect = '';
    };

    this._onMouseLeave = function() {
      if (!self.isDragging) return;
      self.isDragging = false;
      self.container.style.cursor = 'grab';
      self.container.style.userSelect = '';
    };

    // Set initial grab cursor
    this.container.style.cursor = 'grab';

    this.container.addEventListener('mousedown', this._onMouseDown);
    this.container.addEventListener('mousemove', this._onMouseMove);
    this.container.addEventListener('mouseup', this._onMouseUp);
    this.container.addEventListener('mouseleave', this._onMouseLeave);
  },

  setupKeyboard() {
    var self = this;

    this._onKeyDown = function(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      e.preventDefault();

      // Calculate one card width (including gap)
      var card = self.cards[0];
      if (!card) return;

      var cardStyle = window.getComputedStyle(card);
      var cardWidth = card.offsetWidth;
      var gap = parseInt(window.getComputedStyle(self.track).gap) || 24;
      var scrollAmount = cardWidth + gap;

      var scrollBehavior = self.reducedMotion ? 'instant' : 'smooth';

      if (e.key === 'ArrowLeft') {
        self.container.scrollBy({
          left: -scrollAmount,
          behavior: scrollBehavior
        });
      } else if (e.key === 'ArrowRight') {
        self.container.scrollBy({
          left: scrollAmount,
          behavior: scrollBehavior
        });
      }
    };

    this.container.addEventListener('keydown', this._onKeyDown);
  },

  setupScrollListener() {
    var self = this;

    this._onScroll = function() {
      if (self._scrollPending) return;

      self._scrollPending = true;
      self._rafId = requestAnimationFrame(function() {
        self.updateDots();
        self._scrollPending = false;
      });
    };

    this.container.addEventListener('scroll', this._onScroll);
  },

  updateDots() {
    if (this.dots.length === 0 || this.cards.length === 0) return;

    var scrollLeft = this.container.scrollLeft;
    var containerWidth = this.container.offsetWidth;
    var activeIndex = 0;
    var maxVisibility = 0;

    for (var i = 0; i < this.cards.length; i++) {
      var card = this.cards[i];
      var cardLeft = card.offsetLeft - this.container.offsetLeft;
      var cardRight = cardLeft + card.offsetWidth;

      // Calculate how much of the card is visible
      var visibleLeft = Math.max(cardLeft, scrollLeft);
      var visibleRight = Math.min(cardRight, scrollLeft + containerWidth);
      var visibleWidth = Math.max(0, visibleRight - visibleLeft);

      if (visibleWidth > maxVisibility) {
        maxVisibility = visibleWidth;
        activeIndex = i;
      }
    }

    // Update dot classes
    for (var j = 0; j < this.dots.length; j++) {
      if (j === activeIndex) {
        this.dots[j].classList.add('experience-scroll__dot--active');
      } else {
        this.dots[j].classList.remove('experience-scroll__dot--active');
      }
    }
  },

  destroy() {
    if (this.container) {
      this.container.removeEventListener('mousedown', this._onMouseDown);
      this.container.removeEventListener('mousemove', this._onMouseMove);
      this.container.removeEventListener('mouseup', this._onMouseUp);
      this.container.removeEventListener('mouseleave', this._onMouseLeave);
      this.container.removeEventListener('keydown', this._onKeyDown);
      this.container.removeEventListener('scroll', this._onScroll);
      this.container.style.cursor = '';
    }

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }

    this.container = null;
    this.track = null;
    this.cards = [];
    this.dots = [];
  }
};

// Self-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  ExperienceScroll.init();
});
