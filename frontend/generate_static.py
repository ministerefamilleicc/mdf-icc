#!/usr/bin/env python3
"""
Générateur de site statique pour déploiement sur GitHub Pages
"""

import sys
import shutil
from pathlib import Path
import re

# Ajouter le chemin du module shared
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Import de l'application Flask
try:
    from main import app
except ImportError as e:
    print(f"❌ Erreur d'import: {e}")
    # Créer une app de base si l'import échoue
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def home():
        return '''<!DOCTYPE html>
<html><head><title>Ministère de la Famille</title></head>
<body><h1>Ministère de la Famille</h1><p>Site en déploiement...</p></body></html>'''
except Exception as e:
    print(f"❌ Erreur lors de l'import de l'application: {e}")
    # Créer une app de base si l'import échoue pour toute autre raison
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def home():
        return '''<!DOCTYPE html>
<html><head><title>Ministère de la Famille</title></head>
<body><h1>Ministère de la Famille</h1><p>Site en déploiement...</p></body></html>'''

def clean_html_for_static(html_content, base_path="./"):
    """
    Nettoie le HTML pour le rendre compatible avec un site statique
    """
    # Ajuster les chemins des assets statiques AVANT les autres remplacements
    html_content = re.sub(r'src="/static/', f'src="{base_path}static/', html_content)
    html_content = re.sub(r'href="/static/', f'href="{base_path}static/', html_content)
    
    # Remplacer les liens de navigation (mais pas les liens vers les assets)
    html_content = re.sub(r'href="/"(?![^<]*\.)', 'href="index.html"', html_content)
    html_content = re.sub(r'href="/([^"]*)"(?![^<]*\.(css|js|png|jpg|gif|svg))', r'href="\1.html"', html_content)
    
    return html_content

def generate_static_site():
    """
    Génère un site statique à partir de l'application Flask
    """
    print("🚀 Génération du site statique...")
    
    # Créer le dossier de destination
    dist_dir = Path(__file__).parent / "dist"
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir()
    
    # Pages à générer
    routes = [
        ('/', 'index.html'),
        ('/faq', 'faq.html'),
        ('/presentation', 'presentation.html')
    ]
    
    with app.test_client() as client:
        for route, filename in routes:
            print(f"📄 Génération de {filename} depuis {route}")
            
            try:
                response = client.get(route)
                if response.status_code == 200:
                    html_content = response.get_data(as_text=True)
                    
                    # Nettoyer le HTML pour le site statique
                    html_content = clean_html_for_static(html_content)
                    
                    # Écrire le fichier
                    file_path = dist_dir / filename
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    
                    print(f"✅ {filename} généré avec succès")
                else:
                    print(f"❌ Erreur {response.status_code} pour {route}")
                    
            except Exception as e:
                print(f"❌ Erreur lors de la génération de {filename}: {e}")
    
    # Copier les fichiers statiques
    static_src = Path(__file__).parent / "static"
    static_dest = dist_dir / "static"
    
    if static_src.exists():
        print("📁 Copie des fichiers statiques...")
        shutil.copytree(static_src, static_dest)
        print("✅ Fichiers statiques copiés")
    
    # Créer un fichier .nojekyll pour GitHub Pages
    nojekyll_path = dist_dir / ".nojekyll"
    nojekyll_path.touch()
    print("✅ Fichier .nojekyll créé")
    


if __name__ == "__main__":
    # Désactiver le logging pour la génération
    import logging
    logging.getLogger().setLevel(logging.CRITICAL)
    
    generate_static_site()
