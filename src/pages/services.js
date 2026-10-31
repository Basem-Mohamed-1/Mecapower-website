import '../styles.css';
import { serviceDisciplines } from '../data/service-disciplines.js';
import { imageSlots } from '../data/site.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from '../components/site-shell.js';

const cards = serviceDisciplines.map(service => `
  <article class="service-card image-slot reveal">
    <img src="${service.image}" alt="" loading="lazy" onerror="this.style.display='none'">
    <div class="service-card-wash"></div>
    <div class="service-card-copy">
      <span class="service-number">${service.number} / MEP SERVICES</span>
      <h3>${service.title}</h3>
      <p>${service.copy}</p>
      <a class="service-card-arrow" href="/contact" aria-label="Discuss ${service.title}">${arrow}</a>
    </div>
    <span class="image-slot-label">${service.imageLabel}</span>
  </article>`).join('');

document.querySelector('#app').innerHTML = `
  ${headerMarkup('services')}
  <main class="services-page">
    <section class="service-page-hero">
      <div class="service-page-hero-image image-slot"><img src="${imageSlots.servicesHero}" alt="" onerror="this.style.display='none'"><div class="service-page-hero-shade"></div></div>
      <div class="service-page-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>WHAT WE DO</p><h1>Building systems<br>that work <em>together.</em></h1><p>Integrated MEP expertise for safer, more comfortable, better-performing spaces.</p></div>
      <div class="page-hero-actions"><a class="service-page-hero-link" href="#service-disciplines">Explore our services ${arrow}</a>${whatsappButtonMarkup('Contact us on WhatsApp')}</div>
    </section>
    <section class="service-disciplines section-pad" id="service-disciplines">
      <div class="section-kicker"><span>OUR CORE SERVICES</span><span>MECHANICAL · ELECTRICAL · PLUMBING</span></div>
      <div class="service-disciplines-heading"><h2>Expertise for every<br><em>essential system.</em></h2><p>Our teams coordinate each discipline from design through installation, testing, and handover.</p></div>
      <div class="service-discipline-grid">${cards}</div>
    </section>
    <section class="portfolio-contact section-pad"><div class="portfolio-contact-layout"><div class="portfolio-contact-copy"><p class="eyebrow"><span class="eyebrow-line"></span>HAVE A PROJECT IN MIND?</p><h2>Let's build<br><em>what's next.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('services')}
`;

initSiteShell();
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.1 });
document.querySelectorAll('.service-disciplines .section-kicker, .service-disciplines-heading, .service-discipline-grid .service-card').forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${(index % 3) * 100}ms`);
  reveal.observe(item);
});
