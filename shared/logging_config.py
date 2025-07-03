"""
Configuration centralisée des logs pour le projet MDF (Ministère de la Famille)
"""

import logging
import logging.handlers
import os
from datetime import datetime
from pathlib import Path
from typing import Optional
import functools
import re


class MDFLoggerConfig:
    """Configuration centralisée des loggers MDF"""
    
    # Chemin centralisé des logs - TOUS les logs vont dans le dossier principal
    # Configuration des chemins de logs - utiliser des chemins relatifs en CI
    if os.getenv('GITHUB_ACTIONS'):
        # En CI, utiliser le répertoire de travail courant
        LOG_DIR = Path.cwd() / "logs"
    else:
        # En développement local, utiliser le chemin absolu
        LOG_DIR = Path("/Users/elsem/Documents/Code/mdf_app/logs")
    FRONTEND_LOG = LOG_DIR / "frontend.log"
    BACKEND_LOG = LOG_DIR / "backend.log"
    MAIN_LOG = LOG_DIR / "main.log"
    ERROR_LOG = LOG_DIR / "errors.log"
    EMAIL_LOG = LOG_DIR / "email.log"
    PDF_LOG = LOG_DIR / "pdf.log"
    
    # Niveaux de log par environnement
    LOG_LEVELS = {
        "development": logging.INFO,  # Changé de DEBUG à INFO pour réduire les logs
        "testing": logging.INFO,
        "production": logging.WARNING
    }
    
    # Format des messages de log - SANS données personnelles
    DETAILED_FORMAT = (
        "%(asctime)s | %(name)s | %(levelname)-8s | "
        "%(filename)s:%(lineno)d | %(funcName)s() | %(message)s"
    )
    
    SIMPLE_FORMAT = "%(asctime)s | %(levelname)-8s | %(message)s"
    
    def __init__(self, environment: str = "development"):
        self.environment = environment
        self.log_level = self.LOG_LEVELS.get(environment, logging.INFO)
        self._setup_log_directory()
    
    def _setup_log_directory(self):
        """Crée le répertoire de logs centralisé s'il n'existe pas"""
        self.LOG_DIR.mkdir(parents=True, exist_ok=True)
        
        # Créer les fichiers de log s'ils n'existent pas
        for log_file in [self.FRONTEND_LOG, self.BACKEND_LOG, self.MAIN_LOG, self.ERROR_LOG, self.EMAIL_LOG, self.PDF_LOG]:
            log_file.touch(exist_ok=True)
    
    def get_logger(self, name: str, component: str = "main") -> logging.Logger:
        """
        Crée ou récupère un logger configuré
        
        Args:
            name: Nom du logger (généralement __name__)
            component: Composant ('frontend', 'backend', 'main')
        
        Returns:
            Logger configuré
        """
        logger = logging.getLogger(name)
        
        # Éviter la duplication des handlers
        if logger.hasHandlers():
            return logger
        
        logger.setLevel(self.log_level)
        
        # Handler console avec couleurs pour développement
        console_handler = self._create_console_handler()
        logger.addHandler(console_handler)
        
        # Handler fichier principal selon le composant
        file_handler = self._create_file_handler(component)
        logger.addHandler(file_handler)
        
        # Handler fichier pour les erreurs (toutes les erreurs centralisées)
        error_handler = self._create_error_handler()
        logger.addHandler(error_handler)
        
        # Handler rotatif pour éviter des fichiers trop volumineux
        rotating_handler = self._create_rotating_handler(component)
        logger.addHandler(rotating_handler)
        
        return logger
    
    def _create_console_handler(self) -> logging.StreamHandler:
        """Crée un handler console avec formatage coloré"""
        handler = logging.StreamHandler()
        handler.setLevel(self.log_level)
        
        if self.environment == "development":
            formatter = ColoredFormatter(self.DETAILED_FORMAT)
        else:
            formatter = logging.Formatter(self.SIMPLE_FORMAT)
        
        handler.setFormatter(formatter)
        return handler
    
    def _create_file_handler(self, component: str) -> logging.FileHandler:
        """Crée un handler fichier selon le composant"""
        log_files = {
            "frontend": self.FRONTEND_LOG,
            "backend": self.BACKEND_LOG,
            "main": self.MAIN_LOG
        }
        
        log_file = log_files.get(component, self.MAIN_LOG)
        handler = logging.FileHandler(str(log_file), encoding="utf-8")
        handler.setLevel(self.log_level)
        
        formatter = logging.Formatter(self.DETAILED_FORMAT)
        handler.setFormatter(formatter)
        return handler
    
    def _create_error_handler(self) -> logging.FileHandler:
        """Crée un handler spécifique pour les erreurs"""
        handler = logging.FileHandler(str(self.ERROR_LOG), encoding="utf-8")
        handler.setLevel(logging.ERROR)
        
        formatter = logging.Formatter(
            "%(asctime)s | ERREUR | %(name)s | %(filename)s:%(lineno)d | "
            "%(funcName)s() | %(message)s | %(exc_info)s"
        )
        handler.setFormatter(formatter)
        return handler
    
    def _create_rotating_handler(self, component: str) -> logging.handlers.RotatingFileHandler:
        """Crée un handler rotatif pour éviter des fichiers trop volumineux"""
        log_file = self.LOG_DIR / f"{component}_rotating.log"
        
        handler = logging.handlers.RotatingFileHandler(
            str(log_file),
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5,
            encoding="utf-8"
        )
        handler.setLevel(self.log_level)
        
        formatter = logging.Formatter(self.DETAILED_FORMAT)
        handler.setFormatter(formatter)
        return handler


