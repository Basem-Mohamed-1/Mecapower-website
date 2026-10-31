import './styles.css';
import { slides, services, imageSlots } from './data/site.js';
import { projects } from './data/projects.js';
import { arrow, headerMarkup, footerMarkup, whatsappButtonMarkup, stickyWhatsAppMarkup, contactFormMarkup, initSiteShell } from './components/site-shell.js';
const projectCards = () => projects.map((p, i) => `<article class="project-card"><div class="project-image image-slot"><img src="${p.image}" alt="" loading="lazy" onerror="this.style.display='none'"><span class="project-index">${String(i + 1).padStart(2, '0')}</span><span class="image-slot-label">PROJECT PHOTO ${String(i + 1).padStart(2, '0')}</span><span class="project-open" aria-hidden="true">${arrow}</span></div><h3>${p.name}</h3><p>${p.type}</p></article>`).join('');

document.querySelector('#app').innerHTML = `
  ${headerMarkup('home')}
  <main>
    <section class="hero" id="home" aria-roledescription="carousel" aria-label="Ultra introduction">
      <div class="hero-media"><img src="${slides[0].image}" alt="${slides[0].alt}" onerror="this.style.display='none'" /></div><div class="hero-shade"></div>
      <div class="hero-content">
        <p class="eyebrow"><span class="eyebrow-line"></span><span class="slide-eyebrow"></span></p>
        <h1 class="slide-title"></h1>
        <div class="hero-bottom-row"><p class="hero-copy slide-copy"></p><div class="hero-actions"><a class="button button-light" href="#projects">Explore our work ${arrow}</a>${whatsappButtonMarkup('Chat on WhatsApp')}</div></div>
      </div>
      <div class="hero-footer"><span class="hero-note">MEP ENGINEERING · EGYPT</span>
        <div class="carousel-controls"><button class="slide-prev" aria-label="Previous slide">←</button><div class="slide-dots" role="tablist" aria-label="Choose hero slide"></div><button class="slide-next" aria-label="Next slide">→</button></div>
        <span class="slide-count"><b>01</b><i>/</i>03</span>
      </div>
      <div class="hero-index">M</div>
    </section>

    <section class="intro section-pad" id="about">
      <div class="section-kicker"><span>01 / WHO WE ARE</span><span>ENGINEERED AROUND PEOPLE</span></div>
      <div class="intro-card image-slot reveal"><img src="${imageSlots.intro}" alt="" loading="lazy" onerror="this.style.display='none'"><div class="intro-card-shade"></div><div class="intro-grid"><h2>We make buildings <em>work better.</em></h2><div class="intro-text"><p>Ultra is an MEP construction and engineering company delivering the essential systems that make spaces comfortable, safe, and ready for what’s next.</p><a class="text-link" href="/about">Get to know us ${arrow}</a></div></div><span class="image-slot-label">INTRO IMAGE · intro.jpg</span></div>
      <div class="stats"><div><strong><span class="stat-value" data-target="18" data-digits="2">18</span><span>+</span></strong><small>YEARS OF EXPERIENCE</small></div><div><strong><span class="stat-value" data-target="120" data-digits="3">120</span><span>+</span></strong><small>PROJECTS DELIVERED</small></div><div><strong><span class="stat-value" data-target="4" data-digits="2">04</span></strong><small>CORE MEP DISCIPLINES</small></div><div><strong><span class="stat-value" data-target="1" data-digits="2">01</span></strong><small>CONNECTED TEAM</small></div></div>
    </section>

    <section class="services section-pad" id="services"><div class="section-kicker"><span>02 / WHAT WE DO</span><span>ONE CONNECTED APPROACH</span></div><div class="services-head"><h2>Good engineering.<br><em>Seamless delivery.</em></h2><p>From the first drawing to the final switch-on, every detail is considered, coordinated, and cared for.</p></div>
      <div class="service-grid">${services.map(s => `<article class="service-card image-slot"><img src="${s.image}" alt="" loading="lazy" onerror="this.style.display='none'"><div class="service-card-wash"></div><div class="service-card-copy"><span class="service-number">${s.number} / MEP SERVICES</span><h3>${s.title}</h3><p>${s.copy}</p><span class="service-card-arrow" aria-hidden="true">${arrow}</span></div><span class="image-slot-label">SERVICE IMAGE · ${s.image.split('/').pop()}</span></article>`).join('')}</div>
    </section>

    <section class="feature" id="approach"><div class="feature-image image-slot"><img src="${imageSlots.feature}" alt="" loading="lazy" onerror="this.style.display='none'"/><span class="image-slot-label">APPROACH IMAGE · approach.jpg</span></div><div class="feature-copy"><div class="section-kicker"><span>03 / HOW WE WORK</span><span>BUILT ON CLARITY</span></div><p class="eyebrow"><span class="eyebrow-line"></span>OUR APPROACH</p><h2>Complex systems.<br><em>Clear thinking.</em></h2><p class="feature-body">Great MEP work is felt in the comfort of a room and the confidence of a client. Our teams bring disciplines together early, solve challenges openly, and stay accountable through every stage.</p><a class="text-link" href="#contact">Work with our team ${arrow}</a></div></section>

    <section class="clients section-pad" id="clients"><div class="section-kicker"><span>CLIENTS & PARTNERS</span><span>LOGOS TO BE ADDED</span></div><div class="client-grid">${imageSlots.clients.map((src,i) => `<div class="client-image image-slot"><img src="${src}" alt="" loading="lazy" onerror="this.style.display='none'"/><span class="image-slot-label">CLIENT LOGO 0${i+1}</span></div>`).join('')}</div></section>

    <section class="projects section-pad" id="projects"><div class="section-kicker"><span>04 / SELECTED WORK</span><span>MADE TO MOVE LIFE FORWARD</span></div><div class="projects-heading"><h2>Spaces we help<br><em>bring to life.</em></h2><a class="text-link" href="/projects">View all projects ${arrow}</a></div><div class="project-carousel" role="region" aria-label="Selected projects" tabindex="0"><div class="project-track"><div class="project-track-group">${projectCards()}</div><div class="project-track-group" aria-hidden="true">${projectCards()}</div></div></div></section>

    <section class="contact section-pad" id="contact"><div class="section-kicker"><span>05 / START A CONVERSATION</span><span>CAIRO · EGYPT</span></div><div class="contact-layout"><div class="contact-inner"><p class="eyebrow"><span class="eyebrow-line"></span>HAVE A PROJECT IN MIND?</p><h2>Let's build<br><em>what's next.</em></h2><p class="contact-intro">Tell us a little about what you need and our team will get back to you.</p></div>${contactFormMarkup()}</div><div class="contact-orbit" aria-hidden="true"></div></section>
  </main>
  ${stickyWhatsAppMarkup()}
  ${footerMarkup('home')}
`;

