const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
document.getElementById("yr").textContent = new Date().getFullYear();

// Turn "A, B, C" text into chips
document.querySelectorAll("[data-chips]").forEach(el => {
  el.innerHTML = el.textContent.split(",").map(t => `<span>${t.trim()}</span>`).join("");
});

// Mouse: parallax variables + spotlight on glass surfaces + tilt on cards
addEventListener("pointermove", e => {
  root.style.setProperty("--mx", (e.clientX / innerWidth - .5).toFixed(3));
  root.style.setProperty("--my", (e.clientY / innerHeight - .5).toFixed(3));
});
document.querySelectorAll(".glass").forEach(el => {
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px");
    if (el.dataset.tilt !== undefined && !still) {
      el.style.setProperty("--ry", ((x / r.width - .5) * 6).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((.5 - y / r.height) * 6).toFixed(2) + "deg");
    }
  });
  el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
});

// Magnetic buttons
if (!still) document.querySelectorAll(".magnetic").forEach(b => {
  b.addEventListener("pointermove", e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
  });
  b.addEventListener("pointerleave", () => b.style.transform = "");
});

// Typing effect
const words = ["full-stack web apps", "IoT systems on ESP32", "websites for real clients"];
const out = document.getElementById("typed");
let w = 0, c = 0, del = false;
function type() {
  const word = words[w];
  out.textContent = word.slice(0, c);
  if (!del && c === word.length) { del = true; return setTimeout(type, 1600); }
  if (del && c === 0) { del = false; w = (w + 1) % words.length; }
  c += del ? -1 : 1;
  setTimeout(type, del ? 35 : 70);
}
still ? out.textContent = words[0] : type();

// Scroll progress, active nav link, reveal on scroll
const bar = document.querySelector(".progress");
addEventListener("scroll", () => {
  bar.style.transform = `scaleX(${scrollY / (document.body.scrollHeight - innerHeight)})`;
}, { passive: true });
const links = [...document.querySelectorAll(".nav nav a")];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => spy.observe(s));
document.querySelectorAll(".block .glass, .block h2").forEach(el => el.classList.add("reveal"));
const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => rv.observe(el));

// Copy email
const copy = document.getElementById("copy");
copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(document.getElementById("mail").textContent); copy.textContent = "Copied"; }
  catch { copy.textContent = "Press Ctrl+C on the email"; }
  setTimeout(() => copy.textContent = "Copy email", 1800);
});

// Starfield with mouse parallax and the odd shooting star
(function () {
  const cv = document.getElementById("stars"), ctx = cv.getContext("2d");
  let stars = [], shoot = null;
  function resize() {
    const d = devicePixelRatio || 1;
    cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from({ length: Math.min(260, innerWidth * innerHeight / 6500 | 0) }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.3 + .2, z: Math.random() * .9 + .1, p: Math.random() * 6.3
    }));
  }
  function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const mx = +root.style.getPropertyValue("--mx") || 0, my = +root.style.getPropertyValue("--my") || 0;
    for (const s of stars) {
      ctx.fillStyle = `rgba(255,255,255,${.3 + .5 * Math.abs(Math.sin(s.p + t / 900 * s.z))})`;
      ctx.beginPath(); ctx.arc(s.x - mx * 30 * s.z, s.y - my * 30 * s.z, s.r, 0, 6.3); ctx.fill();
    }
    if (!shoot && Math.random() < .002) shoot = { x: Math.random() * innerWidth, y: Math.random() * innerHeight * .4, l: 0 };
    if (shoot) {
      const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.l, shoot.y - shoot.l * .5);
      g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "transparent");
      ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.l, shoot.y - shoot.l * .5); ctx.stroke();
      shoot.x += 16; shoot.y += 8; shoot.l = Math.min(shoot.l + 6, 110);
      if (shoot.x > innerWidth + 150) shoot = null;
    }
    if (!still) requestAnimationFrame(frame);
  }
  addEventListener("resize", () => { resize(); if (still) frame(0); });
  resize(); frame(0);
})();
