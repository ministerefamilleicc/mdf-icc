# MDF App - GitHub Pages Deployment

## Site déployé
🌐 **Site web :** [https://votre-username.github.io/mdf_app](https://votre-username.github.io/mdf_app)

## Déploiement automatique
Ce site est automatiquement déployé sur GitHub Pages à chaque push sur la branche `main`.

### Structure de déploiement :
- **Source :** Application Flask dans `/frontend`
- **Build :** Génération de site statique via `generate_static.py`
- **Déploiement :** GitHub Actions + GitHub Pages

### Pages disponibles :
- 🏠 **Accueil :** `/` → `index.html`
- ❓ **FAQ :** `/faq` → `faq.html`
- 📋 **Présentation :** `/presentation` → `presentation.html`

## Développement local

```bash
# Installer les dépendances
cd frontend
pip install flask python-dotenv

# Lancer le serveur de développement
python main.py

# Générer le site statique (test)
python generate_static.py
```

## Configuration GitHub Pages

1. Aller dans **Settings** → **Pages**
2. Source : **GitHub Actions**
3. Le déploiement se fait automatiquement

---

*Dernière mise à jour : $(date)*
