function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("theme-toggle-dark-icon").classList.add("hidden");
    document
      .getElementById("theme-toggle-light-icon")
      .classList.remove("hidden");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("theme-toggle-light-icon").classList.add("hidden");
    document
      .getElementById("theme-toggle-dark-icon")
      .classList.remove("hidden");
  }
  localStorage.setItem("theme", theme);
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
}

// Add event listener for theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

// Initialize theme when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeTheme);
