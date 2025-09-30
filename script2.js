// Enregistrer le service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker enregistré ✅', reg))
      .catch(err => console.log('Erreur Service Worker ❌', err));
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
    
    // Forcer le recalcul des styles pour s'assurer que les changements s'appliquent
    document.body.style.animation = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.animation = null;
}

function resetColors() {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--container-color');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('containerColor');
    updateActiveColorButtons();
    updateParticles();
    showNotification("Couleurs réinitialisées");
    
    // Forcer le recalcul des styles
    document.body.style.animation = 'none';
    document.body.offsetHeight;
    document.body.style.animation = null;
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
  const message = document.getElementById("textInput").value;
  
  if (numero) {
    const fullNumber = indicatif + numero;
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    showNotification("Ouverture de WhatsApp...");
  } else {
    showNotification("Veuillez entrer un numéro !");
  }
}

// ==================== FONCTIONNALITÉ DE TRADUCTION ====================

const textInput = document.getElementById("textInput");
const modalText = document.getElementById("modalText");
const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");
const translatedResult = document.getElementById("translatedResult");

let storedText = "";

// Pré-remplir la modal avec le texte initial
document.getElementById("translateModal").addEventListener("show.bs.modal", () => {
  storedText = textInput.value.trim();
  modalText.value = storedText; // texte initial, non traduit
  translatedResult.textContent = "";
  sourceLang.value = "";
  targetLang.value = "";
});

// Traduction via Google Translate non officiel
async function googleTranslate(text, from, to) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join("");
  } catch (err) {
    console.error("Erreur Google Translate:", err);
    return "Erreur de traduction ❌";
  }
}

// Bouton Traduire → uniquement traduit et affiche dans translatedResult
document.getElementById("btnTranslate").addEventListener("click", async () => {
  const from = sourceLang.value;
  const to = targetLang.value;

  if (!storedText) return showNotification("Le texte est vide !");
  if (!from) return showNotification("Veuillez choisir la langue de départ !");
  if (!to) return showNotification("Veuillez choisir la langue cible !");
  if (from === to) return showNotification("Langue source et cible identiques !");

  translatedResult.textContent = "Traduction en cours...";
  const result = await googleTranslate(storedText, from, to);
  translatedResult.textContent = result; // seulement ici
});

// Bouton OK → mettre à jour textarea principal
document.getElementById("btnOk").addEventListener("click", () => {
  if (translatedResult.textContent.trim()) {
    textInput.value = translatedResult.textContent.trim();
    showNotification("Texte traduit inséré !");
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById('translateModal'));
  modal.hide();
});

// ==================== INITIALISATION ====================

// Initialiser les particules et les boutons de couleur
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    updateActiveColorButtons();
    
    // Animation d'entrée pour les éléments
    const elements = document.querySelectorAll('.card, .header');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
    
    console.log("Application WA Access initialisée avec succès !");
    console.log("Fonctionnalités disponibles :");
    console.log("- Changement de thème (bouton en haut à droite)");
    console.log("- Personnalisation des couleurs (bouton en bas à gauche)");
    console.log("- Traduction de messages (bouton 'Traduire le message')");
    console.log("- Mode sombre/clair");
    console.log("- Modification des couleurs principales et du container");
});