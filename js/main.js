// Header muda de estilo ao rolar a página
const header = document.getElementById('siteHeader');
const toggleHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
toggleHeader();
window.addEventListener('scroll', toggleHeader, { passive: true });

// Menu mobile
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  navToggle.classList.toggle('active');
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

// Crossfade genérico: alterna a classe "active" entre slides irmãos, com troca automática e setas opcionais
function startCrossfade(slides, interval, arrows) {
  if (slides.length < 2) return;
  let index = 0;
  let timer;

  function goTo(i) {
    slides[index].classList.remove('active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('active');
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }
  function restart() {
    clearInterval(timer);
    timer = setInterval(next, interval);
  }

  if (arrows) {
    if (arrows.prev) arrows.prev.addEventListener('click', () => { prev(); restart(); });
    if (arrows.next) arrows.next.addEventListener('click', () => { next(); restart(); });
  }

  restart();
}

// Hero: transição suave (crossfade) entre as fotos de fundo, com setas
startCrossfade(document.querySelectorAll('.hero-slide'), 5000, {
  prev: document.querySelector('.hero-arrow.prev'),
  next: document.querySelector('.hero-arrow.next'),
});

// "O que fazemos": carrossel elegante entre as fotos do ambiente
startCrossfade(document.querySelectorAll('.about-slide'), 4500);

// Tilt 3D: título do hero e citação da Nossa Visão inclinam acompanhando o mouse
function attachTilt(el, { max = 10, perspective = 700 } = {}) {
  if (!el) return;
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = 'transform 0.1s ease-out';
    el.style.transform = `perspective(${perspective}px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
  });
}

attachTilt(document.querySelector('.hero-content h1'), { max: 10, perspective: 700 });
attachTilt(document.querySelector('.vision-quote'), { max: 8, perspective: 700 });

// Faixa de estatísticas: números contam de 0 até o valor final ao rolar até a faixa ou passar o mouse
const statsBand = document.querySelector('.stats-band .vision-stats');
if (statsBand) {
  const numberEls = statsBand.querySelectorAll('.stat-num');
  let runToken = 0;
  const animateStats = () => {
    const myToken = ++runToken;
    numberEls.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        if (myToken !== runToken) return;
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  if ('IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animateStats();
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsBand);
  } else {
    numberEls.forEach(el => { el.textContent = el.dataset.target; });
  }
  statsBand.addEventListener('mouseenter', animateStats);
}

// Especialidades: revela os itens em escala, um por um, ao entrar na tela
const specialtiesList = document.querySelector('.specialties-list');
if (specialtiesList) {
  if ('IntersectionObserver' in window) {
    const specialtiesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          specialtiesList.classList.add('in-view');
          specialtiesObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    specialtiesObserver.observe(specialtiesList);
  } else {
    specialtiesList.classList.add('in-view');
  }
}

// Carrossel dos cards de projeto: setas, arraste e troca automática
function initProjectCarousel(root) {
  const track = root.querySelector('.carousel-track');
  const slides = root.querySelectorAll('.carousel-slide');
  const dots = root.querySelectorAll('.carousel-dots .dot');
  const prevBtn = root.querySelector('.carousel-arrow.prev');
  const nextBtn = root.querySelector('.carousel-arrow.next');
  if (!track || slides.length < 2) return;

  let index = 0;
  let autoplayTimer;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 4000);
  }

  prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  dots.forEach((dot, di) => dot.addEventListener('click', () => { goTo(di); startAutoplay(); }));

  let dragging = false;
  let startX = 0;
  let currentX = 0;

  function pointerX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onDragStart(e) {
    dragging = true;
    startX = pointerX(e);
    currentX = startX;
    track.classList.add('dragging');
    clearInterval(autoplayTimer);
  }

  function onDragMove(e) {
    if (!dragging) return;
    currentX = pointerX(e);
    const deltaPercent = ((currentX - startX) / root.offsetWidth) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${deltaPercent}%))`;
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    const delta = currentX - startX;
    if (Math.abs(delta) > root.offsetWidth * 0.15) {
      delta < 0 ? next() : prev();
    } else {
      goTo(index);
    }
    startAutoplay();
  }

  root.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  root.addEventListener('touchstart', onDragStart, { passive: true });
  root.addEventListener('touchmove', onDragMove, { passive: true });
  root.addEventListener('touchend', onDragEnd);

  goTo(0);
  startAutoplay();
}

document.querySelectorAll('.project-carousel:not(.project-carousel-placeholder)').forEach(initProjectCarousel);

// Últimos projetos (mobile): fotos entram pela lateral ao rolar, e voltam ao sair da tela
const projectFigures = document.querySelectorAll('.projects-grid figure');
if (projectFigures.length && 'IntersectionObserver' in window) {
  const projectsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.2 });
  projectFigures.forEach(fig => projectsObserver.observe(fig));
}

// Envio do formulário de contato (via Formspree, sem sair da página)
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('.btn-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = 'Preencha os campos obrigatórios.';
    return;
  }

  submitBtn.disabled = true;
  status.textContent = 'Enviando...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      status.textContent = 'Mensagem enviada! Em breve entraremos em contato.';
      form.reset();
    } else {
      status.textContent = 'Não foi possível enviar. Tente novamente ou fale pelo WhatsApp.';
    }
  } catch (err) {
    status.textContent = 'Não foi possível enviar. Tente novamente ou fale pelo WhatsApp.';
  } finally {
    submitBtn.disabled = false;
  }
});
