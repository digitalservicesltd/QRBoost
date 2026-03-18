/**
 * QRBoost - Premium Main JavaScript
 * With Stacked Swipe Card System
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ========================================
// Initialize Lenis Smooth Scrolling (DESKTOP ONLY)
// ========================================
let lenis;

if (window.innerWidth > 768) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0, 0);
}

// ========================================
// DOM Elements
// ========================================
const preloader = document.getElementById('preloader');
const navbar = document.getElementById('navbar');
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');
const currentYearEl = document.getElementById('currentYear');

// ========================================
// Preloader Logic
// ========================================
window.addEventListener('load', () => {
  setTimeout(() => {
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }
    initAnimations();
    initPricingAnimation();
    initAllSwipeStacks();
    initThemeSelection();
    initWhatsAppCta();
  }, 1000);
});

// ========================================
// Navigation & Scroll
// ========================================
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

navbarToggle.addEventListener('click', () => {
  navbarToggle.classList.toggle('active');
  navbarMenu.classList.toggle('active');
});

navbarMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navbarToggle.classList.remove('active');
    navbarMenu.classList.remove('active');
  });
});

// Smooth Anchor Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = navbar.offsetHeight + 20;
      if (lenis) {
        lenis.scrollTo(target, { offset: -offset });
      } else {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navbarMenu.classList.contains('active')) {
    navbarToggle.classList.remove('active');
    navbarMenu.classList.remove('active');
  }
});

// ========================================
// Scroll Animations
// ========================================
function initAnimations() {
  const elements = document.querySelectorAll(
    '.section-header, .problem-card, .swipe-stack, .how-it-works-step, ' +
    '.cta-box, .pricing-card'
  );

  elements.forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%'
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      delay: (i % 4) * 0.1
    });
  });
}

// ========================================
// Pricing Price-Reveal Animation
// ========================================
function initPricingAnimation() {
  const pricingCards = document.querySelectorAll('.pricing-card');

  pricingCards.forEach(card => {
    const oldPrice = card.querySelector('.pricing-card__old-price');
    const newPrice = card.querySelector('.pricing-card__price');

    if (!oldPrice || !newPrice) return;

    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(oldPrice, {
          opacity: 0.4,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => { oldPrice.classList.add('revealed'); }
        });

        gsap.fromTo(newPrice,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            delay: 0.3,
            ease: 'back.out(1.4)',
            onComplete: () => {
              gsap.to(newPrice, {
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
              });
            }
          }
        );
      }
    });
  });
}

// ========================================
// Footer Year
// ========================================
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

// ========================================
// STACKED SWIPE CARD SYSTEM
// ========================================

class SwipeStack {
  constructor(container) {
    this.container = container;
    this.category = container.dataset.category;
    this.cards = Array.from(container.querySelectorAll('.stack-card'));
    this.totalCards = this.cards.length;
    this.currentIndex = 0;
    this.isAnimating = false;

    // Drag state
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragThreshold = 80;

    // DOM refs
    this.viewport = container.querySelector('.swipe-stack__viewport');
    this.prevBtn = container.querySelector('.swipe-stack__nav--prev');
    this.nextBtn = container.querySelector('.swipe-stack__nav--next');
    this.dotsContainer = container.querySelector('.swipe-stack__dots');

    this.init();
  }

  init() {
    this.buildDots();
    this.layoutCards();
    this.bindEvents();
    this.updateControls();
  }

  // ---- Build dot indicators ----
  buildDots() {
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalCards; i++) {
      const dot = document.createElement('button');
      dot.className = 'swipe-stack__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to card ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    }
    this.dots = Array.from(this.dotsContainer.querySelectorAll('.swipe-stack__dot'));
  }

  // ---- Position cards in stack ----
  layoutCards() {
    this.cards.forEach((card, i) => {
      const offset = i - this.currentIndex;

      // Remove any lingering exit/enter classes
      card.classList.remove('exit-left', 'exit-right', 'enter-left', 'enter-right', 'swiping');
      card.style.transform = '';
      card.style.opacity = '';

      if (offset >= 0 && offset <= 2) {
        card.style.display = 'block';
        card.setAttribute('data-stack-pos', offset);
      } else {
        card.style.display = 'none';
        card.removeAttribute('data-stack-pos');
      }
    });
  }

  // ---- Update dots and buttons ----
  updateControls() {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });

    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.totalCards - 1;
    }
  }

  // ---- Navigate to index ----
  goTo(index, direction = null) {
    if (this.isAnimating || index === this.currentIndex) return;
    if (index < 0 || index >= this.totalCards) return;

    this.isAnimating = true;

    const goingForward = direction !== null ? direction === 'next' : index > this.currentIndex;
    const exitClass = goingForward ? 'exit-left' : 'exit-right';
    const currentCard = this.cards[this.currentIndex];

    // Animate current card out
    currentCard.classList.add(exitClass);

    // After exit animation, reposition
    setTimeout(() => {
      this.currentIndex = index;
      this.layoutCards();
      this.updateControls();
      this.isAnimating = false;
    }, 400);
  }

  next() {
    if (this.currentIndex < this.totalCards - 1) {
      this.goTo(this.currentIndex + 1, 'next');
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goTo(this.currentIndex - 1, 'prev');
    }
  }

  // ---- Bind all events ----
  bindEvents() {
    // Button controls
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Touch events
    this.viewport.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: true });
    this.viewport.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
    this.viewport.addEventListener('touchend', (e) => this.onDragEnd(e));

    // Mouse events
    this.viewport.addEventListener('mousedown', (e) => this.onDragStart(e));
    this.viewport.addEventListener('mousemove', (e) => this.onDragMove(e));
    this.viewport.addEventListener('mouseup', (e) => this.onDragEnd(e));
    this.viewport.addEventListener('mouseleave', (e) => {
      if (this.isDragging) this.onDragEnd(e);
    });

    // Keyboard
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  // ---- Drag handlers ----
  onDragStart(e) {
    if (this.isAnimating) return;

    // Don't drag if clicking a button
    const target = e.target;
    if (target.closest('.stack-card__btn')) return;

    this.isDragging = true;
    this.startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    this.currentX = this.startX;

    const frontCard = this.cards[this.currentIndex];
    if (frontCard) {
      frontCard.classList.add('swiping');
    }
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = this.currentX - this.startX;

    // Prevent vertical scroll during horizontal swipe
    if (e.type.includes('touch') && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }

    const frontCard = this.cards[this.currentIndex];
    if (!frontCard) return;

    // Apply drag transform with resistance
    const resistance = 0.6;
    const moveX = deltaX * resistance;
    const rotation = (deltaX / window.innerWidth) * 15;
    const opacity = Math.max(0.5, 1 - Math.abs(deltaX) / 500);

    frontCard.style.transform = `translateX(${moveX}px) rotate(${rotation}deg)`;
    frontCard.style.opacity = opacity;
  }

  onDragEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const frontCard = this.cards[this.currentIndex];
    if (!frontCard) return;

    frontCard.classList.remove('swiping');

    const deltaX = this.currentX - this.startX;

    // Check if swipe exceeds threshold
    if (Math.abs(deltaX) > this.dragThreshold) {
      if (deltaX < 0 && this.currentIndex < this.totalCards - 1) {
        // Swipe left → next
        frontCard.classList.add('exit-left');
        this.isAnimating = true;
        setTimeout(() => {
          this.currentIndex++;
          this.layoutCards();
          this.updateControls();
          this.isAnimating = false;
        }, 400);
        return;
      } else if (deltaX > 0 && this.currentIndex > 0) {
        // Swipe right → prev
        frontCard.classList.add('exit-right');
        this.isAnimating = true;
        setTimeout(() => {
          this.currentIndex--;
          this.layoutCards();
          this.updateControls();
          this.isAnimating = false;
        }, 400);
        return;
      }
    }

    // Snap back
    frontCard.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease';
    frontCard.style.transform = 'translateY(0) scale(1)';
    frontCard.style.opacity = '1';

    setTimeout(() => {
      frontCard.style.transition = '';
    }, 350);
  }
}

// ========================================
// Initialize All Swipe Stacks
// ========================================
function initAllSwipeStacks() {
  document.querySelectorAll('.swipe-stack').forEach(container => {
    new SwipeStack(container);
  });
}

// ========================================
// Theme Selection State Management
// ========================================
const selections = {
  salonMenu: null,
  salonCard: null,
  visitingCard: null
};

const selectionBar = document.getElementById('selectionBar');
const summaryMenu = document.getElementById('summaryMenu');
const summaryCard = document.getElementById('summaryCard');
const summaryVisiting = document.getElementById('summaryVisiting');
const whatsappCta = document.getElementById('whatsappCta');

function updateSelectionBar() {
  summaryMenu.textContent = selections.salonMenu || '—';
  summaryCard.textContent = selections.salonCard || '—';
  summaryVisiting.textContent = selections.visitingCard || '—';

  const hasAny = selections.salonMenu || selections.salonCard || selections.visitingCard;

  if (hasAny) {
    selectionBar.classList.add('active');
    document.body.classList.add('has-selection');
  } else {
    selectionBar.classList.remove('active');
    document.body.classList.remove('has-selection');
  }
}

function initThemeSelection() {
  document.querySelectorAll('.stack-card__btn--select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.stack-card');
      const stack = btn.closest('.swipe-stack');
      const category = stack.dataset.category;
      const themeName = btn.dataset.theme;

      // If already selected, deselect
      if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        btn.textContent = 'Select';
        selections[category] = null;
      } else {
        // Deselect any previously selected card in this category
        stack.querySelectorAll('.stack-card.selected').forEach(prev => {
          prev.classList.remove('selected');
          prev.querySelector('.stack-card__btn--select').textContent = 'Select';
        });

        // Select this card
        card.classList.add('selected');
        btn.textContent = 'Selected ✓';
        selections[category] = themeName;
      }

      updateSelectionBar();
    });
  });
}

// ========================================
// WhatsApp CTA — Build Dynamic Message
// ========================================
function initWhatsAppCta() {
  if (!whatsappCta) return;

  whatsappCta.addEventListener('click', () => {
    const menu = selections.salonMenu || 'Not selected';
    const card = selections.salonCard || 'Not selected';
    const visiting = selections.visitingCard || 'Not selected';

    const message =
      `Hi, I want this setup:\n\n` +
      `Salon Menu Theme: ${menu}\n` +
      `Salon Card Theme: ${card}\n` +
      `Visiting Card Theme: ${visiting}\n\n` +
      `Please share details.`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/918219928236?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  });
}

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});