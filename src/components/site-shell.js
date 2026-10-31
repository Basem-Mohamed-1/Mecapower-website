import { whatsappNumber, socialLinks } from '../data/site.js';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';

export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const [whatsappWidth, whatsappHeight, , , whatsappPathData] = faWhatsapp.icon;
const whatsappPaths = (Array.isArray(whatsappPathData) ? whatsappPathData : [whatsappPathData])
  .map(path => `<path fill="currentColor" d="${path}"/>`).join('');
const whatsappIcon = `<svg class="whatsapp-brand-icon" viewBox="0 0 ${whatsappWidth} ${whatsappHeight}" aria-hidden="true" focusable="false">${whatsappPaths}</svg>`;

export function contactFormMarkup() {
  return `<form class="contact-form" data-contact-form>
    <div class="contact-form-fields">
      <label>Full name<input name="fullName" type="text" autocomplete="name" maxlength="100" required></label>
      <label>Phone number<input name="phoneNumber" type="tel" autocomplete="tel" maxlength="30" pattern="[+()0-9.\\s-]{7,30}" required></label>
      <label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
      <label>Service required<select name="serviceRequired" required><option value="" disabled selected>Select a service</option><option>Project Execution</option><option>Project design</option><option>Design and execution</option></select></label>
    </div>
    <div class="contact-form-submit"><p class="contact-form-status" data-contact-status role="status" aria-live="polite"></p><button class="button button-light" type="submit">Send request ${arrow}</button></div>
  </form>`;
}

const logo = '<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span class="brand-name">ULTRA<small>MEP ENGINEERING</small></span>';

export function headerMarkup(page = 'home') {
  const home = page === 'home' ? '' : '/';
  const contact = page === 'home' ? '#contact' : '/contact';
  return `<header class="site-header">
    <a class="brand" href="${home}#home" aria-label="Ultra home">${logo}</a>
    <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
    <nav class="main-nav" aria-label="Main navigation">
      <a href="${home}#home">Home</a><a href="/about"${page === 'about' ? ' aria-current="page"' : ''}>About</a><a href="/services"${page === 'services' ? ' aria-current="page"' : ''}>Services</a><a href="/projects"${page === 'projects' ? ' aria-current="page"' : ''}>Projects</a><a href="/approach"${page === 'approach' ? ' aria-current="page"' : ''}>Approach</a>
      <a class="nav-contact" href="${contact}">Let's talk ${arrow}</a>
    </nav>
  </header>`;
}

export function footerMarkup(page = 'home') {
  const home = page === 'home' ? '' : '/';
  const contact = page === 'home' ? '#contact' : '/contact';
  return `<footer class="footer">
    <div class="footer-top">
      <a class="brand" href="${home}#home" aria-label="Ultra home">${logo}</a>
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="${home}#home">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/projects">Projects</a><a href="/approach">Approach</a><a href="${contact}">Contact</a>
      </nav>
      <div class="footer-social"><span>FOLLOW US</span>
        <a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Ultra on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.1H7v3.2h2.8V21h3.7Z" fill="currentColor"/></svg></a>
        <a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Ultra on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.7" cy="6.7" r="1" fill="currentColor"/></svg></a>
        <a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Ultra on WhatsApp">${whatsappIcon}</a>
      </div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Ultra. All rights reserved.</span><a href="${home}#home" class="back-top">BACK TO TOP ↑</a></div>
  </footer>`;
}

export function whatsappButtonMarkup(label = 'Chat on WhatsApp') {
  return `<a class="button button-whatsapp" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer" aria-label="${label}">
    ${whatsappIcon}
    <span>${label}</span>
  </a>`;
}

export function stickyWhatsAppMarkup() {
  return `<a class="whatsapp-sticky" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer" aria-label="I want more information on WhatsApp">
    <span>I want more information</span>${whatsappIcon}
  </a>`;
}

export function initSiteShell() {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));

  document.querySelectorAll('[data-contact-form]').forEach(form => {
    const submit = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-contact-status]');
    const defaultButtonMarkup = submit.innerHTML;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity() || submit.disabled) return;

      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.textContent = '';
      status.classList.remove('is-error', 'is-success');

      try {
        const formData = new FormData(form);
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData)),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || 'We could not send your request. Please try again.');

        form.reset();
        status.textContent = result?.message || 'Thank you. Your request has been received.';
        status.classList.add('is-success');
      } catch (error) {
        status.textContent = error instanceof TypeError
          ? 'We could not reach the server. Please try again in a moment.'
          : error.message;
        status.classList.add('is-error');
      } finally {
        submit.disabled = false;
        submit.innerHTML = defaultButtonMarkup;
      }
    });
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      document.querySelector('.site-header').classList.toggle('is-scrolled', window.scrollY > 36);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}
