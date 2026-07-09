/* =========================================================
   THEME — system / light / dark, persisted
   ========================================================= */
const html = document.documentElement;

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredTheme() {
  return localStorage.getItem('theme'); // 'light' | 'dark' | null (system)
}

function currentChoice() {
  return getStoredTheme() || 'system';
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === null && systemPrefersDark());
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

function updateThemeSwitchUI() {
  const choice = currentChoice();
  document.querySelectorAll('.theme-switch__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeChoice === choice);
  });
}

function setThemeChoice(choice) {
  if (choice === 'system') {
    localStorage.removeItem('theme');
    applyTheme(null);
  } else {
    localStorage.setItem('theme', choice);
    applyTheme(choice);
  }
  updateThemeSwitchUI();
}

applyTheme(getStoredTheme());
updateThemeSwitchUI();

document.querySelectorAll('.theme-switch__btn').forEach(btn => {
  btn.addEventListener('click', () => setThemeChoice(btn.dataset.themeChoice));
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!getStoredTheme()) {
    applyTheme(null);
    updateThemeSwitchUI();
  }
});

/* =========================================================
   MOBILE MENU
   ========================================================= */
const menuToggle = document.getElementById('menu-toggle');
const menuIcon = document.getElementById('menu-icon');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  mobileMenu.classList.remove('show');
  menuIcon.classList.remove('bx-x');
  menuIcon.classList.add('bx-menu');
  document.body.classList.remove('no-scroll');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('show');
  menuIcon.classList.toggle('bx-menu', !isOpen);
  menuIcon.classList.toggle('bx-x', isOpen);
  document.body.classList.toggle('no-scroll', isOpen);
});

document.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

/* =========================================================
   SCROLL — active nav link
   ========================================================= */
const sections = document.querySelectorAll('main section[id]');
const sidebarLinks = document.querySelectorAll('.sidebar__link');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');

function setActiveNav() {
  const scrollY = window.pageYOffset;
  let currentId = sections[0]?.id;

  sections.forEach(section => {
    const top = section.offsetTop - 140;
    if (scrollY >= top) currentId = section.id;
  });

  [...sidebarLinks, ...mobileLinks].forEach(link => {
    link.classList.toggle('active', link.dataset.section === currentId);
  });
}
window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), i * 40);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* =========================================================
   PROJECT MODAL
   ========================================================= */
const modal = document.getElementById('project-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalGithub = document.getElementById('modal-github');
const modalWeb = document.getElementById('modal-web');
const modalClose = document.getElementById('modal-close');

function openModal(card) {
  const { img, title, github, web } = card.dataset;
  modalImg.src = img;
  modalImg.alt = title;
  modalTitle.textContent = title;

  if (github) {
    modalGithub.href = github;
    modalGithub.style.display = 'inline-flex';
  } else {
    modalGithub.style.display = 'none';
  }

  if (web) {
    modalWeb.href = web;
    modalWeb.style.display = 'inline-flex';
  } else {
    modalWeb.style.display = 'none';
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

document.querySelectorAll('.proj__card').forEach(card => {
  card.addEventListener('click', () => openModal(card));
});
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* =========================================================
   PROJECT FILTER
   ========================================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projCards = document.querySelectorAll('.proj__card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    projCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* =========================================================
   CONTACT FORM — Formspree
   ========================================================= */
const FORMSPREE_FORM_ID = 'xvzyznyo';
const contactForm = document.getElementById('contact-form');
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastTitle = document.getElementById('toast-title');
const toastDesc = document.getElementById('toast-desc');

let toastTimer;
function showToast(state, title, desc) {
  toastIcon.className = 'toast__icon bx ' + (
    state === 'loading' ? 'bx-loader-alt bx-spin' :
    state === 'success' ? 'bx-check-circle' : 'bx-error-circle'
  );
  toastTitle.textContent = title;
  toastDesc.textContent = desc;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  if (state !== 'loading') {
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }
}

contactForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  if (!name || !email || !subject || !message) return;

  const submitBtn = contactForm.querySelector('.submit-btn');
  const originalHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Sending...";

  showToast('loading', 'Sending message...', 'Connecting to server.');

  fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
    method: 'POST',
    body: JSON.stringify({ name, email, subject, message }),
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
  })
    .then(res => {
      if (res.ok) {
        showToast('success', 'Message sent!', 'Thank you — I will get back to you soon.');
        contactForm.reset();
      } else {
        throw new Error('Formspree error');
      }
    })
    .catch(() => {
      showToast('error', 'Submission failed', 'Please try again, or email me directly.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      setTimeout(() => toast.classList.remove('show'), 4000);
    });
});
