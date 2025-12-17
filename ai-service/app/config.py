"""
Configuration management for AI/NLP Service
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_version: str = "v1"
    
    # Model Configuration
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384
    top_k_results: int = 5
    
    # Confidence Thresholds
    high_confidence_threshold: float = 0.85
    medium_confidence_threshold: float = 0.70
    
    # Redis Configuration
    redis_enabled: bool = False
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str = ""
    cache_ttl: int = 86400  # 24 hours
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/ai-service.log"
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173"
    ]
    
    # Data Paths
    namaste_data_path: str = "data/namaste_codes.json"
    icd11_data_path: str = "data/icd11_codes.json"
    feedback_data_path: str = "data/feedback.json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
