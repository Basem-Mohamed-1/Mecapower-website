import '../styles.css';
import { approachSteps } from '../data/approach.js';
import { imageSlots } from '../data/site.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from '../components/site-shell.js';

const cards = approachSteps.map((step, index) => `
  <article class="approach-step-card reveal">
    <img src="${step.image}" alt="" loading="lazy" onerror="this.style.display='none'">
    <div class="approach-step-shade"></div>
    <span class="approach-step-number">${String(index + 1).padStart(2, '0')}</span>
    <h2>${step.title}</h2>
    <span class="approach-step-arrow" aria-hidden="true">${arrow}</span>
    <span class="image-slot-label">PROCESS PHOTO ${String(index + 1).padStart(2, '0')}</span>
  </article>`).join('');

document.querySelector('#app').innerHTML = `
  ${headerMarkup('approach')}
  <main class="approach-page">
    <section class="approach-page-hero">
      <div class="approach-page-hero-image image-slot"><img src="${imageSlots.approachHero}" alt="" onerror="this.style.display='none'"><div class="approach-page-hero-shade"></div></div>
      <div class="approach-page-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>HOW WE WORK</p><h1>One clear process.<br><em>Better built outcomes.</em></h1><p>From the first plan to ongoing operation, we connect every stage of MEP delivery.</p></div>
      <div class="page-hero-actions"><a class="approach-page-hero-link" href="#approach-steps">Explore our approach ${arrow}</a>${whatsappButtonMarkup('Contact us on WhatsApp')}</div>
    </section>
    <section class="approach-steps-section section-pad" id="approach-steps">
      <div class="section-kicker"><span>OUR DELIVERY PROCESS</span><span>PLANNING THROUGH OPERATION</span></div>
      <div class="approach-steps-heading"><h2>Every stage,<br><em>working as one.</em></h2><p>A coordinated process helps our teams deliver dependable systems with clarity from start to finish.</p></div>
      <div class="approach-steps-grid">${cards}</div>
    </section>
    <section class="portfolio-contact section-pad"><div class="portfolio-contact-layout"><div class="portfolio-contact-copy"><p class="eyebrow"><span class="eyebrow-line"></span>LET'S WORK TOGETHER</p><h2>Build what's<br><em>next.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('approach')}
`;

initSiteShell();
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.1 });
document.querySelectorAll('.approach-steps-section .section-kicker, .approach-steps-heading, .approach-step-card').forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${(index % 3) * 100}ms`);
  reveal.observe(item);
});
