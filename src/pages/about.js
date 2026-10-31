import '../styles.css';
import { teamMembers } from '../data/team.js';
import { imageSlots } from '../data/site.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from '../components/site-shell.js';

const teamCards = teamMembers.map((person, index) => `
  <article class="team-card reveal">
    <div class="team-photo image-slot">
      <img src="${person.image}" alt="" loading="lazy" onerror="this.style.display='none'">
      <span class="image-slot-label">TEAM PHOTO ${String(index + 1).padStart(2, '0')}</span>
    </div>
    <h3>${person.name}</h3><p>${person.role}</p>
  </article>`).join('');

document.querySelector('#app').innerHTML = `
  ${headerMarkup('about')}
  <main class="about-page">
    <section class="about-intro section-pad">
      <div class="section-kicker"><span>ABOUT ULTRA</span><span>ENGINEERED AROUND PEOPLE</span></div>
      <div class="about-intro-copy"><p class="eyebrow"><span class="eyebrow-line"></span>WHO WE ARE</p><h1>Engineering the systems behind <em>everyday life.</em></h1><p class="about-description">Ultra is an MEP construction and engineering company delivering the essential building systems that make places comfortable, safe, and ready for what’s next. Our team brings mechanical, electrical, and plumbing expertise together from design and coordination through installation, testing, and handover.</p></div>
    </section>
    <section class="about-hero-card image-slot" aria-label="Ultra team and engineering approach">
      <img src="${imageSlots.aboutHero}" alt="" onerror="this.style.display='none'">
      <div class="about-hero-shade"></div>
      <div class="about-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>OUR PEOPLE, OUR PURPOSE</p><h2>Good work happens<br>when we work <em>together.</em></h2>${whatsappButtonMarkup('Contact us on WhatsApp')}</div>
      <span class="image-slot-label">ABOUT HERO · about-hero.jpg</span>
    </section>
    <section class="team-section section-pad" id="team">
      <div class="section-kicker"><span>THE PEOPLE BEHIND THE WORK</span><span>ONE CONNECTED TEAM</span></div>
      <div class="team-heading"><h2>Meet the <em>team.</em></h2><p>Our people bring the experience, care, and coordination that move every project forward.</p></div>
      <div class="team-grid">${teamCards}</div>
    </section>
    <section class="portfolio-contact section-pad"><div class="portfolio-contact-layout"><div class="portfolio-contact-copy"><p class="eyebrow"><span class="eyebrow-line"></span>LET'S WORK TOGETHER</p><h2>Build what's<br><em>next.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('about')}
`;

initSiteShell();
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.1 });
document.querySelectorAll('.about-intro-copy, .about-hero-copy, .team-section .section-kicker, .team-heading, .team-card').forEach((item, index) => {
  item.classList.add('reveal');
  item.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
  reveal.observe(item);
});
