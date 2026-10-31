import '../styles.css';
import { projects } from '../data/projects.js';
import { imageSlots } from '../data/site.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from '../components/site-shell.js';

const cards = projects.map((project, index) => `
  <article class="portfolio-card reveal">
    <div class="portfolio-image image-slot">
      <img src="${project.image}" alt="" loading="lazy" onerror="this.style.display='none'">
      <span class="project-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="image-slot-label">PROJECT PHOTO ${String(index + 1).padStart(2, '0')}</span>
    </div>
    <div class="portfolio-card-copy"><h3>${project.name}</h3><p>${project.type}</p></div>
  </article>`).join('');

document.querySelector('#app').innerHTML = `
  ${headerMarkup('projects')}
  <main class="portfolio-page">
    <section class="portfolio-hero">
      <div class="portfolio-hero-image image-slot"><img src="${imageSlots.projectsHero}" alt="" onerror="this.style.display='none'"><div class="portfolio-hero-shade"></div></div>
      <div class="portfolio-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>ULTRA · SELECTED WORK</p><h1>Projects built<br>to work better.</h1><p>Explore the places and systems made possible through thoughtful MEP engineering.</p></div>
      <div class="page-hero-actions"><a class="portfolio-hero-link" href="#project-grid">Explore our projects ${arrow}</a>${whatsappButtonMarkup('Contact us on WhatsApp')}</div>
    </section>
    <section class="portfolio-section section-pad" id="project-grid">
      <div class="section-kicker"><span>OUR PROJECTS</span><span>ENGINEERED FOR EVERYDAY LIFE</span></div>
      <div class="portfolio-heading"><h2>Selected <em>work.</em></h2><p>Each project below is a placeholder for Ultra’s project photography and details.</p></div>
      <div class="portfolio-grid">${cards}</div>
    </section>
    <section class="portfolio-contact section-pad"><div class="portfolio-contact-layout"><div class="portfolio-contact-copy"><p class="eyebrow"><span class="eyebrow-line"></span>HAVE A PROJECT IN MIND?</p><h2>Let's build<br><em>what's next.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('projects')}
`;

initSiteShell();
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.1 });
document.querySelectorAll('.portfolio-section .section-kicker, .portfolio-heading, .portfolio-card').forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
  reveal.observe(item);
});
