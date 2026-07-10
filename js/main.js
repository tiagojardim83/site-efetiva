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

// Hero: transição suave (crossfade) entre as fotos de fundo
const heroSlides = document.querySelectorAll('.hero-slide');
if (heroSlides.length > 1) {
  let heroSlideIndex = 0;
  setInterval(() => {
    heroSlides[heroSlideIndex].classList.remove('active');
    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    heroSlides[heroSlideIndex].classList.add('active');
  }, 5000);
}

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
