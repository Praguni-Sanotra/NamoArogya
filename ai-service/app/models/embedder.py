"""
Transformer-based embedding model for medical text
"""

from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np
from app.config import settings
from app.utils.logger import logger


class MedicalEmbedder:
    """
    Generates semantic embeddings for medical text using transformer models
    """
    
    def __init__(self):
        """Initialize the embedding model"""
        self.model = None
        self.model_name = settings.model_name
        self.embedding_dim = settings.embedding_dim
        
    def load_model(self):
        """
        Load the pre-trained transformer model
        
        Raises:
            Exception: If model loading fails
        """
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Model loaded successfully. Embedding dimension: {self.embedding_dim}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def encode(
        self,
        texts: Union[str, List[str]],
        batch_size: int = 32,
        show_progress: bool = False
    ) -> np.ndarray:
        """
        Generate embeddings for input text(s)
        
        Args:
            texts: Single text string or list of texts
            batch_size: Batch size for encoding
            show_progress: Show progress bar
            
        Returns:
            numpy array of embeddings (shape: [n_texts, embedding_dim])
            
        Raises:
            ValueError: If model is not loaded
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Convert single string to list
        if isinstance(texts, str):
            texts = [texts]
        
        try:
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=show_progress,
                convert_to_numpy=True
            )
            
            logger.debug(f"Generated embeddings for {len(texts)} texts")
            return embeddings
            
        except Exception as e:
            logger.error(f"Encoding failed: {e}")
            raise
    
    def encode_batch(
        self,
        texts: List[str],
        batch_size: int = 32
    ) -> np.ndarray:
        """
        Batch encode multiple texts efficiently
        
        Args:
            texts: List of text strings
            batch_size: Batch size for processing
            
        Returns:
            numpy array of embeddings
        """
        return self.encode(texts, batch_size=batch_size, show_progress=True)
    
    def get_embedding_dim(self) -> int:
        """
        Get the dimension of embeddings
        
        Returns:
            Embedding dimension
        """
        return self.embedding_dim
    
    def is_loaded(self) -> bool:
        """
        Check if model is loaded
        
        Returns:
            True if model is loaded, False otherwise
        """
        return self.model is not None


# Global embedder instance
embedder = MedicalEmbedder()
