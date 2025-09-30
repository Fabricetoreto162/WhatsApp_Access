// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès 👍', registration);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du Service Worker ❌', error);
      });
  });
}

// Gérer le bouton d'installation
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", () => {
  installBtn.style.backgroundColor = "#25D366";
  installBtn.style.color = "#fff";

  deferredPrompt.prompt();

  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === "accepted") {
      console.log("✅ L'utilisateur a installé l'app");
    } else {
      console.log("❌ L'utilisateur a refusé");
    }
    deferredPrompt = null;
  });
});

// Gestion du thème
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
let isDarkMode = true;

// Vérifier la préférence système ou le thème sauvegardé
if (localStorage.getItem('theme') === 'light' || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches && !localStorage.getItem('theme'))) {
    enableLightMode();
}

// Vérifier les couleurs sauvegardées
const savedPrimaryColor = localStorage.getItem('primaryColor');
const savedContainerColor = localStorage.getItem('containerColor');

if (savedPrimaryColor) {
    document.documentElement.style.setProperty('--primary', savedPrimaryColor);
}

if (savedContainerColor) {
    document.documentElement.style.setProperty('--container-color', savedContainerColor);
}

function enableLightMode() {
    document.body.classList.add('light-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    isDarkMode = false;
    localStorage.setItem('theme', 'light');
    updateParticles();
}

function enableDarkMode() {
    document.body.classList.remove('light-mode');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    isDarkMode = true;
    localStorage.setItem('theme', 'dark');
    updateParticles();
}

function toggleTheme() {
    if (isDarkMode) {
        enableLightMode();
        showNotification("Mode clair activé");
    } else {
        enableDarkMode();
        showNotification("Mode sombre activé");
    }
}

themeToggle.addEventListener('click', toggleTheme);

// Gestion des couleurs personnalisées
function updateActiveColorButtons() {
    const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const currentContainer = getComputedStyle(document.documentElement).getPropertyValue('--container-color').trim();
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        
        if (option.dataset.type === 'primary' && option.dataset.color === currentPrimary) {
            option.classList.add('active');
        }
        
        if (option.dataset.type === 'container' && option.dataset.color === currentContainer) {
            option.classList.add('active');
        }
    });
}

function changeColor(color, type) {
    if (type === 'primary') {
        document.documentElement.style.setProperty('--primary', color);
        localStorage.setItem('primaryColor', color);
        showNotification("Couleur principale modifiée");
    } else if (type === 'container') {
        document.documentElement.style.setProperty('--container-color', color);
        localStorage.setItem('containerColor', color);
        showNotification("Couleur du container modifiée");
    }
    
    updateParticles();
    updateActiveColorButtons();
}

function resetColors() {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--container-color');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('containerColor');
    updateActiveColorButtons();
    updateParticles();
    showNotification("Couleurs réinitialisées");
}

// Événements pour les options de couleur
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
        changeColor(option.dataset.color, option.dataset.type);
    });
});

document.getElementById('resetColors').addEventListener('click', resetColors);

// Créer des particules animées en arrière-plan
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Taille aléatoire
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Position aléatoire
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Animation delay aléatoire
        particle.style.animationDelay = `${Math.random() * 15}s`;
        
        // Couleur aléatoire entre primary et secondary
        const colors = [getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(), 
                       getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim(), 
                       '#00ffaa'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        
        particlesContainer.appendChild(particle);
    }
}

// Mettre à jour les particules
function updateParticles() {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
    createParticles();
}

// Afficher une notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Charger les pays depuis le fichier JSON
fetch('countries.json')
  .then(response => response.json())
  .then(data => {
    const select = document.getElementById('indicatif');
    data.forEach(pays => {
      const option = document.createElement('option');
      option.value = pays.dial_code;
      option.textContent = `${pays.name} (+${pays.dial_code})`;
      select.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Erreur lors du chargement des pays:', error);
    showNotification("Erreur lors du chargement des pays");
  });

function ouvrirWhatsApp() {
  const indicatif = document.getElementById("indicatif").value;
  const numero = document.getElementById("numero").value.trim();
  const message = document.getElementById("message").value;
  
  if (numero) {
    const fullNumber = indicatif + numero;
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    showNotification("Ouverture de WhatsApp...");
  } else {
    showNotification("Veuillez entrer un numéro !");
  }
}

// Initialiser les particules et les boutons de couleur
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    updateActiveColorButtons();
    
    // Animation d'entrée pour les éléments
    const elements = document.querySelectorAll('.card, .header');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});