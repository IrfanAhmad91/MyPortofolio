"use strict";

/**
 * Portfolio Main JS - Navbar & Navigation
 * Requirements: 3.2, 3.3, 3.5, 3.6, 3.7, 10.4
 *
 * Handles:
 * - Glassmorphism navbar on scroll (100px threshold)
 * - Smooth scroll to sections (800ms, easeInOutCubic)
 * - Active link tracking based on scroll position
 * - Hamburger menu toggle for mobile (<992px)
 * - Typed.js initialization
 * - Hash handling on page load
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Navbar Module
   * Manages all navigation-related behavior.
   */
  const Navbar = {
    // DOM element references
    header: document.getElementById("header"),
    navbarNav: document.getElementById("navbar-nav"),
    mobileToggle: document.getElementById("mobile-nav-toggle"),
    navLinks: document.querySelectorAll(".navbar__link"),
    sectionIds: ["hero", "about", "experience", "skills", "contact"],

    /**
     * Initialize the Navbar module.
     * Attaches scroll listeners, click handlers, and mobile toggle.
     */
    init() {
      // Scroll event for glassmorphism and active link tracking
      document.addEventListener("scroll", () => {
        this.handleScroll();
        this.setActiveLink();
      });

      // Click handlers for navigation links
      this.navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const href = link.getAttribute("href");
          if (!href || !href.startsWith("#")) return;

          const sectionId = href.substring(1);
          this.smoothScrollTo(sectionId);

          // Close mobile nav if open
          if (this.navbarNav && this.navbarNav.classList.contains("navbar__nav--open")) {
            this.toggleMobile();
          }
        });
      });

      // Mobile hamburger toggle
      if (this.mobileToggle) {
        this.mobileToggle.addEventListener("click", () => {
          this.toggleMobile();
        });
      }

      // Run initial state
      this.handleScroll();
      this.setActiveLink();
    },

    /**
     * Toggle glassmorphism class on header at 100px scroll threshold.
     * Adds .navbar--scrolled when scrollY > 100, removes when <= 100.
     */
    handleScroll() {
      if (!this.header) return;

      if (window.scrollY > 100) {
        this.header.classList.add("navbar--scrolled");
      } else {
        this.header.classList.remove("navbar--scrolled");
      }
    },

    /**
     * Smooth scroll to a target section by ID.
     * Uses requestAnimationFrame with easeInOutCubic over 800ms.
     * Guards against non-existent section targets.
     *
     * @param {string} sectionId - The ID of the target section (without #)
     */
    smoothScrollTo(sectionId) {
      const target = document.getElementById(sectionId);
      if (!target) return; // Guard: do nothing if section doesn't exist

      const headerOffset = this.header ? this.header.offsetHeight : 0;
      const targetPosition = target.offsetTop - headerOffset;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 800;
      let startTime = null;

      // easeInOutCubic timing function
      const easeInOutCubic = (t) => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    },

    /**
     * Highlight the active navigation link based on current scroll position.
     * Uses 200px offset from top to determine the "current" section.
     */
    setActiveLink() {
      const scrollPosition = window.scrollY + 200;

      let currentSection = null;

      // Determine which section is currently in view
      for (const id of this.sectionIds) {
        const section = document.getElementById(id);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = id;
          break;
        }
      }

      // Update active class on nav links
      this.navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${currentSection}`) {
          link.classList.add("navbar__link--active");
        } else {
          link.classList.remove("navbar__link--active");
        }
      });
    },

    /**
     * Toggle mobile navigation menu visibility.
     * Toggles .navbar__nav--open on #navbar-nav and switches
     * the hamburger icon between bi-list and bi-x.
     * Updates aria-label for accessibility.
     */
    toggleMobile() {
      if (!this.navbarNav || !this.mobileToggle) return;

      this.navbarNav.classList.toggle("navbar__nav--open");

      const icon = this.mobileToggle.querySelector("i");
      const isOpen = this.navbarNav.classList.contains("navbar__nav--open");

      if (icon) {
        if (isOpen) {
          icon.classList.remove("bi-list");
          icon.classList.add("bi-x");
        } else {
          icon.classList.remove("bi-x");
          icon.classList.add("bi-list");
        }
      }

      // Update aria-label for accessibility
      this.mobileToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    },
  };

  /**
   * Typed.js Initialization
   * Reads data-typed-items attribute and initializes typing animation.
   */
  function initTyped() {
    const typedElement = document.querySelector(".typed");
    if (!typedElement) return;

    const typedItems = typedElement.getAttribute("data-typed-items");
    if (!typedItems) return;

    const strings = typedItems.split(",").map((s) => s.trim());

    try {
      new Typed(".typed", {
        strings: strings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
      });
    } catch (e) {
      // Typed.js CDN failed to load — fallback text will show via CSS
    }
  }

  /**
   * Hash Handling on Page Load
   * If URL has a hash, smooth scroll to the target section.
   */
  function handleInitialHash() {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      const target = document.getElementById(sectionId);
      if (target) {
        // Small delay to ensure layout is settled
        setTimeout(() => {
          Navbar.smoothScrollTo(sectionId);
        }, 100);
      }
    }
  }

  /**
   * Hero CTA Button - Smooth Scroll to Experience
   * Req 3.4: CTA button scrolls to #experience section
   */
  function initHeroCTA() {
    const ctaBtn = document.querySelector(".hero__cta");
    if (!ctaBtn) return;

    ctaBtn.addEventListener("click", () => {
      const experienceSection = document.getElementById("experience");
      if (!experienceSection) return;
      Navbar.smoothScrollTo("experience");
    });
  }

  // Initialize all modules
  Navbar.init();
  initTyped();
  initHeroCTA();
  handleInitialHash();
});
