/* ==========================================================================
   NÚCLEO DE FUNCIONALIDADES GERAIS (Exclusivo para index.html)
   ========================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

// 1. Forçar rolagem ao topo na atualização da página
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
window.addEventListener('load', () => setTimeout(() => window.scrollTo(0, 0), 10));

// 2. Transição de página (Efeito cortina)
const overlay = document.getElementById('page-transition');
if (overlay) {
  requestAnimationFrame(() => setTimeout(() => overlay.classList.add('hide'), 60));
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !/^[a-zA-Z0-9_-]+\.html$/.test(href) || link.target === '_blank') return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.remove('hide');
      setTimeout(() => { window.location.href = href; }, 380);
    });
  });
}

// 3. Barra de progresso de scroll no topo
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// 4. Scroll Reveal (Animação ao aparecer na tela)
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .15 });
revealEls.forEach(el => revealObserver.observe(el));

// 5. Efeito magnético / Tilt nos cards (Apenas Desktop)
if (!isTouch && !reduceMotion) {
  document.querySelectorAll('.card, .cta-banner').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -5;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// 6. Acordeão do FAQ
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      }
    });
    item.classList.toggle('open');
    answer.style.maxHeight = item.classList.contains('open') ? answer.scrollHeight + 'px' : null;
  });
});

/* ==========================================================================
   PORTFÓLIO SHOWCASE SLIDER
   ========================================================================== */
const showcaseContainer = document.getElementById('portfolio-showcase');
const showcaseCards = document.querySelectorAll('.showcase-card');
const dotBtns = document.querySelectorAll('.dot-btn');
const prevBtn = document.getElementById('prev-project');
const nextBtn = document.getElementById('next-project');

if (showcaseContainer && showcaseCards.length > 0) {
  let currentSlide = 0, isPaused = false, elapsed = 0;
  const duration = 6000;
  let lastTime = performance.now(), timerRaF;

  function updateTimerUI(progress) {
    const activeDot = document.querySelector('.dot-btn.active');
    if (activeDot) activeDot.style.setProperty('--progress', `${progress * 100}%`);
  }

  function goToSlide(index) {
    currentSlide = (index + showcaseCards.length) % showcaseCards.length;
    elapsed = 0;
    showcaseCards.forEach((card, idx) => card.classList.toggle('active', idx === currentSlide));
    dotBtns.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
      dot.style.setProperty('--progress', '0%');
    });
  }

  function animateLoop(now) {
    const delta = now - lastTime;
    lastTime = now;
    if (!isPaused) {
      elapsed += delta;
      const progress = Math.min(elapsed / duration, 1);
      updateTimerUI(progress);
      if (elapsed >= duration) goToSlide(currentSlide + 1);
    }
    timerRaF = requestAnimationFrame(animateLoop);
  }

  goToSlide(0);
  lastTime = performance.now();
  timerRaF = requestAnimationFrame(animateLoop);

  showcaseContainer.addEventListener('mouseenter', () => isPaused = true);
  showcaseContainer.addEventListener('mouseleave', () => { isPaused = false; lastTime = performance.now(); });
  showcaseContainer.addEventListener('touchstart', () => isPaused = true, { passive: true });
  showcaseContainer.addEventListener('touchend', () => setTimeout(() => { isPaused = false; lastTime = performance.now(); }, 2000), { passive: true });

  dotBtns.forEach((dot, idx) => dot.addEventListener('click', () => goToSlide(idx)));
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
}

/* ==========================================================================
   1ª SEÇÃO: GLOBO 3D + VÍDEO CENTRAL + CARROSSEL DE FRASES EM LOOPING
   ========================================================================== */
const heroSection = document.getElementById('hero-scrolly');

