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

// Demo Modal Elements
const demoModal = document.getElementById('demoModal');
const demoScan = document.getElementById('demoScan');
const demoPhone = document.getElementById('demoPhone');
const demoIframe = document.getElementById('demoIframe');
const demoModalTitle = document.getElementById('demoModalTitle');

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

// ========================================
// Demo Logic - MOBILE FIXED
// ========================================
function openDemoModal(demoPath, title) {
  // Open full screen in new tab on mobile
  if (window.innerWidth <= 768) {
    window.open(demoPath, '_blank');
    return;
  }

  // Desktop: Show Phone Modal
  demoModalTitle.textContent = title || 'System Demo';
  demoModal.classList.add('active');
  demoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (lenis) lenis.stop();

  demoScan.classList.add('active');
  demoPhone.classList.remove('active');

  setTimeout(() => {
    demoScan.classList.remove('active');
    demoPhone.classList.add('active');
    demoIframe.src = demoPath;
  }, 1500);
}

function closeDemoModal() {
  demoModal.classList.remove('active');
  demoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lenis) lenis.start();

  demoIframe.src = 'about:blank';
  demoScan.classList.remove('active');
  demoPhone.classList.remove('active');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && demoModal.classList.contains('active')) {
    closeDemoModal();
  }
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
    '.section-header, .problem-card, .system-card, .how-it-works-step, ' +
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

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});
