/* ============================================
   RedDrive — JavaScript Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============ ELEMENTS ============
  const header = document.getElementById('header');
  const themeToggle = document.getElementById('themeToggle');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const reservationForm = document.getElementById('reservationForm');
  const successModal = document.getElementById('successModal');
  const closeModal = document.getElementById('closeModal');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const carCards = document.querySelectorAll('.car-card');
  const reserveBtns = document.querySelectorAll('.btn-reserve');
  const inputCar = document.getElementById('inputCar');
  const inputDateStart = document.getElementById('inputDateStart');
  const inputDateEnd = document.getElementById('inputDateEnd');

  // ============ THEME (Dark / Light) ============
  const savedTheme = localStorage.getItem('reddrive-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('reddrive-theme', next);
  });

  // ============ MOBILE MENU ============
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ============ HEADER SCROLL EFFECT ============
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ============ ACTIVE NAV LINK ON SCROLL ============
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === `#${id}`) {
            a.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // ============ CAR FILTERS ============
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active filter button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      carCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          // Re-trigger reveal animation
          setTimeout(() => {
            card.classList.add('visible');
          }, 50);
        } else {
          card.style.display = 'none';
          card.classList.remove('visible');
        }
      });
    });
  });

  // ============ RESERVE BUTTON → AUTO-SELECT CAR ============
  reserveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const carName = btn.getAttribute('data-car');

      // Set selected car in the form
      if (inputCar) {
        inputCar.value = carName;
        // Visual feedback on the select
        inputCar.style.borderColor = '#4CAF50';
        setTimeout(() => {
          inputCar.style.borderColor = '';
        }, 2000);
      }

      // Scroll to reservation section
      const reservationSection = document.getElementById('reservation');
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============ SET MIN DATES ============
  const today = new Date().toISOString().split('T')[0];
  if (inputDateStart) inputDateStart.setAttribute('min', today);
  if (inputDateEnd) inputDateEnd.setAttribute('min', today);

  // When start date changes, update end date minimum
  if (inputDateStart) {
    inputDateStart.addEventListener('change', () => {
      if (inputDateEnd) {
        inputDateEnd.setAttribute('min', inputDateStart.value);
        if (inputDateEnd.value && inputDateEnd.value < inputDateStart.value) {
          inputDateEnd.value = inputDateStart.value;
        }
      }
    });
  }

  // ============ FORM VALIDATION ============
  function showError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (error) error.classList.add('visible');
  }

  function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (error) error.classList.remove('visible');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Real-time validation feedback
  const formInputs = [
    { input: 'inputName', error: 'errorName', validate: v => v.trim().length >= 2 },
    { input: 'inputEmail', error: 'errorEmail', validate: v => validateEmail(v) },
    { input: 'inputDateStart', error: 'errorDateStart', validate: v => v !== '' },
    { input: 'inputDateEnd', error: 'errorDateEnd', validate: v => v !== '' },
    { input: 'inputCar', error: 'errorCar', validate: v => v !== '' },
    { input: 'inputPhone', error: 'errorPhone', validate: v => v.replace(/\s/g, '').length >= 8 },
  ];

  formInputs.forEach(({ input, error, validate }) => {
    const el = document.getElementById(input);
    if (el) {
      el.addEventListener('input', () => {
        if (validate(el.value)) {
          clearError(input, error);
        }
      });
      el.addEventListener('change', () => {
        if (validate(el.value)) {
          clearError(input, error);
        }
      });
    }
  });

  // Form submit
  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear all errors first
      formInputs.forEach(({ input, error }) => clearError(input, error));

      // Validate each field
      formInputs.forEach(({ input, error, validate }) => {
        const el = document.getElementById(input);
        if (el && !validate(el.value)) {
          showError(input, error);
          isValid = false;
        }
      });

      // Check end date > start date
      if (inputDateStart.value && inputDateEnd.value) {
        if (inputDateEnd.value < inputDateStart.value) {
          showError('inputDateEnd', 'errorDateEnd');
          isValid = false;
        }
      }

      if (isValid) {
        // Gather form data
        const name = document.getElementById('inputName').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const dateStart = document.getElementById('inputDateStart').value;
        const dateEnd = document.getElementById('inputDateEnd').value;
        const car = document.getElementById('inputCar').value;
        const phone = document.getElementById('inputPhone').value.trim();

        // Build WhatsApp message
        const whatsappNumber = '212625596851';
        let whatsappMessage = `🚗 *Nouvelle Réservation RedDrive*\n\n`;
        whatsappMessage += `👤 *Nom complet :* ${name}\n`;
        whatsappMessage += `📧 *Email :* ${email}\n`;
        whatsappMessage += `📱 *Téléphone :* ${phone}\n`;
        whatsappMessage += `📅 *Date de début :* ${dateStart}\n`;
        whatsappMessage += `📅 *Date de fin :* ${dateEnd}\n`;
        whatsappMessage += `🚘 *Voiture :* ${car}\n`;
        whatsappMessage += `\n_Envoyé depuis le site RedDrive_`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        // Open WhatsApp directly
        window.open(whatsappURL, '_blank');

        // Show success modal
        successModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Reset form
        reservationForm.reset();
      } else {
        // Scroll to first error
        const firstError = reservationForm.querySelector('.form-control.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });
  }

  // Close modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      successModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  // Close modal on overlay click
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // ============ SCROLL REVEAL ANIMATIONS ============
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation based on index within the same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const siblingIndex = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, siblingIndex * 100);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============ SMOOTH SCROLL FOR ALL ANCHOR LINKS ============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============ COUNTER ANIMATION (Hero Stats) ============
  function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
    }, 25);
  }

  const heroStats = document.querySelectorAll('.hero-stat .number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        heroStats.forEach(stat => {
          const text = stat.textContent;
          const num = parseInt(text);
          const suffix = text.replace(/[\d]/g, '');
          if (!isNaN(num)) {
            stat.innerHTML = '0' + `<span>${suffix}</span>`;
            let current = 0;
            const increment = num / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= num) {
                current = num;
                clearInterval(timer);
              }
              stat.innerHTML = Math.floor(current) + `<span>${suffix}</span>`;
            }, 30);
          }
        });
      }
    });
  }, { threshold: 0.5 });

  if (heroStats.length > 0) {
    statsObserver.observe(heroStats[0].closest('.hero-stats'));
  }

});
