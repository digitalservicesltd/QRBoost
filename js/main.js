/**
 * QRBoost - Premium Main JavaScript
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ========================================
// Initialize Lenis Smooth Scrolling (DESKTOP ONLY)
// ========================================
let lenis;

// Check if it's a desktop device (width > 768px)
if (window.innerWidth > 768) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
  });

  // Sync GSAP ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000) });
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

// Smooth Anchor Scrolling (Works for both Desktop and Mobile)
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
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
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
    '.section-header, .problem-card, .gallery-card, .how-it-works-step, ' +
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
        // Animate old price strikethrough fade
        gsap.to(oldPrice, {
          opacity: 0.4,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            oldPrice.classList.add('revealed');
          }
        });

        // Animate new price scale-up
        gsap.fromTo(newPrice,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            delay: 0.3,
            ease: 'back.out(1.4)',
            onComplete: () => {
              // Brief pulse at the end
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
// Carousel Drag-to-Scroll (Desktop)
// ========================================
function initCarousels() {
  const tracks = document.querySelectorAll('.carousel__track');

  tracks.forEach(track => {
    let isDown = false;
    let startX;
    let scrollLeft;
    let hasDragged = false;

    track.addEventListener('mousedown', (e) => {
      // Don't initiate drag if clicking a button/link
      if (e.target.closest('.gallery-card__btn')) return;
      isDown = true;
      hasDragged = false;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      e.preventDefault();
    });

    track.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('dragging');
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('dragging');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) hasDragged = true;
      track.scrollLeft = scrollLeft - walk;
    });

    // Prevent click on links after drag
    track.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    }, true);
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
  document.querySelectorAll('.gallery-card__btn--select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.gallery-card');
      const carousel = btn.closest('.carousel');
      const category = carousel.dataset.category;
      const themeName = btn.dataset.theme;

      // If already selected, deselect
      if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        btn.textContent = 'Select';
        selections[category] = null;
      } else {
        // Deselect any previously selected card in this category
        carousel.querySelectorAll('.gallery-card.selected').forEach(prev => {
          prev.classList.remove('selected');
          prev.querySelector('.gallery-card__btn--select').textContent = 'Select';
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

// ========================================
// Initialize Carousel & Selection on Load
// ========================================
window.addEventListener('load', () => {
  // Small delay so it runs after preloader init
  setTimeout(() => {
    initCarousels();
    initThemeSelection();
    initWhatsAppCta();
  }, 100);
});

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});
