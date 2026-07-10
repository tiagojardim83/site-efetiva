import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from 'https://cdn.jsdelivr.net/npm/@paper-design/shaders/+esm';

const mount = document.getElementById('specialtiesShader');

if (mount) {
  const colors = ['#4f5f7a', '#8ea9c7', '#c7d2dc', '#ffffff', '#eef1f5'];

  const uniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_distortion: 0.8,
    u_swirl: 0.5,
    u_grainMixer: 0,
    u_grainOverlay: 0,
    u_offsetX: 0,
    u_offsetY: 0,
    u_scale: 1,
    u_rotation: 0,
    u_fit: 2,
  };

  const shader = new ShaderMount(mount, meshGradientFragmentShader, uniforms, undefined, 0.35);
  const section = document.querySelector('.specialties');

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  section.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  (function tick() {
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    shader.setUniforms({ u_offsetX: currentX * 0.3, u_offsetY: currentY * 0.3 });
    requestAnimationFrame(tick);
  })();
}
