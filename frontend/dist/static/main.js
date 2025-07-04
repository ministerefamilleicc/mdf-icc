// JavaScript moderne pour le Ministère de la Famille
document.addEventListener('DOMContentLoaded', function() {
  
  // Configuration API
  const API_BASE_URL = 'http://localhost:8001';
  
  // Fonctions utilitaires API
  async function apiRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Soumettre un formulaire de contact
  async function submitContact(formData) {
    return apiRequest('/api/contacts/', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }


  
  // Animation d'apparition au scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observer tous les éléments avec la classe card
  document.querySelectorAll('.card, .section').forEach(el => {
    observer.observe(el);
  });

  // Gestion des toasts
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Navigation smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // === FAQ PAGE FUNCTIONALITY ===
  // FAQ Search functionality
  const faqSearch = document.getElementById('faq-search');
  if (faqSearch) {
    faqSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const faqItems = document.querySelectorAll('.faq-item');
      
      faqItems.forEach(item => {
        const question = item.querySelector('summary').textContent.toLowerCase();
        const answer = item.querySelector('p').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // FAQ Tab functionality
  const faqTabs = document.querySelectorAll('.faq-tab');
  const faqContents = document.querySelectorAll('.faq-content');
  
  faqTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.dataset.tab;
      
      // Remove active class from all tabs
      faqTabs.forEach(t => t.classList.remove('active'));
      faqContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll('.faq-item details');
  faqItems.forEach(detail => {
    detail.addEventListener('click', function() {
      // Close other open details in the same category
      const siblings = this.parentElement.parentElement.querySelectorAll('details[open]');
      siblings.forEach(sibling => {
        if (sibling !== this) {
          sibling.removeAttribute('open');
        }
      });
    });
  });

  // === CONTACT PAGE FUNCTIONALITY ===
  // Contact form type selection
  const contactOptions = document.querySelectorAll('.contact-option');
  const contactForms = document.querySelectorAll('.contact-form');
  
  contactOptions.forEach(option => {
    option.addEventListener('click', function() {
      const formType = this.dataset.form;
      
      // Hide all forms
      contactForms.forEach(form => form.style.display = 'none');
      
      // Show selected form
      const targetForm = document.getElementById(formType);
      if (targetForm) {
        targetForm.style.display = 'block';
        targetForm.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Update visual selection
      contactOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // === BUG REPORT PAGE FUNCTIONALITY ===
  // Bug type selection
  const bugTypeButtons = document.querySelectorAll('.bug-type-btn');
  const bugTypeInput = document.getElementById('bug_type');
  
  bugTypeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const type = this.dataset.type;
      
      bugTypeButtons.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
      
      if (bugTypeInput) {
        bugTypeInput.value = type;
      }
    });
  });

  // File upload preview
  const fileInput = document.getElementById('screenshot');
  const filePreview = document.getElementById('file-preview');
  
  if (fileInput && filePreview) {
    fileInput.addEventListener('change', function() {
      const file = this.files[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          filePreview.innerHTML = `
            <div class="file-item">
              <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
              <p>${file.name}</p>
              <button type="button" onclick="clearFilePreview()" class="btn-remove">Supprimer</button>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Browser detection for bug reports
  const browserField = document.getElementById('browser');
  if (browserField) {
    const userAgent = navigator.userAgent;
    let browser = 'Inconnu';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    browserField.value = `${browser} - ${navigator.platform}`;
  }

  // === AGENDA PAGE FUNCTIONALITY ===
  // Calendar functionality is handled in agenda.html template directly

  // === FORM VALIDATION AND SUBMISSION ===
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const submitBtn = form.querySelector('button[type="submit"]');
    
    form.addEventListener('submit', function(e) {
      // Basic form validation
      const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          isValid = false;
        } else {
          field.classList.remove('error');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }
      
      // Update submit button
      if (submitBtn) {
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
      }
    });
    
    // Remove error styling on input
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', function() {
        this.classList.remove('error');
      });
    });
  });

  // === KEYBOARD NAVIGATION ===
  document.addEventListener('keydown', function(e) {
    // ESC key to close modals/forms
    if (e.key === 'Escape') {
      const openDetails = document.querySelectorAll('details[open]');
      openDetails.forEach(detail => detail.removeAttribute('open'));
    }
    
    // Enter key on contact options
    if (e.key === 'Enter' && e.target.classList.contains('contact-option')) {
      e.target.click();
    }
  });

  // === POLES FUNCTIONALITY ===
  // Gestion des pôles interactifs sur la page d'accueil
  
  // Fermer le modal en cliquant en dehors
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('pole-modal');
    if (e.target === modal) {
      closePoleModal();
    }
  });
  
  // Fermer le modal avec la touche Échap
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closePoleModal();
    }
  });

  // ========================================
  // FONCTIONS POUR LES PÔLES
  // ========================================

  // Données des activités par pôle
  const polesData = {
    'coordination-generale': {
      title: 'Coordination Générale',
      icon: 'fas fa-sitemap',
      description: 'Supervision globale et coordination entre tous les pôles',
      activities: [
        {
          title: 'Supervision générale',
          icon: 'fas fa-eye',
          description: 'Vue d\'ensemble et supervision de tous les pôles',
          details: ['Coordination inter-pôles', 'Suivi des objectifs généraux', 'Résolution des conflits', 'Reporting global']
        },
        {
          title: 'Planification stratégique',
          icon: 'fas fa-chess-board',
          description: 'Développement et mise en œuvre de la stratégie',
          details: ['Définition des orientations', 'Planification à long terme', 'Allocation des ressources', 'Évaluation des performances']
        },
        {
          title: 'Communication transversale',
          icon: 'fas fa-network-wired',
          description: 'Facilitation de la communication entre pôles',
          details: ['Réunions de coordination', 'Partage d\'informations', 'Harmonisation des pratiques', 'Diffusion des bonnes pratiques']
        }
      ]
    },
    'conseillers': {
      title: 'Pôle Conseillers',
      icon: 'fas fa-comments',
      description: 'Accompagnement, orientation et soutien des familles',
      activities: [
        {
          title: 'Entretiens pastoraux',
          icon: 'fas fa-user-friends',
          description: 'Accompagnement personnalisé pour les couples et familles',
          details: ['Conseils matrimoniaux', 'Résolution de conflits', 'Orientation spirituelle', 'Soutien en période de crise']
        },
        {
          title: 'Ateliers thématiques',
          icon: 'fas fa-chalkboard-teacher',
          description: 'Sessions de formation et d\'échange en groupe',
          details: ['Communication dans le couple', 'Éducation des enfants', 'Gestion des finances familiales', 'Réconciliation familiale']
        },
        {
          title: 'Suivi personnalisé',
          icon: 'fas fa-chart-line',
          description: 'Accompagnement à long terme des familles',
          details: ['Plans d\'accompagnement individualisés', 'Suivi régulier des progrès', 'Réévaluation des besoins', 'Orientation vers d\'autres pôles si nécessaire']
        }
      ]
    },
    'coordination': {
      title: 'Pôle Coordination Événementielle',
      icon: 'fas fa-calendar-alt',
      description: 'Organisation des cérémonies nuptiales et événements familiaux',
      activities: [
        {
          title: 'Cérémonies de mariage',
          icon: 'fas fa-ring',
          description: 'Organisation complète des cérémonies nuptiales',
          details: ['Préparation des couples', 'Coordination liturgique', 'Gestion des invitations', 'Suivi post-cérémonie']
        },
        {
          title: 'Événements familiaux',
          icon: 'fas fa-calendar-check',
          description: 'Organisation d\'événements pour les familles',
          details: ['Fêtes de famille', 'Anniversaires de mariage', 'Célébrations d\'étapes importantes', 'Événements communautaires']
        },
        {
          title: 'Coordination logistique',
          icon: 'fas fa-tasks',
          description: 'Gestion pratique et logistique des événements',
          details: ['Réservation des lieux', 'Coordination des prestataires', 'Gestion du matériel', 'Planning détaillé']
        }
      ]
    },
    'secretariat': {
      title: 'Pôle Secrétariat',
      icon: 'fas fa-folder-open',
      description: 'Gestion administrative et accueil des familles',
      activities: [
        {
          title: 'Gestion des dossiers',
          icon: 'fas fa-file-alt',
          description: 'Administration et suivi des dossiers familiaux',
          details: ['Création et mise à jour des dossiers', 'Archivage sécurisé', 'Suivi administratif', 'Confidentialité garantie']
        },
        {
          title: 'Accueil et orientation',
          icon: 'fas fa-door-open',
          description: 'Premier contact et orientation des familles',
          details: ['Accueil chaleureux', 'Écoute des besoins', 'Orientation vers les bons pôles', 'Information sur les services']
        },
        {
          title: 'Communication',
          icon: 'fas fa-envelope',
          description: 'Gestion de la communication interne et externe',
          details: ['Courriers et emails', 'Planification des rendez-vous', 'Information des familles', 'Coordination entre pôles']
        }
      ]
    },
    'naissances': {
      title: 'Cellule des Naissances',
      icon: 'fas fa-baby',
      description: 'Accompagnement des familles lors des naissances',
      activities: [
        {
          title: 'Préparation à la parentalité',
          icon: 'fas fa-baby-carriage',
          description: 'Accompagnement avant et après la naissance',
          details: ['Conseils prénataux', 'Préparation spirituelle', 'Soutien émotionnel', 'Information pratique']
        },
        {
          title: 'Bénédictions des enfants',
          icon: 'fas fa-praying-hands',
          description: 'Cérémonies de bénédiction et présentation',
          details: ['Organisation des cérémonies', 'Préparation spirituelle des parents', 'Coordination avec les familles', 'Suivi post-cérémonie']
        },
        {
          title: 'Soutien familial',
          icon: 'fas fa-hands-helping',
          description: 'Aide pratique et spirituelle aux nouvelles familles',
          details: ['Visites aux nouvelles mamans', 'Aide matérielle si besoin', 'Conseils d\'éducation', 'Intégration dans la communauté']
        }
      ]
    },
    'formation': {
      title: 'Pôle Formation',
      icon: 'fas fa-graduation-cap',
      description: 'Organisation de formations et développement des compétences',
      activities: [
        {
          title: 'Formations bibliques',
          icon: 'fas fa-book',
          description: 'Enseignement et étude de la Parole de Dieu',
          details: ['Études bibliques thématiques', 'Formation des leaders', 'Herméneutique biblique', 'Application pratique']
        },
        {
          title: 'Formations pratiques',
          icon: 'fas fa-tools',
          description: 'Développement de compétences pratiques',
          details: ['Techniques de counseling', 'Gestion de conflits', 'Communication efficace', 'Leadership familial']
        },
        {
          title: 'Développement personnel',
          icon: 'fas fa-user-graduate',
          description: 'Croissance personnelle et spirituelle',
          details: ['Développement du caractère', 'Gestion du stress', 'Équilibre vie-foi', 'Discernement spirituel']
        }
      ]
    },
    'inter-eglise': {
      title: 'Pôle Inter-Église',
      icon: 'fas fa-handshake',
      description: 'Coordination et partenariat avec d\'autres églises',
      activities: [
        {
          title: 'Partenariats ecclésiaux',
          icon: 'fas fa-church',
          description: 'Développement de relations avec d\'autres églises',
          details: ['Création de partenariats', 'Échange de bonnes pratiques', 'Projets communs', 'Soutien mutuel']
        },
        {
          title: 'Événements inter-églises',
          icon: 'fas fa-users',
          description: 'Organisation d\'événements multi-églises',
          details: ['Conférences familiales', 'Formations conjointes', 'Célébrations communes', 'Camps familiaux']
        },
        {
          title: 'Coordination régionale',
          icon: 'fas fa-globe',
          description: 'Représentation et coordination au niveau régional',
          details: ['Participation aux réseaux', 'Représentation institutionnelle', 'Échange d\'expériences', 'Veille stratégique']
        }
      ]
    },
    'qualite': {
      title: 'Pôle Qualité',
      icon: 'fas fa-medal',
      description: 'Suivi qualité et amélioration continue des services',
      activities: [
        {
          title: 'Évaluation des services',
          icon: 'fas fa-chart-bar',
          description: 'Mesure et évaluation de la qualité des accompagnements',
          details: ['Enquêtes de satisfaction', 'Indicateurs de performance', 'Retours d\'expérience', 'Analyse des résultats']
        },
        {
          title: 'Amélioration continue',
          icon: 'fas fa-cogs',
          description: 'Optimisation constante des processus et services',
          details: ['Identification des axes d\'amélioration', 'Mise en place d\'actions correctives', 'Innovation dans les méthodes', 'Formation continue des équipes']
        },
        {
          title: 'Standards et procédures',
          icon: 'fas fa-clipboard-check',
          description: 'Définition et maintenance des standards de qualité',
          details: ['Rédaction de procédures', 'Formation aux standards', 'Audits internes', 'Certification des pratiques']
        }
      ]
    },
    'priere': {
      title: 'Pôle Prière',
      icon: 'fas fa-praying-hands',
      description: 'Accompagnement spirituel et intercession',
      activities: [
        {
          title: 'Intercession familiale',
          icon: 'fas fa-hands',
          description: 'Prière d\'intercession pour les familles accompagnées',
          details: ['Groupes de prière spécialisés', 'Intercession personnalisée', 'Chaînes de prière', 'Soutien spirituel intensif']
        },
        {
          title: 'Accompagnement spirituel',
          icon: 'fas fa-cross',
          description: 'Guidance et soutien spirituel personnel',
          details: ['Direction spirituelle', 'Discernement de la volonté divine', 'Croissance dans la foi', 'Libération spirituelle']
        },
        {
          title: 'Temps de prière communautaires',
          icon: 'fas fa-users-praying',
          description: 'Organisation de moments de prière collective',
          details: ['Veillées de prière', 'Retraites spirituelles', 'Prières thématiques', 'Formation à la prière']
        }
      ]
    },
    'outils': {
      title: 'Pôle Outils',
      icon: 'fas fa-tools',
      description: 'Développement d\'outils pédagogiques et de communication',
      activities: [
        {
          title: 'Outils pédagogiques',
          icon: 'fas fa-chalkboard',
          description: 'Création de supports de formation et d\'accompagnement',
          details: ['Guides d\'accompagnement', 'Supports de formation', 'Livrets thématiques', 'Outils d\'évaluation']
        },
        {
          title: 'Ressources numériques',
          icon: 'fas fa-laptop',
          description: 'Développement de solutions digitales',
          details: ['Applications mobiles', 'Plateformes de formation en ligne', 'Outils de communication', 'Base de données des ressources']
        },
        {
          title: 'Innovation et recherche',
          icon: 'fas fa-lightbulb',
          description: 'Recherche et développement de nouvelles approches',
          details: ['Veille méthodologique', 'Expérimentation de nouveaux outils', 'Recherche académique', 'Innovation collaborative']
        }
      ]
    }
  };

  // Fonction pour afficher les activités d'un pôle
  function showPoleActivities(poleId) {
    const pole = polesData[poleId];
    if (!pole) return;
    
    // Mettre à jour le visual des cartes
    document.querySelectorAll('.pole-card').forEach(card => {
      card.classList.remove('active');
    });
    document.querySelector(`[data-pole="${poleId}"]`).classList.add('active');
    
    // Mettre à jour le contenu du modal
    document.getElementById('pole-modal-title').innerHTML = `
      <i class="${pole.icon}"></i> ${pole.title}
    `;
    
    let activitiesHTML = `
      <div class="pole_description">
        <p><strong>${pole.description}</strong></p>
      </div>
      <div class="activity-grid">
    `;
    
    pole.activities.forEach(activity => {
      activitiesHTML += `
        <div class="activity-item">
          <h4><i class="${activity.icon}"></i> ${activity.title}</h4>
          <p>${activity.description}</p>
          <ul>
            ${activity.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
      `;
    });
    
    activitiesHTML += `
      </div>
      <div class="pole-contact">
        <h4><i class="fas fa-envelope"></i> Intéressé par ce pôle ?</h4>
        <p>Contactez-nous pour en savoir plus ou pour rejoindre ce pôle</p>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfNaK0cMeKv4ix9R6Rhwh5ycwtjrZNKst6ZV4NorjMfk4BP2w/viewform?usp=sharing&ouid=104604826454158221430" target="_blank" class="btn btn-primary">
          <i class="fas fa-paper-plane"></i> Nous contacter
        </a>
      </div>
    `;
    
    document.getElementById('pole-modal-body').innerHTML = activitiesHTML;
    
    // Afficher le modal
    const modal = document.getElementById('pole-modal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Fonction pour fermer le modal
  function closePoleModal() {
    const modal = document.getElementById('pole-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Retirer l'état actif des cartes
    document.querySelectorAll('.pole-card').forEach(card => {
      card.classList.remove('active');
    });
  }

  // Fonction pour basculer l'affichage des descriptions de pôles
  window.togglePoleDescription = function(event, poleId) {
    event.stopPropagation(); // Empêcher le clic sur la carte
    
    const card = document.querySelector(`[data-pole="${poleId}"]`);
    const description = card.querySelector('.card-description');
    const indicator = card.querySelector('.pole-indicator');
    
    if (description.classList.contains('hidden')) {
      // Cacher toutes les autres descriptions ouvertes
      document.querySelectorAll('.card-description.visible').forEach(desc => {
        desc.classList.remove('visible');
        desc.classList.add('hidden');
      });
      document.querySelectorAll('.pole-indicator.expanded').forEach(ind => {
        ind.classList.remove('expanded');
      });
      
      // Afficher cette description
      description.classList.remove('hidden');
      description.classList.add('visible');
      indicator.classList.add('expanded');
    } else {
      // Cacher cette description
      description.classList.remove('visible');
      description.classList.add('hidden');
      indicator.classList.remove('expanded');
    }
  };

  // Ajouter les event listeners pour les clics sur les cartes (sans les flèches)
  document.querySelectorAll('.pole-card.compact').forEach(card => {
    card.addEventListener('click', function(event) {
      // Vérifier que le clic n'est pas sur la flèche
      if (!event.target.closest('.pole-indicator')) {
        const poleId = this.dataset.pole;
        showPoleActivities(poleId);
      }
    });
  });

  // Rendre les fonctions globalement accessibles
  window.showPoleActivities = showPoleActivities;
  window.closePoleModal = closePoleModal;

  // === UTILITY FUNCTIONS ===
  window.clearFilePreview = function() {
    const filePreview = document.getElementById('file-preview');
    const fileInput = document.getElementById('screenshot');
    
    if (filePreview) filePreview.innerHTML = '';
    if (fileInput) fileInput.value = '';
  };


  // Handle existing toasts on page load
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    setTimeout(() => { 
      existingToast.style.display = 'none'; 
    }, 4000);
  }

  console.log('Ministère de la Famille - JavaScript loaded successfully');
});