class ColoredFormatter(logging.Formatter):
    """Formateur avec couleurs pour la console en développement"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Vert
        'WARNING': '\033[33m',  # Jaune
        'ERROR': '\033[31m',    # Rouge
        'CRITICAL': '\033[35m', # Magenta
        'RESET': '\033[0m'      # Reset
    }
    
    def format(self, record):
        log_message = super().format(record)
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        return f"{color}{log_message}{self.COLORS['RESET']}"


# Instance globale de configuration
mdf_config = MDFLoggerConfig(
    environment=os.getenv("MDF_ENVIRONMENT", "development")
)


# Fonctions utilitaires simplifiées
def get_mdf_logger(name: str = None, component: str = "main") -> logging.Logger:
    """
    Récupère un logger configuré pour le projet MDF
    
    Args:
        name: Nom du logger (utilise __name__ par défaut)
        component: Composant ('frontend', 'backend', 'main')
    
    Returns:
        Logger configuré
    """
    if name is None:
        import inspect
        frame = inspect.currentframe().f_back
        name = frame.f_globals.get('__name__', 'mdf_unknown')
    
    return mdf_config.get_logger(name, component)


def log_api_request(logger: logging.Logger, method: str, endpoint: str, 
                   status_code: Optional[int] = None, duration: Optional[float] = None):
    """Log spécialisé pour les requêtes API"""
    message = f"API {method} {endpoint}"
    if status_code:
        message += f" -> {status_code}"
    if duration:
        message += f" ({duration:.2f}s)"
    
    if status_code and status_code >= 400:
        logger.warning(message)
    else:
        logger.info(message)


def log_database_operation(logger: logging.Logger, operation: str, table: str, 
                          record_id: Optional[str] = None, success: bool = True, 
                          error_message: Optional[str] = None):
    """Log spécialisé pour les opérations de base de données"""
    message = f"DB {operation} on {table}"
    if record_id:
        message += f" (ID: {record_id})"
    
    if success:
        logger.info(f"{message} - SUCCESS")
    else:
        error_detail = f" - ERROR: {error_message}" if error_message else " - ERROR"
        logger.error(f"{message}{error_detail}")


def log_form_submission(logger: logging.Logger, form_type: str, user_data: dict, 
                       success: bool = True, error_message: Optional[str] = None):
    """Log spécialisé pour les soumissions de formulaires"""
    # Données de base pour le log (sans informations sensibles)
    safe_data = {
        "nom": user_data.get("nom", "N/A"),
        "email": user_data.get("email", "N/A")[:3] + "***" if user_data.get("email") else "N/A"
    }
    
    message = f"FORM {form_type} submission from {safe_data['nom']} ({safe_data['email']})"
    
    if success:
        logger.info(f"{message} - SUCCESS")
    else:
        error_detail = f" - ERROR: {error_message}" if error_message else " - ERROR"
        logger.error(f"{message}{error_detail}")


def log_email_sent(logger: logging.Logger, recipient: str, subject: str, 
                  success: bool = True, error_message: Optional[str] = None):
    """Log spécialisé pour l'envoi d'emails"""
    # Masquer une partie de l'email pour la confidentialité
    masked_email = recipient[:3] + "***@" + recipient.split("@")[1] if "@" in recipient else recipient[:3] + "***"
    
    message = f"EMAIL to {masked_email} - Subject: {subject[:30]}{'...' if len(subject) > 30 else ''}"
    
    if success:
        logger.info(f"{message} - SENT")
    else:
        error_detail = f" - ERROR: {error_message}" if error_message else " - ERROR"
        logger.error(f"{message}{error_detail}")


def log_user_action(logger: logging.Logger, action_type: str, details: dict):
    """Log spécialisé pour les actions utilisateur"""
    message = f"USER_ACTION {action_type}"
    if details:
        safe_details = {k: v for k, v in details.items() if k not in ['password', 'token', 'secret']}
        message += f" - Details: {safe_details}"
    
    logger.info(message)


# Décorateur pour logger automatiquement les fonctions
def log_function_call(logger: logging.Logger):
    """
    Décorateur pour logger automatiquement les appels de fonction
    
    Usage:
        @log_function_call(logger)
        def ma_fonction():
            pass
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            logger.debug(f"Calling {func.__name__} with args={len(args)}, kwargs={len(kwargs)}")
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                logger.debug(f"{func.__name__} completed successfully in {duration:.3f}s")
                return result
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                logger.error(f"{func.__name__} failed after {duration:.3f}s: {str(e)}")
                raise
        return wrapper
    return decorator


