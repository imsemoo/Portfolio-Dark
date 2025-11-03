// Hero Three.js scene: soft gradient plane + lightweight particles.
// Designed to be transparent and sit behind hero content.

import { clampPixelRatio } from '../utils/media.js';

export function createHeroScene(rootEl, libs, cfg) {
  const { THREE, gsap } = libs;
  if (!rootEl || !THREE) return { update() {}, resize() {}, destroy() {}, start() {}, stop() {} };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(clampPixelRatio(2));
  renderer.setClearAlpha(0);
  rootEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3);

  // Gradient plane with subtle time-based displacement
  const uniforms = {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(cfg?.hero?.color1 || '#1b1b1b') },
    uColor2: { value: new THREE.Color(cfg?.hero?.color2 || '#0b0b0b') },
    uAmp: { value: cfg?.hero?.amplitude ?? 0.04 }
  };
  const planeGeo = new THREE.PlaneGeometry(6, 4, 64, 64);
  const planeMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uAmp;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 p = position;
        float w = sin((p.x*2.2 + uTime*0.6))*cos((p.y*2.1 - uTime*0.4));
        p.z += w * uAmp;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision mediump float;
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;
      // tiny hash-based grain
      float hash(vec2 p){
        return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
      }
      void main(){
        float g = smoothstep(0.0, 1.0, vUv.y);
        vec3 col = mix(uColor1, uColor2, g);
        float grain = hash(vUv + uTime*0.02);
        col += (grain-0.5) * 0.03; // very subtle
        gl_FragColor = vec4(col, 0.65);
      }
    `
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.position.z = -0.3;
  scene.add(plane);

  // Lightweight particles reacting to mouse (parallax group)
  const pCount = Math.min(300, Math.max(80, cfg?.hero?.particles ?? 180));
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const x = (Math.random() - 0.5) * 4.8;
    const y = (Math.random() - 0.5) * 3.2;
    const z = Math.random() * 0.6 - 0.3;
    positions.set([x, y, z], i * 3);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: cfg?.hero?.dotColor || 0xC778DD, size: 0.02, transparent: true, opacity: 0.7, depthWrite: false });
  const points = new THREE.Points(pGeo, pMat);
  const pGroup = new THREE.Group();
  pGroup.add(points);
  scene.add(pGroup);

  let mouseX = 0, mouseY = 0, width = 0, height = 0, running = true;

  function onPointerMove(e) {
    const r = rootEl.getBoundingClientRect();
    const x = (e.clientX - r.left) / Math.max(1, r.width);
    const y = (e.clientY - r.top) / Math.max(1, r.height);
    mouseX = (x - 0.5);
    mouseY = (y - 0.5);
  }

  // Listen on window to avoid CSS pointer-events: none blocking events
  window.addEventListener('pointermove', onPointerMove, { passive: true });

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

  let lastT = performance.now();
  function update() {
    if (!running) return;
    const now = performance.now();
    const dt = (now - lastT) / 1000;
    lastT = now;

    uniforms.uTime.value += dt;
    // gentle parallax for particles
    pGroup.position.x = mouseX * 0.25;
    pGroup.position.y = -mouseY * 0.2;
    pGroup.rotation.z += dt * 0.02;

    renderer.render(scene, camera);
  }

  function start() { running = true; }
  function stop() { running = false; }
  function destroy() {
    stop();
    window.removeEventListener('pointermove', onPointerMove);
    renderer.dispose();
    planeGeo.dispose();
    pGeo.dispose();
    planeMat.dispose();
    pMat.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return { update, resize, destroy, start, stop };
}
