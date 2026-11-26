document.addEventListener("DOMContentLoaded", () => {
  console.log("Tech Crusader online.");
  // A single jagged electric bolt travels around each marked card.
  const lightningCards = [];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createLightningOrbit(card) {
    if (card.querySelector(".lightning-orbit")) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add("lightning-orbit");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const defs = document.createElementNS(svgNS, "defs");

    const blur = document.createElementNS(svgNS, "filter");
    blur.setAttribute("id", `lightning-blur-${lightningCards.length}`);
    blur.setAttribute("x", "-100%");
    blur.setAttribute("y", "-100%");
    blur.setAttribute("width", "300%");
    blur.setAttribute("height", "300%");
    const blurNode = document.createElementNS(svgNS, "feGaussianBlur");
    blurNode.setAttribute("stdDeviation", "3.2");
    blur.appendChild(blurNode);

    const coreGlow = document.createElementNS(svgNS, "filter");
    coreGlow.setAttribute("id", `lightning-core-glow-${lightningCards.length}`);
    coreGlow.setAttribute("x", "-100%");
    coreGlow.setAttribute("y", "-100%");
    coreGlow.setAttribute("width", "300%");
    coreGlow.setAttribute("height", "300%");
    const coreBlur = document.createElementNS(svgNS, "feGaussianBlur");
    coreBlur.setAttribute("stdDeviation", "1.4");
    coreBlur.setAttribute("result", "soft");
    const merge = document.createElementNS(svgNS, "feMerge");
    const softNode = document.createElementNS(svgNS, "feMergeNode");
    softNode.setAttribute("in", "soft");
    const sourceNode = document.createElementNS(svgNS, "feMergeNode");
    sourceNode.setAttribute("in", "SourceGraphic");
    merge.append(softNode, sourceNode);
    coreGlow.append(coreBlur, merge);

    defs.append(blur, coreGlow);
    svg.appendChild(defs);

    const track = document.createElementNS(svgNS, "path");
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", "none");
    svg.appendChild(track);

    const bolt = document.createElementNS(svgNS, "g");
    bolt.setAttribute("class", "lightning-bolt");

    const glowShape = document.createElementNS(svgNS, "path");
    glowShape.setAttribute("class", "lightning-bolt-glow");
    glowShape.setAttribute(
      "d",
      "M-34 0 L-18 -6 L-9 5 L2 -8 L13 5 L24 -4 L34 0 L23 1 L13 9 L2 0 L-9 9 L-18 0 Z"
    );

    const coreShape = document.createElementNS(svgNS, "path");
    coreShape.setAttribute("class", "lightning-bolt-core");
    coreShape.setAttribute(
      "d",
      "M-30 0 L-18 -4 L-9 4 L2 -6 L13 4 L24 -3 L30 0"
    );

    bolt.append(glowShape, coreShape);
    svg.appendChild(bolt);
    card.appendChild(svg);

    const state = {
      card,
      svg,
      track,
      bolt,
      length: 0,
      visible: true
    };

    lightningCards.push(state);
    resizeLightningOrbit(state);
  }

  function resizeLightningOrbit(state) {
    const rect = state.card.getBoundingClientRect();
    const width = rect.width + 12;
    const height = rect.height + 12;

    if (width < 30 || height < 30) return;

    const inset = 8;
    const radius = Math.min(12, (Math.min(width, height) - inset * 2) / 2);
    const right = width - inset;
    const bottom = height - inset;

    state.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    state.track.setAttribute(
      "d",
      [
        `M ${inset + radius} ${inset}`,
        `H ${right - radius}`,
        `Q ${right} ${inset} ${right} ${inset + radius}`,
        `V ${bottom - radius}`,
        `Q ${right} ${bottom} ${right - radius} ${bottom}`,
        `H ${inset + radius}`,
        `Q ${inset} ${bottom} ${inset} ${bottom - radius}`,
        `V ${inset + radius}`,
        `Q ${inset} ${inset} ${inset + radius} ${inset}`,
        "Z"
      ].join(" ")
    );

    state.length = state.track.getTotalLength();
  }

  document.querySelectorAll(".card.lightning-border").forEach(createLightningOrbit);

  if (lightningCards.length && !reducedMotion.matches) {
    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        lightningCards.forEach(resizeLightningOrbit);
      });
      lightningCards.forEach(state => resizeObserver.observe(state.card));
    } else {
      window.addEventListener("resize", () => {
        lightningCards.forEach(resizeLightningOrbit);
      }, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const state = lightningCards.find(item => item.card === entry.target);
          if (state) state.visible = entry.isIntersecting;
        });
      }, { rootMargin: "80px" });

      lightningCards.forEach(state => visibilityObserver.observe(state.card));
    }

    let animationFrame = 0;
    const travelSpeed = 0.18; // SVG units per millisecond (about 180 px/sec).

    function animateLightning(timestamp) {
      if (document.visibilityState === "visible") {
        lightningCards.forEach(state => {
          if (!state.visible || !state.length) return;

          const distance = (timestamp * travelSpeed) % state.length;
          const point = state.track.getPointAtLength(distance);
          const nextPoint = state.track.getPointAtLength(
            (distance + 2) % state.length
          );
          const angle = Math.atan2(
            nextPoint.y - point.y,
            nextPoint.x - point.x
          ) * (180 / Math.PI);

          state.bolt.setAttribute(
            "transform",
            `translate(${point.x} ${point.y}) rotate(${angle})`
          );
        });
      }

      animationFrame = window.requestAnimationFrame(animateLightning);
    }

    animationFrame = window.requestAnimationFrame(animateLightning);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animateLightning);
      }
    });
  }


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
