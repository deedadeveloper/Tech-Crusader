document.addEventListener("DOMContentLoaded", () => {
  console.log("Tech Crusader online.");

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
