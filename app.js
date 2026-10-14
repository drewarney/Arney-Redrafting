import * as THREE from "three";
import { STLLoader } from "./vendor/STLLoader.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { SITE, PROJECTS, SERVICES } from "./projects.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ── static text ──
const setText = (sel, v) => { const e = $(sel); if (e) e.textContent = v; };
setText("#foot-name", SITE.name);
setText("#tagline", SITE.tagline);
setText("#year", new Date().getFullYear());
setText("#hours", SITE.hours || "");
const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent("Quote request")}`;
document.querySelectorAll("[data-email]").forEach((a) => { a.href = mailto; a.textContent = SITE.email; });
document.querySelectorAll("[data-email-text]").forEach((e) => (e.textContent = SITE.email));
document.querySelectorAll("[data-quote]").forEach((a) => (a.href = mailto));
if (SITE.phone) {
  document.querySelectorAll("[data-phone]").forEach((a) => {
    a.href = "tel:" + SITE.phone.replace(/[^\d+]/g, "");
    a.textContent = SITE.phone;
    a.hidden = false;
  });
}

// ── services ──
const sg = $("#services-grid");
if (sg) sg.innerHTML = SERVICES.map((s, i) => `
  <div class="service">
    <span class="service-num">${String(i + 1).padStart(2, "0")}</span>
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.body)}</p>
  </div>`).join("");

// ── projects ──
const host = $("#projects");
if (host && PROJECTS.length) host.innerHTML = "";
for (const p of host ? PROJECTS : []) {
  const el = document.createElement("article");
  el.className = "project";
  el.innerHTML = `
    <div class="project-top">
      <div class="viewer" aria-label="Interactive 3D model of ${esc(p.title)}">
        <div class="viewer-msg">Loading model…</div>
      </div>
      <div class="info">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        <ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <div class="titleblock">
          <div><span>Dwg no.</span>${esc(p.dwg)}</div>
          <div><span>Date</span>${esc(p.date)}</div>
          <div><span>Material</span>${esc(p.material)}</div>
          <div><span>Standard</span>${esc(p.standard)}</div>
          ${p.weight ? `<div class="tb-wide"><span>Weight</span>${esc(p.weight)}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="drawings">
      <div class="tabs" role="tablist">
        ${p.sheets.map((s, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(s.label)}</button>`).join("")}
        ${p.pdf ? `<a class="tab tab-pdf" href="${p.pdf}" target="_blank" rel="noopener">PDF ↗</a>` : ""}
      </div>
      <div class="sheet"><img src="${p.sheets[0].src}" alt="${esc(p.title)} — ${esc(p.sheets[0].label)}" loading="lazy" /></div>
    </div>`;
  host.appendChild(el);

  const img = $(".sheet img", el);
  el.querySelectorAll(".tab[data-i]").forEach((t) =>
    t.addEventListener("click", () => {
      el.querySelectorAll(".tab[data-i]").forEach((x) => x.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      const s = p.sheets[+t.dataset.i];
      img.src = s.src;
      img.alt = `${p.title} — ${s.label}`;
    })
  );
  img.addEventListener("click", () => openLightbox(img.src, img.alt));

  mountViewer($(".viewer", el), p.model);
}

// ── lightbox ──
const lb = $("#lightbox") || document.body.appendChild(Object.assign(document.createElement("dialog"), { id: "lightbox", innerHTML: '<button class="lb-close" aria-label="Close">✕</button><img alt="" />' }));
function openLightbox(src, alt) {
  $("img", lb).src = src;
  $("img", lb).alt = alt;
  lb.showModal();
}
$(".lb-close", lb).addEventListener("click", () => lb.close());
lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });

// ── 3D viewer ──
function mountViewer(container, url) {
  const msg = $(".viewer-msg", container);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 10000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.addEventListener("start", () => (controls.autoRotate = false));

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(1, 2, 1.5);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0x8a8478, 0.6));

  let home = null;

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  const urls = Array.isArray(url) ? url : [url];
  const shades = [0xb9bdc4, 0x9ea4ad, 0xc9ccd1, 0xa9aeb6];
  const loader = new STLLoader();
  const loadGeo = (u) => {
    if (!u.startsWith("data:")) return loader.loadAsync(u);
    const bin = atob(u.slice(u.indexOf(",") + 1));
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return Promise.resolve(loader.parse(buf.buffer));
  };
  Promise.all(urls.map(loadGeo))
    .then((geos) => {
      const group = new THREE.Group();
      geos.forEach((geo, i) => {
        geo.computeVertexNormals();
        const mat = new THREE.MeshStandardMaterial({ color: shades[i % shades.length], metalness: 0.75, roughness: 0.32 });
        group.add(new THREE.Mesh(geo, mat));
        // edge lines give it a "CAD" look
        group.add(new THREE.LineSegments(
          new THREE.EdgesGeometry(geo, 30),
          new THREE.LineBasicMaterial({ color: 0x1b1d21, transparent: true, opacity: 0.5 })
        ));
      });
      // this STEP export is Y-up, matching three.js, so no rotation needed
      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      group.position.sub(center);
      scene.add(group);

      const r = box.getBoundingSphere(new THREE.Sphere()).radius;
      const dist = r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.05;
      camera.near = r / 100; camera.far = r * 100; camera.updateProjectionMatrix();
      home = new THREE.Vector3(1, 0.75, 1.2).normalize().multiplyScalar(dist);
      camera.position.copy(home);
      controls.target.set(0, 0, 0);
      controls.update();
      msg.remove();

      container.insertAdjacentHTML("beforeend",
        `<span class="viewer-hint">drag to rotate · scroll to zoom · right-drag to pan</span>
         <button class="viewer-reset" type="button">reset view</button>`);
      $(".viewer-reset", container).addEventListener("click", () => {
        camera.position.copy(home); controls.target.set(0, 0, 0); controls.autoRotate = true;
      });
    })
    .catch(() => { msg.textContent = "3D model coming soon. See the drawings below."; });

  // only render while on screen
  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  });
}
