/* ==========================================================================
   0. RESET DE ROLAGEM GLOBAL (FORÇAR INÍCIO NO TOPO AO ATUALIZAR)
   ========================================================================== */
// 1. Desativa a memória automática de rolagem do navegador
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// 2. Joga a tela instantaneamente para o pixel 0 (topo) ao carregar ou sair
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 10);
});
/* ========================================================================== */

/* ==========================================================================
   KERNELY — SCRIPT-SERVICOS.JS (MOTOR 100% BLINDADO E AUTÔNOMO)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     1. MOTOR DE REVELAÇÃO AUTÔNOMO (.reveal) — SALVA O RESTO DO SITE!
     -------------------------------------------------------------------------- */
  // Garante que o grid, cards e FAQ apareçam mesmo se o script.js externo falhar
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach(el => {
        el.classList.add('in', 'force-visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      revealElements.forEach(el => revealObserver.observe(el));
    }
  }

  /* --------------------------------------------------------------------------
     2. HERO: EFEITO DE DIGITAÇÃO NO NAVEGADOR
     -------------------------------------------------------------------------- */
  const browserEl = document.getElementById('hero-browser');
  const titleEl = document.getElementById('bc-title-text');

  if (browserEl && titleEl) {
    const titlePhrases = [
      'Feito para vender.',
      'Feito para converter.',
      'Feito para crescer.',
      'Feito para impressionar.'
    ];

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    async function typeText(el, text, speed) {
      for (let i = 0; i <= text.length; i++) {
        el.textContent = text.slice(0, i);
        await wait(speed);
      }
    }

    async function eraseText(el, speed) {
      const text = el.textContent;
      for (let i = text.length; i >= 0; i--) {
        el.textContent = text.slice(0, i);
        await wait(speed);
      }
    }

    async function titleLoop() {
      await typeText(titleEl, titlePhrases[0], 45);
      if (reduceMotion) return;

      let i = 1;
      while (true) {
        await wait(2200);
        await eraseText(titleEl, 28);
        await wait(250);
        await typeText(titleEl, titlePhrases[i % titlePhrases.length], 45);
        i++;
      }
    }

    if (reduceMotion) {
      titleEl.textContent = titlePhrases[0];
    } else {
      const bObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            titleLoop();
            bObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });

      bObserver.observe(browserEl);
    }
  }

  /* --------------------------------------------------------------------------
     3. SCROLLYTELLING "POR QUE A KERNELY" (ZOOM NO K + DIFERENCIAIS)
     -------------------------------------------------------------------------- */
  const kSection = document.getElementById('k-scrolly-section');

  if (kSection) {
    const introBox = document.getElementById('k-intro-box');
    const logoHero = document.getElementById('k-logo-hero');
    const diffStage = document.getElementById('k-differentials-stage');
    const diffItems = Array.from(diffStage ? diffStage.querySelectorAll('.diff-item') : []);
    const visualItems = Array.from(diffStage ? diffStage.querySelectorAll('.k-visual-item') : []);

    if (reduceMotion) {
      kSection.classList.add('k-static');
      if (diffStage) diffStage.classList.add('active');
      diffItems.forEach(el => el.classList.add('active'));
      visualItems.forEach(el => el.classList.add('active'));
    } else {
      const totalPhases = diffItems.length + 1; // Fase 0 = Intro, 1 a 3 = Diferenciais
      let ticking = false;

      function updateScrolly() {
        const rect = kSection.getBoundingClientRect();
        const scrollableDistance = kSection.offsetHeight - window.innerHeight;

        let progress = scrollableDistance > 0 ? -rect.top / scrollableDistance : 0;
        progress = Math.min(Math.max(progress, 0), 1);

        const phaseFloat = progress * totalPhases;
        const phaseIndex = Math.min(Math.floor(phaseFloat), totalPhases - 1);
        const localProgress = phaseFloat - phaseIndex;

        if (phaseIndex === 0) {
          // Fase 0: Zoom agressivo na logo e Fade-Out suave do texto inicial
          if (introBox) introBox.classList.remove('exited');
          if (diffStage) diffStage.classList.remove('active');
          
          // 1. ZOOM DA LOGO K: Cresce exponencialmente até 46x o tamanho original
          const acceleratedProgress = Math.pow(localProgress, 2); 
          const scale = 1 + (acceleratedProgress * 45); 
          
          // 2. FADE-OUT DO TEXTO: Faz a frase "Feito para funcionar..." sumir suavemente
          // Ela começa com opacidade 100% (1) e zera totalmente quando o scroll chega em 30% (0.3) da Fase 0
          if (introBox) {
            const textOpacity = localProgress < 0.3 ? 1 - (localProgress / 0.3) : 0;
            introBox.style.opacity = textOpacity;
            // Desativa o clique no texto quando ele ficar invisível
            introBox.style.pointerEvents = textOpacity > 0.1 ? 'auto' : 'none';
          }
          
          // 3. OPACIDADE DO K: Garante visibilidade durante o mergulho e suaviza a saída no final
          if (logoHero) {
            logoHero.style.transform = `scale(${scale})`;
            logoHero.style.opacity = localProgress > 0.85 ? `${(1 - localProgress) * 6.66}` : '1';
          }
        } else {
          // Fases 1, 2 e 3: Intro sai definitivamente, entra o palco com os diferenciais
          if (introBox) {
            introBox.classList.add('exited');
            introBox.style.opacity = '0';
          }
          if (diffStage) diffStage.classList.add('active');
          
          // Garante que a logo gigante não apareça sobrepondo os cards dos diferenciais
          if (logoHero) logoHero.style.opacity = '0';
          
          const activeIndex = phaseIndex - 1;
          diffItems.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
          visualItems.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
        }
      }

      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateScrolly();
            ticking = false;
          });
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', updateScrolly);
      updateScrolly();
    }
  }

  /* --------------------------------------------------------------------------
     4. FAQ ACCORDION (GARANTIA DE FUNCIONAMENTO)
     -------------------------------------------------------------------------- */
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Fecha todos os outros
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('open');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      // Abre ou fecha o clicado
      if (!isOpen && answer) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});