initSiteShell();

if (window.location.pathname.replace(/\/+$/, '') === '/contact') {
  window.requestAnimationFrame(() => document.querySelector('#contact')?.scrollIntoView({ block: 'start' }));
}

let active = 0;
let timer;
const title = document.querySelector('.slide-title');
const media = document.querySelector('.hero-media');
const dots = document.querySelector('.slide-dots');
dots.innerHTML = slides.map((_, i) => `<button role="tab" aria-label="Slide ${i + 1}" aria-selected="false"></button>`).join('');
const dotButtons = [...dots.querySelectorAll('button')];
function showSlide(index, animate = true) {
  active = (index + slides.length) % slides.length;
  const slide = slides[active];
  const hero = document.querySelector('.hero');
  if (animate) hero.classList.add('is-changing');
  window.setTimeout(() => {
    title.innerHTML = slide.title.replace('\n', '<br>');
    const slideImage = media.querySelector('img');
    slideImage.src = slide.image;
    slideImage.alt = slide.alt;
    document.querySelector('.slide-eyebrow').textContent = slide.eyebrow;
    document.querySelector('.slide-copy').textContent = slide.description;
    document.querySelector('.slide-count b').textContent = slide.number;
    dotButtons.forEach((dot, i) => { dot.setAttribute('aria-selected', String(i === active)); dot.classList.toggle('active', i === active); });
    hero.classList.remove('is-changing');
  }, animate ? 240 : 0);
}
function restartTimer() { clearInterval(timer); timer = setInterval(() => showSlide(active + 1), 6500); }
showSlide(0, false); restartTimer();
document.querySelector('.slide-prev').addEventListener('click', () => { showSlide(active - 1); restartTimer(); });
document.querySelector('.slide-next').addEventListener('click', () => { showSlide(active + 1); restartTimer(); });
dotButtons.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); restartTimer(); }));

