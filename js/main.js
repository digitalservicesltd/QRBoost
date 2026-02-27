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
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like smooth scroll
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false, // Explicitly disable on touch
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

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
const contactForm = document.getElementById('contactForm');
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
    if(preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }
    initAnimations(); // Start animations only after load
    initCounters();
  }, 1000); // 1 second luxury loading delay
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
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = navbar.offsetHeight + 20;
      
      if (lenis) {
        // Desktop Lenis Scroll
        lenis.scrollTo(target, { offset: -offset });
      } else {
        // Mobile Native Smooth Scroll
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
  console.log('Opening demo:', demoPath);
  
  // FIXED FOR MOBILE: Open full screen in new tab if screen is small
  if (window.innerWidth <= 768) {
    window.open(demoPath, '_blank');
    return;
  }
  
  // Desktop Logic: Show Phone Modal
  demoModalTitle.textContent = title || 'System Demo';
  demoModal.classList.add('active');
  demoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (lenis) lenis.stop(); // Pause smooth scrolling while modal is open
  
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
  if (lenis) lenis.start(); // Resume scrolling
  
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
    '.section-header, .problem-card, .system-card, .industry-card, ' +
    '.benefit-item, .stats-card, .cta-box, .pricing-card, ' +
    '.testimonial-card, .founder__image-wrapper, .founder__content, .contact-form'
  );
  
  elements.forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%'
      },
      opacity: 0,
      y: 40,
      duration: 1, // Slightly sped up for better mobile response
      ease: 'power3.out', 
      delay: (i % 4) * 0.1
    });
  });
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10);
    if (isNaN(target)) return;
    
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          innerHTML: target,
          duration: 2.5,
          ease: 'power3.out',
          snap: { innerHTML: 1 }
        });
      }
    });
  });
}

// ========================================
// Contact Form Handle
// ========================================
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    const message = `Hi Pankaj! I'm interested in QRBoost.

Name: ${data.name}
Business: ${data.business}
Phone: ${data.phone}
Plan: ${data.plan || 'Not specified'}
Message: ${data.message || 'None'}`;
    
    const whatsappURL = `https://wa.me/918219928236?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    const btn = contactForm.querySelector('.btn--submit');
    const originalText = btn.querySelector('.btn-text').textContent;
    btn.querySelector('.btn-text').textContent = 'Opening WhatsApp...';
    
    setTimeout(() => {
      btn.querySelector('.btn-text').textContent = originalText;
      contactForm.reset();
    }, 2000);
  });
}

if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => { 
  ScrollTrigger.refresh(); 
});
