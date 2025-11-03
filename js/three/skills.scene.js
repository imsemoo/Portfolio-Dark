// Skills background: lightweight rotating instanced points.
import { clampPixelRatio } from '../utils/media.js';

export function createSkillsScene(rootEl, libs, cfg) {
  const { THREE } = libs;
  if (!rootEl || !THREE) return { update() {}, resize() {}, destroy() {}, start() {}, stop() {} };

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setClearAlpha(0);
  renderer.setPixelRatio(clampPixelRatio(2));
  rootEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.2);

  const group = new THREE.Group();
  scene.add(group);

  const count = Math.min(800, Math.max(120, cfg?.skills?.count ?? 320));
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.6 + Math.random() * 1.8;
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r * (0.8 + Math.random()*0.2);
    const y = Math.sin(a) * r * (0.6 + Math.random()*0.3);
    const z = (Math.random() - 0.5) * 0.8;
    pos.set([x, y, z], i * 3);
  }
  geo.setAttribute('position', new libs.THREE.BufferAttribute(pos, 3));
  const mat = new libs.THREE.PointsMaterial({ color: cfg?.skills?.color || 0x666A73, size: 0.01, transparent: true, opacity: 0.5, depthWrite: false });
  const points = new libs.THREE.Points(geo, mat);
  group.add(points);

  let width = 0, height = 0, running = true;
  const baseSpeed = cfg?.skills?.speed ?? 0.05;
  let rotationSpeed = baseSpeed;

  function resize() {
    const rect = rootEl.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setPixelRatio(clampPixelRatio(2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();

  // Hovering a skill item dims particles slightly
  const skillsList = document.querySelectorAll('.box-skills .body-skills li');
  skillsList.forEach((li) => {
    li.addEventListener('mouseenter', () => { mat.opacity = 0.3; rotationSpeed = baseSpeed * 0.25; }, { passive: true });
    li.addEventListener('mouseleave', () => { mat.opacity = 0.5; rotationSpeed = baseSpeed; }, { passive: true });
  });

  function update(dt) {
    if (!running) return;
    group.rotation.z += (rotationSpeed * dt);
    renderer.render(scene, camera);
  }

  function start() { running = true; }
  function stop() { running = false; }
  function destroy() {
    stop();
    renderer.dispose();
    geo.dispose();
    mat.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  return { update, resize, destroy, start, stop };
}

