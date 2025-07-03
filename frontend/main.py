import os
import sys
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, render_template

# Ajouter le chemin du module shared pour l'import du système de logging
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Charger les variables d'environnement principales
load_dotenv(project_root / '.env')


from shared.logging_config import (
    get_mdf_logger,
    log_user_action,
    log_function_call
)

# Initialiser le logger pour le frontend
logger = get_mdf_logger("frontend.main", "frontend")

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Filtre Jinja pour format français JJ/MM/AAAA HH:MM
@app.template_filter('format_datetime_fr')
def format_datetime_fr(value):
    if not value:
        return "-"
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
        except Exception:
            return value  # retourne brut si non convertible
    try:
        return value.strftime('%d/%m/%Y %H:%M')
    except Exception:
        return str(value)


@app.route("/")
@log_function_call(logger)
def home():
    log_user_action(logger, "page_visit", {"page": "home"})
    return render_template("home.html")


@app.route("/faq")
@log_function_call(logger)
def faq():
    log_user_action(logger, "page_visit", {"page": "faq"})
    return render_template("faq.html")


@app.route("/presentation")
@log_function_call(logger)
def presentation():
    log_user_action(logger, "page_visit", {"page": "presentation"})
    return render_template("presentation.html")


if __name__ == "__main__":
    port = int(os.getenv("FRONTEND_PORT", 5002))
    debug_mode = os.getenv("FRONTEND_DEBUG", "False").lower() == "true"
    
    # Configuration pour déploiement
    if os.getenv("FLASK_ENV") == "production":
        logger.info(f"Démarrage du frontend en mode production sur le port {port}")
        app.run(host="0.0.0.0", port=port, debug=False)
    else:
        logger.info(f"Démarrage du frontend en mode développement sur le port {port}")
        app.run(debug=debug_mode, port=port)
