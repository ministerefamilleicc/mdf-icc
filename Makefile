# Makefile pour le projet Ministère de la Famille (Frontend )

# Couleurs pour les messages
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color


help: ## Affiche cette aide
	@echo "$(BLUE)Commandes disponibles pour le projet MDF:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install-frontend: ## Installe les dépendances frontend avec Poetry
	@echo "$(BLUE)Installation des dépendances frontend...$(NC)"
	cd frontend && poetry install

## Développement
run-frontend:
	@echo "$(BLUE)Démarrage du frontend Flask...$(NC)"
	@echo "$(YELLOW)Frontend sera disponible sur: http://localhost:5002$(NC)"
	cd frontend && poetry run python main.py
	
expose:
	$(MAKE) run-frontend &
	sleep 3
	@echo "$(YELLOW)Ouvrez le lien ngrok affiché dans le terminal pour accéder au frontend exposé publiquement.$(NC)"
	ngrok http 5002

ngrok-stop:
	@echo "$(RED)Arrêt de ngrok et fermeture de tous les ports exposés...$(NC)"
	pkill -f "ngrok" || true
	lsof -ti:5002 | xargs kill -9 || true


test-frontend: ## Lance les tests frontend
	@echo "$(BLUE)Exécution des tests frontend...$(NC)"
	cd frontend && poetry run pytest

clean: 
	@echo "$(BLUE)Nettoyage complet...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .coverage

