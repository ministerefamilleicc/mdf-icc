"""
Modules partagés pour le projet MDF
"""

from .logging_config import (
    get_mdf_logger,
    log_api_request,
    log_database_operation,
    log_form_submission,
    log_email_sent,
    log_user_action,
    log_function_call,
    safe_log
)

__all__ = [
    'get_mdf_logger',
    'log_api_request', 
    'log_database_operation',
    'log_form_submission',
    'log_email_sent',
    'log_user_action',
    'log_function_call',
    'safe_log'
]