const projectCarousel = document.querySelector('.project-carousel');
const projectTrack = document.querySelector('.project-track');
let projectDrag = null;
projectCarousel.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  projectDrag = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: projectCarousel.scrollLeft, distance: 0 };
  projectTrack.style.animationPlayState = 'paused';
  projectCarousel.classList.add('is-dragging');
  projectCarousel.setPointerCapture(event.pointerId);
});
projectCarousel.addEventListener('pointermove', event => {
  if (!projectDrag || projectDrag.pointerId !== event.pointerId) return;
  const delta = event.clientX - projectDrag.startX;
  projectDrag.distance = Math.max(projectDrag.distance, Math.abs(delta));
  if (projectDrag.distance > 4) projectCarousel.scrollLeft = projectDrag.startScrollLeft - delta;
});
function finishProjectDrag() {
  if (!projectDrag) return;
  projectTrack.style.animationPlayState = '';
  projectCarousel.classList.remove('is-hovering');
  projectCarousel.classList.remove('is-dragging');
  projectDrag = null;
}
projectCarousel.addEventListener('pointerup', event => {
  if (projectDrag && projectDrag.pointerId === event.pointerId) finishProjectDrag();
});
projectCarousel.addEventListener('pointercancel', finishProjectDrag);
projectCarousel.addEventListener('lostpointercapture', finishProjectDrag);
projectCarousel.addEventListener('wheel', event => {
  const horizontalDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
  if (!horizontalDelta) return;
  event.preventDefault();
  projectCarousel.classList.remove('is-hovering');
  projectTrack.style.animationPlayState = '';
  projectCarousel.scrollLeft += horizontalDelta;
}, { passive: false });
projectCarousel.addEventListener('pointerenter', () => projectCarousel.classList.add('is-hovering'));
projectCarousel.addEventListener('pointerleave', () => {
  projectCarousel.classList.remove('is-hovering');
  if (!projectDrag) projectTrack.style.animationPlayState = '';
});

let statsCounted = false;
function countStats() {
  if (statsCounted) return;
  statsCounted = true;
  const values = [...document.querySelectorAll('.stat-value')];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    values.forEach(value => { value.textContent = Number(value.dataset.target).toLocaleString('en-US').padStart(Number(value.dataset.digits), '0'); });
    return;
  }
  values.forEach(value => { value.textContent = '0'.padStart(Number(value.dataset.digits), '0'); });
  const duration = 1600;
  const start = performance.now();
  function frame(now) {
    const finished = values.every((value, index) => {
      const target = Number(value.dataset.target);
      const digits = Number(value.dataset.digits);
      const progress = Math.min(1, Math.max(0, (now - start - index * 110) / duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      value.textContent = Math.floor(target * eased).toLocaleString('en-US').padStart(digits, '0');
      return progress === 1;
    });
    if (!finished) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.unobserve(entry.target);
}), { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.intro, .services, .feature, .clients, .projects, .contact, .section-kicker, .intro-card, .intro-grid, .service-card, .feature-copy > *, .projects-heading, .project-card, .contact-inner')
  .forEach(el => {
    if (el.closest('[aria-hidden="true"]')) return;
    el.classList.add(el.matches('section') ? 'section-reveal' : 'reveal');
    reveal.observe(el);
  });

const statsObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) {
    countStats();
    statsObserver.disconnect();
  }
}, { threshold: 0.15 });
statsObserver.observe(document.querySelector('.stats'));
