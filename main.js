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

});

