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

  // ============ GOOGLE SHEETS SCRIPT URL ============
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxF8X7daVKwr1KhQYv6xbvo7A-UbjS5INuGZThe4Z3TFl5HfgcYtoS7fIW4kkIuf6D0gQ/exec";

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

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ============ HEADER SCROLL EFFECT ============
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
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
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      carCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          setTimeout(() => card.classList.add('visible'), 50);
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
      if (inputCar) {
        inputCar.value = carName;
        inputCar.style.borderColor = '#4CAF50';
        setTimeout(() => { inputCar.style.borderColor = ''; }, 2000);
      }
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

  const formInputs = [
    { input: 'inputName',      error: 'errorName',      validate: v => v.trim().length >= 2 },
    { input: 'inputEmail',     error: 'errorEmail',     validate: v => validateEmail(v) },
    { input: 'inputPhone',     error: 'errorPhone',     validate: v => v.replace(/\s/g, '').length >= 8 },
    { input: 'inputCar',       error: 'errorCar',       validate: v => v !== '' },
    { input: 'inputDateStart', error: 'errorDateStart', validate: v => v !== '' },
    { input: 'inputDateEnd',   error: 'errorDateEnd',   validate: v => v !== '' },
  ];

  // Real-time validation
  formInputs.forEach(({ input, error, validate }) => {
    const el = document.getElementById(input);
    if (el) {
      ['input', 'change'].forEach(evt => {
        el.addEventListener(evt, () => {
          if (validate(el.value)) clearError(input, error);
        });
      });
    }
  });

  // ============ FORM SUBMIT → GOOGLE SHEETS ============
  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear all errors
      formInputs.forEach(({ input, error }) => clearError(input, error));

      // Validate all fields
      formInputs.forEach(({ input, error, validate }) => {
        const el = document.getElementById(input);
        if (el && !validate(el.value)) {
          showError(input, error);
          isValid = false;
        }
      });

      // Check end date >= start date
      if (inputDateStart.value && inputDateEnd.value) {
        if (inputDateEnd.value < inputDateStart.value) {
          showError('inputDateEnd', 'errorDateEnd');
          isValid = false;
        }
      }

      if (!isValid) return;

      // Collect form data
      const formData = {
        name:      document.getElementById('inputName').value.trim(),
        email:     document.getElementById('inputEmail').value.trim(),
        phone:     document.getElementById('inputPhone').value.trim(),
        car:       document.getElementById('inputCar').value,
        dateStart: document.getElementById('inputDateStart').value,
        dateEnd:   document.getElementById('inputDateEnd').value,
      };

      // Disable submit button to avoid double submit
      const submitBtn = reservationForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      // Send to Google Sheets
      fetch(SCRIPT_URL, {
        method: 'POST',
        body: new URLSearchParams(formData),
      })
        .then(() => {
          // Show success modal
          successModal.classList.add('show');
          document.body.style.overflow = 'hidden';
          reservationForm.reset();
        })
        .catch(() => {
          alert('Erreur lors de l\'envoi. Veuillez réessayer.');
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Réserver';
          }
        });
    });
  }

  // ============ MODAL CLOSE ============
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      successModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

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
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const siblingIndex = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, siblingIndex * 100);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============ SMOOTH SCROLL ============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ============ COUNTER ANIMATION (Hero Stats) ============
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