def sanitize_for_logs(data: any) -> str:
    """
    Nettoie les données pour les logs en supprimant/masquant les informations sensibles
    
    Args:
        data: Données à nettoyer
        
    Returns:
        str: Données nettoyées pour les logs
    """
    
    # Champs sensibles à masquer complètement
    sensitive_fields = [
        'password', 'passwd', 'secret', 'token', 'key', 'api_key',
        'smtp_password', 'smtp_username', 'database_url', 'db_password'
    ]
    
    # Champs personnels à partiellement masquer
    personal_fields = [
        'email', 'telephone', 'phone', 'nom', 'prenom', 'firstname', 'lastname',
        'adresse', 'address', 'date_naissance', 'birthdate'
    ]
    
    result = data
    
    # Masquer complètement les champs sensibles
    for field in sensitive_fields:
        pattern = r'(' + field + r'["\']?\s*[:=]\s*["\']?)([^"\'}\s,\n]+)'
        result = re.sub(pattern, r'\1***MASKED***', result, flags=re.IGNORECASE)
    
    # Masquer partiellement les données personnelles
    # Email: garder les 3 premiers caractères et le domaine
    email_pattern = r'\b([a-zA-Z0-9]{1,3})[a-zA-Z0-9._-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b'
    result = re.sub(email_pattern, r'\1***@\2', result)
    
    # Téléphone: garder seulement les 2 premiers et 2 derniers chiffres
    phone_pattern = r'\b(\d{2})\d+(\d{2})\b'
    result = re.sub(phone_pattern, r'\1***\2', result)
    
    # Noms: garder seulement la première lettre
    name_pattern = r'\b([A-Z])[a-zA-ZÀ-ÿ]{2,}\b'
    result = re.sub(name_pattern, r'\1***', result)
    
    return result


def safe_log(logger, level: str, message: str, *args, **kwargs):
    """
    Log sécurisé qui nettoie automatiquement les données sensibles
    
    Args:
        logger: Logger à utiliser
        level: Niveau de log ('info', 'warning', 'error', etc.)
        message: Message à logger
        *args, **kwargs: Arguments additionnels
    """
    # Nettoyer le message
    clean_message = sanitize_for_logs(message)
    
    # Nettoyer les arguments
    clean_args = [sanitize_for_logs(arg) for arg in args]
    clean_kwargs = {k: sanitize_for_logs(v) for k, v in kwargs.items()}
    
    # Logger selon le niveau
    log_method = getattr(logger, level.lower(), logger.info)
    log_method(clean_message, *clean_args, **clean_kwargs)


# Export des éléments principaux
__all__ = [
    'get_mdf_logger',
    'log_api_request',
    'log_database_operation', 
    'log_form_submission',
    'log_email_sent',
    'log_user_action',
    'log_function_call',
    'MDFLoggerConfig'
]
