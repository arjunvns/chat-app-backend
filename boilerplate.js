// Show a welcome message when the page loads
window.onload = function() {
  alert("Welcome to Arjun's Portfolio 🚀");
};

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Add dark mode styles dynamically
const style = document.createElement('style');
style.innerHTML = `
  .dark-mode {
    background: #121212;
    color: #f4f4f9;
  }
  .dark-mode header {
    background: linear-gradient(135deg, #000, #333);
  }
  .dark-mode footer {
    background: #000;
  }
`;
document.head.appendChild(style);