if (heroSection && !reduceMotion) {
  const videoWrap = document.getElementById('hero-video-wrap');
  const diagonalOverlay = document.getElementById('hero-diagonal-overlay');
  const textOverlay = document.getElementById('hero-text-overlay');
  const dynamicTitle = document.getElementById('hero-dynamic-title');
  const scrollHint = document.getElementById('hero-scroll-hint');
  const canvas = document.getElementById('hero-particles-canvas');
  
  const videoPhrases = [
    "Facilidade de edição.",
    "Velocidade e conversão em tempo real.",
    "Sua marca em tela cheia para o mundo.",
    "Design focado em resultados reais.",
    "Tecnologia de ponta a favor do seu negócio.",
    "Evolução contínua e suporte dedicado.",
    "Pronto para escalar a sua empresa."
  ];

  let currentPhraseIdx = 0;
  let isHeroVisible = true;
  let scrollProgress = 0;
  let currentPhase = 1;
  let phaseProgress = 0;

  let globeRotationY = 0;
  let globeRotationX = 0.2;
  let globeScale = 1;
  let globeOpacity = 1;
  let targetMouseX = 0, targetMouseY = 0;

  // Motor do Carrossel Automático de Frases
  if (dynamicTitle) {
    dynamicTitle.textContent = videoPhrases[0];
    setInterval(() => {
      if (!isHeroVisible || currentPhase < 3) return;
      dynamicTitle.classList.add('slide-up-out');
      setTimeout(() => {
        currentPhraseIdx = (currentPhraseIdx + 1) % videoPhrases.length;
        dynamicTitle.textContent = videoPhrases[currentPhraseIdx];
        dynamicTitle.classList.remove('slide-up-out');
        dynamicTitle.classList.add('slide-up-in-prepare');
        void dynamicTitle.offsetHeight;
        requestAnimationFrame(() => {
          dynamicTitle.classList.remove('slide-up-in-prepare');
        });
      }, 300);
    }, 2400);
  }

  // Motor de Scroll Compacto (5 Fases)
  function handleHeroScroll() {
    const rect = heroSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height - window.innerHeight;
    
    isHeroVisible = (rect.bottom > 0 && rect.top < window.innerHeight);
    scrollProgress = Math.max(0, Math.min(1, -sectionTop / Math.max(1, sectionHeight)));
    
    currentPhase = Math.min(5, Math.floor(scrollProgress * 5) + 1);
    phaseProgress = (scrollProgress * 5) % 1;

    if (scrollHint) scrollHint.style.opacity = scrollProgress > 0.02 ? '0' : '1';

    if (currentPhase === 1) {
      globeScale = 0.8 + (phaseProgress * 0.4);
      globeRotationY = phaseProgress * 0.8;
      globeOpacity = 1;
      videoWrap.style.opacity = 0; 
      if (diagonalOverlay) diagonalOverlay.style.opacity = 1;
      if (textOverlay) textOverlay.style.opacity = 0;
    } else if (currentPhase === 2) {
      globeScale = 1.2 + (phaseProgress * 1.5);
      globeRotationY = 0.8 + (phaseProgress * 1.8);
      globeRotationX = 0.2 + (phaseProgress * 0.3);
      globeOpacity = 1;
      videoWrap.style.opacity = 0; 
      if (diagonalOverlay) diagonalOverlay.style.opacity = Math.max(0, 1 - (phaseProgress * 1.5));
      if (textOverlay) textOverlay.style.opacity = 0;
    } else if (currentPhase === 3) {
      globeScale = 2.7 + (phaseProgress * 2.0);
      globeRotationY = 2.6 + (phaseProgress * 0.5);
      globeOpacity = Math.max(0, 0.8 - (phaseProgress * 1.2));
      videoWrap.style.opacity = 1;
      videoWrap.style.clipPath = `circle(${phaseProgress * 55}% at 50% 50%)`;
      if (diagonalOverlay) diagonalOverlay.style.opacity = 0;
      if (textOverlay) {
        textOverlay.style.opacity = Math.min(1, phaseProgress * 1.8);
        textOverlay.classList.add('video-mode');
      }
    } else if (currentPhase >= 4) {
      globeOpacity = 0; 
      videoWrap.style.opacity = 1;
      videoWrap.style.clipPath = `circle(100% at 50% 50%)`;
      if (diagonalOverlay) diagonalOverlay.style.opacity = 0;
      if (textOverlay) {
        textOverlay.style.opacity = 1;
        textOverlay.classList.add('video-mode');
      }
    }
  }

  window.addEventListener('scroll', handleHeroScroll, { passive: true });
  handleHeroScroll();

  // Interatividade de Paralaxe com o Mouse
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Renderizador 3D do Globo no Canvas
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, globePoints = [], atmospherePoints = [];

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGlobe();
    }

    function initGlobe() {
      globePoints = [];
      atmospherePoints = [];
      const numPoints = window.innerWidth < 768 ? 900 : 1800;
      const phi = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < numPoints; i++) {
        const y = 1 - (i / (numPoints - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        const isBrazilRegion = (y < 0.1 && y > -0.6) && (Math.cos(theta) < -0.2 && Math.cos(theta) > -0.8);
        
        let color, size;
        if (isBrazilRegion) {
          color = 'rgba(0, 240, 255,';
          size = Math.random() * 2.2 + 1.2;
        } else if (Math.random() > 0.2) {
          color = 'rgba(87, 195, 146,';
          size = Math.random() * 1.5 + 0.8;
        } else {
          color = 'rgba(228, 230, 235,';
          size = Math.random() * 1.0 + 0.5;
        }

        globePoints.push({ x, y, z, color, size, origSize: size, isBrazilRegion });
      }

      for (let i = 0; i < 150; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const dist = 1.2 + Math.random() * 0.7;
        atmospherePoints.push({
          x: Math.sin(phi) * Math.cos(theta) * dist,
          y: Math.sin(phi) * Math.sin(theta) * dist,
          z: Math.cos(phi) * dist,
          color: Math.random() > 0.5 ? 'rgba(0, 240, 255,' : 'rgba(87, 195, 146,',
          size: Math.random() * 2 + 0.5
        });
      }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function render3D() {
      try {
        if (isHeroVisible && globeOpacity > 0.001) {
          ctx.clearRect(0, 0, width, height);
          targetMouseX += (mouseX - targetMouseX) * 0.05;
          targetMouseY += (mouseY - targetMouseY) * 0.05;
          const rotY = globeRotationY + (targetMouseX * 0.4);
          const rotX = globeRotationX - (targetMouseY * 0.4);
          const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
          const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
          const baseRadius = Math.min(width, height) * 0.28 * globeScale;
          const centerX = width / 2, centerY = height / 2;
          const fov = 4.0;

          atmospherePoints.forEach(p => {
            let x = p.x * cosY - p.z * sinY;
            let z = p.z * cosY + p.x * sinY;
            let y = p.y * cosX - z * sinX;
            z = z * cosX + p.y * sinX;
            if (z <= -3.5) return;
            const perspective = Math.max(0.01, fov / (fov + z));
            const screenX = centerX + x * baseRadius * perspective;
            const screenY = centerY + y * baseRadius * perspective;
            const alpha = Math.max(0, Math.min(0.6, (1 - z) * 0.3 * globeOpacity));
            const radius = Math.max(0.1, p.size * perspective * globeScale * 0.5);

            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${alpha})`;
            ctx.fill();
          });

          globePoints.forEach(p => {
            let x1 = p.x * cosY - p.z * sinY;
            let z1 = p.z * cosY + p.x * sinY;
            let y2 = p.y * cosX - z1 * sinX;
            let z2 = z1 * cosX + p.y * sinX;
            if (z2 <= -3.5) return;
            const perspective = Math.max(0.01, fov / (fov + z2));
            const screenX = centerX + x1 * baseRadius * perspective;
            const screenY = centerY + y2 * baseRadius * perspective;

            if (z2 < 1.2) {
              const depthAlpha = Math.max(0.1, (1 - (z2 + 1) / 2)) * globeOpacity;
              const finalSize = Math.max(0.1, p.size * perspective * Math.min(globeScale * 0.8, 3.5));

              ctx.beginPath();
              ctx.arc(screenX, screenY, finalSize, 0, Math.PI * 2);
              ctx.fillStyle = `${p.color}${depthAlpha})`;
              
              if (p.isBrazilRegion && z2 < 0.2) {
                ctx.shadowBlur = Math.max(0, 10 * perspective);
                ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
              } else {
                ctx.shadowBlur = 0;
              }
              ctx.fill();
            }
          });
        }
      } catch (err) {}
      requestAnimationFrame(render3D);
    }
    render3D();
  }
}