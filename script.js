const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

/* ---------- Page transition (curtain) ---------- */
const overlay = document.getElementById('page-transition');
if(overlay){
  requestAnimationFrame(()=>{
    setTimeout(()=> overlay.classList.add('hide'), 60);
  });

  document.querySelectorAll('a[href]').forEach(link=>{
    const href = link.getAttribute('href');
    if(!href) return;
    const isInternalPage = /^[a-zA-Z0-9_-]+\.html$/.test(href);
    if(!isInternalPage || link.target === '_blank') return;
    link.addEventListener('click', (e)=>{
      e.preventDefault();
      overlay.classList.remove('hide');
      setTimeout(()=>{ window.location.href = href; }, 380);
    });
  });
}

/* ---------- Scroll progress bar ---------- */
const progressBar = document.getElementById('scroll-progress');
if(progressBar){
  const updateProgress = ()=>{
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .15 });
revealEls.forEach(el=>revealObserver.observe(el));

/* ---------- Card tilt (magnetic) ---------- */
if(!isTouch && !reduceMotion){
  document.querySelectorAll('.card, .cta-banner').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -5;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
    });
  });
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-question').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    document.querySelectorAll('.faq-item.open').forEach(openItem=>{
      if(openItem !== item){
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      }
    });
    item.classList.toggle('open');
    answer.style.maxHeight = item.classList.contains('open') ? answer.scrollHeight + 'px' : null;
  });
});

/* ---------- Hero browser build animation (home page only) ---------- */
const browserEl = document.getElementById('hero-browser');
if(browserEl){
  const skeleton = browserEl.querySelector('.skeleton-wrap');
  const built = browserEl.querySelector('.built-content');
  const check = browserEl.querySelector('.bc-check');
  const titleEl = document.getElementById('bc-title-text');
  const titlePhrases = ['Feito para vender.', 'Feito para converter.', 'Feito para crescer.', 'Feito para impressionar.'];

  function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }

  async function typeText(el, text, speed){
    for(let i=0;i<=text.length;i++){
      el.textContent = text.slice(0, i);
      await wait(speed);
    }
  }

  async function eraseText(el, speed){
    const text = el.textContent;
    for(let i=text.length;i>=0;i--){
      el.textContent = text.slice(0, i);
      await wait(speed);
    }
  }

  async function titleLoop(){
    if(!titleEl) return;
    let i = 1;
    while(true){
      await wait(2200);
      await eraseText(titleEl, 28);
      await wait(250);
      await typeText(titleEl, titlePhrases[i % titlePhrases.length], 45);
      i++;
    }
  }

  function reveal(){
    if(reduceMotion){
      if(skeleton) skeleton.style.display='none';
      if(built) built.classList.add('show');
      if(check) check.classList.add('show');
      return;
    }
    setTimeout(()=>{
      if(skeleton){ skeleton.style.opacity='0'; skeleton.style.transition='opacity .4s ease'; }
      setTimeout(()=>{
        if(skeleton) skeleton.style.display='none';
        if(built) built.classList.add('show');
        setTimeout(()=>{ if(check) check.classList.add('show'); }, 350);
        titleLoop();
      }, 400);
    }, 1400);
  }

  const bObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        reveal();
        bObserver.disconnect();
      }
    });
  }, { threshold:.3 });
  bObserver.observe(browserEl);
}

/* ---------- Animated counters (data-count elements) ---------- */
const counters = document.querySelectorAll('[data-count]');
if(counters.length){
  const countObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if(reduceMotion){
        el.textContent = target + suffix;
      } else {
        let start = 0;
        const duration = 1400;
        const startTime = performance.now();
        function tick(now){
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if(progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      countObserver.unobserve(el);
    });
  }, { threshold:.5 });
  counters.forEach(el=>countObserver.observe(el));
}

/* ---------- Contact form (static demo submit) ---------- */
const contactForm = document.getElementById('contact-form');
if(contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-primary');
    btn.textContent = 'Mensagem enviada ✓';
    btn.style.opacity = '.85';
  });
}

/* ---------- PORTFOLIO SPOTLIGHT (flagship fixo + destaque sutil nos demais) ---------- */
/* O primeiro card real (Auto Escola Colibri) fica sempre grande, fixo no topo — evitar
   trocar QUAL card é o "featured" evita o reflow de layout que isso causava na página. */
const portfolioCards = document.querySelectorAll('.portfolio-card');
const portfolioGrid = document.querySelector('.portfolio-grid');

if(portfolioCards.length > 1) {
  let currentIndex = 1;
  let isPaused = false;

  function updateSpotlight() {
    portfolioCards.forEach((card, index) => {
      if (index === 0) return; // card principal: sempre featured, nunca muda de tamanho
      card.classList.toggle('spotlight', index === currentIndex);
    });
  }

  updateSpotlight();

  setInterval(() => {
    if (isPaused) return;
    currentIndex++;
    if (currentIndex >= portfolioCards.length) currentIndex = 1;
    updateSpotlight();
  }, 6000);

  if(portfolioGrid) {
    portfolioGrid.addEventListener('mouseenter', () => isPaused = true);
    portfolioGrid.addEventListener('mouseleave', () => isPaused = false);
  }
}
/* ---------- SCROLL TO TOP BUTTON ---------- */
const scrollTopBtn = document.getElementById('scroll-top-btn');
if(scrollTopBtn){
  const toggleScrollBtn = ()=>{
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    if(scrollTop > 500){
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  };
  document.addEventListener('scroll', toggleScrollBtn, { passive: true });
  toggleScrollBtn();
  scrollTopBtn.addEventListener('click', ()=>{
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}