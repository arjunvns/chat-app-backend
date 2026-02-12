// Navbar Toggle
const toggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav-links");
toggle.onclick = () => nav.classList.toggle("show");


// ===================== 🔊 HOVER SOUND FIX =====================

const hoverSound = document.getElementById("hoverSound");
let audioUnlocked = false;

// Unlock audio on FIRST user interaction (required by browser)
document.addEventListener("click", () => {
  if (!audioUnlocked) {
    hoverSound.volume = 0.6;
    hoverSound.currentTime = 0;

    hoverSound.play()
      .then(() => {
        hoverSound.pause();
        hoverSound.currentTime = 0;
        audioUnlocked = true;
        console.log("🔊 Audio unlocked");
      })
      .catch(() => {});
  }
});

// Attach hover sound AFTER page fully loads
window.addEventListener("load", () => {
  document.querySelectorAll(".hover-sound").forEach(el => {

    el.addEventListener("mouseenter", () => {
      if (audioUnlocked) {
        hoverSound.pause();
        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {});
      }
    });

  });
});


// ===================== 🎬 GSAP Animations =====================
gsap.from(".logo", { y: -50, opacity: 0, duration: 1 });

gsap.from(".nav-links li", {
  y: -30,
  opacity: 0,
  stagger: 0.2,
  duration: 1
});


// ===================== ✨ PARTICLES =====================
particlesJS("particles-js", {
  particles: {
    number: { value: 80 },
    color: { value: "#00f7ff" },
    size: { value: 4 },
    move: { speed: 2 }
  }
});
