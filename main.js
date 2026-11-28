document.addEventListener("DOMContentLoaded", () => {
  console.log("Tech Crusader online.");

  // Electric border effect adapted directly from Derricks-Custom-Tech-Solutions.
  // The motion and crackle stay the same; only the reference green is blue.
  (() => {
    const TARGETS = ".card, .definition-card, .hero-frame, .build-cta, .contact-form";
    const COLOR = "61,136,255"; // Tech Crusader cyan-blue (#3d88ff)
    const PAD = 12;
    const AMP = 5;
    const SPEED = 0.35;
    const FPS = 30;
    const STEP = 6;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hash = n => {
      const s = Math.sin(n * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };

    const noise = x => {
      const i = Math.floor(x);
      const f = x - i;
      const u = f * f * (3 - 2 * f);
      return hash(i) * (1 - u) + hash(i + 1) * u;
    };

    // Point and outward normal at distance s along the card's perimeter.
    function edge(w, h, s) {
      const length = 2 * (w + h);
      s = ((s % length) + length) % length;

      if (s < w) return [PAD + s, PAD, 0, -1];
      s -= w;
      if (s < h) return [PAD + w, PAD + s, 1, 0];
      s -= h;
      if (s < w) return [PAD + w - s, PAD + h, 0, 1];
      s -= w;
      return [PAD, PAD + h - s, -1, 0];
    }

    // Draw a noisy electrical line along a section of the card perimeter.
    function bolt(card, time, from, length, amplitude, taper) {
      const ctx = card.ctx;
      const points = Math.max(2, Math.ceil(length / STEP));
      const tick = Math.floor(time * FPS) * 17.3;

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const distance = from + (i / points) * length;
        const [x, y, nx, ny] = edge(card.w, card.h, distance);
        const taperAmount = taper ? Math.sin((i / points) * Math.PI) : 1;

        const offset = (
          (noise(distance * 0.06 + time * 9 + card.seed) - 0.5) * 2 +
          (noise(distance * 0.22 - time * 14 + card.seed) - 0.5) * 0.8 +
          (noise(distance * 0.5 + tick + card.seed) - 0.5) * 1.2
        ) * amplitude * taperAmount;

        const px = x + nx * offset;
        const py = y + ny * offset;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.stroke();
    }

    function draw(card, time) {
      const ctx = card.ctx;
      ctx.clearRect(0, 0, card.w + PAD * 2, card.h + PAD * 2);

      const perimeter = 2 * (card.w + card.h);
      const flicker = 0.7 + Math.random() * 0.3;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = "rgb(" + COLOR + ")";

      // Low-level crackle continuously crawling around the full border.
      ctx.strokeStyle = "rgba(" + COLOR + "," + 0.35 * flicker + ")";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 6;
      bolt(card, time, 0, perimeter, AMP * 0.6, false);

      // A brighter, jagged electrical charge races around the perimeter.
      const head = (time * SPEED * perimeter + card.seed * 13) % perimeter;
      const chargeLength = perimeter * 0.28;

      ctx.strokeStyle = "rgba(" + COLOR + "," + 0.55 * flicker + ")";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 14;
      bolt(card, time, head - chargeLength, chargeLength, AMP * 1.4, true);

      // Near-white hot core gives the charge its sharp, snapping edge.
      ctx.strokeStyle = "rgba(225,238,255," + flicker + ")";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      bolt(card, time, head - chargeLength, chargeLength, AMP * 1.4, true);
    }

    function size(card) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      card.w = card.el.offsetWidth;
      card.h = card.el.offsetHeight;

      const canvasWidth = card.w + PAD * 2;
      const canvasHeight = card.h + PAD * 2;

      card.canvas.style.left = card.canvas.style.top = -(PAD + 1) + "px";
      card.canvas.style.width = canvasWidth + "px";
      card.canvas.style.height = canvasHeight + "px";
      card.canvas.width = Math.round(canvasWidth * dpr);
      card.canvas.height = Math.round(canvasHeight * dpr);
      card.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const cards = [];

    document.querySelectorAll(TARGETS).forEach((el, index) => {
      const canvas = document.createElement("canvas");
      canvas.className = "lightning-canvas";
      canvas.setAttribute("aria-hidden", "true");

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      el.appendChild(canvas);

      const card = {
        el,
        canvas,
        ctx,
        w: 0,
        h: 0,
        seed: index * 91.7,
        visible: true
      };

      cards.push(card);

      if ("ResizeObserver" in window) {
        new ResizeObserver(() => size(card)).observe(el);
      } else {
        size(card);
      }

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(entries => {
          card.visible = entries[0].isIntersecting;
        }).observe(el);
      }

      size(card);
    });

    if (!cards.length) return;

    let lastFrame = 0;

    function frame(now) {
      window.requestAnimationFrame(frame);

      if (document.visibilityState !== "visible") return;
      if (!cards.some(card => card.visible)) return;
      if (now - lastFrame < 1000 / FPS) return;

      lastFrame = now;
      cards.forEach(card => {
        if (card.visible && card.w) draw(card, now / 1000);
      });
    }

    window.requestAnimationFrame(frame);
  })();

  const menuToggle = document.getElementById("menu-toggle");
  const mobileLinks = document.querySelectorAll(".mobile-nav a");

  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (menuToggle) {
        menuToggle.checked = false;
      }
    });
  });

  const currentYear = document.querySelector("[data-current-year]");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!contactForm.reportValidity()) {
        return;
      }

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const project = String(formData.get("project") || "").trim();
      const subject = encodeURIComponent("Tech Crusader project inquiry");
      const body = encodeURIComponent(
        `Name: ${name}\nReply email: ${email}\n\nProject details:\n${project}`
      );

      window.location.href =
        `mailto:derricksmith.dev@proton.me?subject=${subject}&body=${body}`;
    });
  }
});
