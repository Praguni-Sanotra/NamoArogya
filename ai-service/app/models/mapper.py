"""
Similarity-based mapper for NAMASTE to ICD-11 code matching
"""

from typing import List, Dict, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings
from app.utils.logger import logger


class SimilarityMapper:
    """
    Maps NAMASTE codes to ICD-11 codes using cosine similarity
    """
    
    def __init__(self):
        """Initialize the mapper"""
        self.icd11_embeddings = None
        self.icd11_codes = None
        self.top_k = settings.top_k_results
        self.high_threshold = settings.high_confidence_threshold
        self.medium_threshold = settings.medium_confidence_threshold
    
    def load_icd11_embeddings(
        self,
        embeddings: np.ndarray,
        codes: List[Dict]
    ):
        """
        Load pre-computed ICD-11 embeddings
        
        Args:
            embeddings: numpy array of ICD-11 embeddings
            codes: List of ICD-11 code dictionaries
        """
        self.icd11_embeddings = embeddings
        self.icd11_codes = codes
        logger.info(f"Loaded {len(codes)} ICD-11 code embeddings")
    
    def compute_similarity(
        self,
        query_embedding: np.ndarray,
        top_k: int = None
    ) -> List[Tuple[int, float]]:
        """
        Compute cosine similarity between query and all ICD-11 codes
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of top results to return (default: from settings)
            
        Returns:
            List of (index, similarity_score) tuples, sorted by score
        """
        if self.icd11_embeddings is None:
            raise ValueError("ICD-11 embeddings not loaded")
        
        if top_k is None:
            top_k = self.top_k
        
        # Reshape query if needed
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        # Compute cosine similarity
        similarities = cosine_similarity(
            query_embedding,
            self.icd11_embeddings
        )[0]
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Return (index, score) pairs
        results = [(int(idx), float(similarities[idx])) for idx in top_indices]
        
        logger.debug(f"Computed similarities, top score: {results[0][1]:.4f}")
        return results
    
    def get_confidence_level(self, similarity: float) -> str:
        """
        Determine confidence level based on similarity score
        
        Args:
            similarity: Cosine similarity score (0-1)
            
        Returns:
            Confidence level: 'high', 'medium', or 'low'
        """
        if similarity >= self.high_threshold:
            return "high"
        elif similarity >= self.medium_threshold:
            return "medium"
        else:
            return "low"
    
    def map_to_icd11(
        self,
        query_embedding: np.ndarray,
        namaste_code: str = None,
        top_k: int = None
    ) -> List[Dict]:
        """
        Map NAMASTE query to ICD-11 codes
        
        Args:
            query_embedding: Embedding of NAMASTE disease description
            namaste_code: Original NAMASTE code (for logging)
            top_k: Number of suggestions to return
            
        Returns:
            List of ICD-11 suggestions with confidence scores
        """
        # Get similarity scores
        similarities = self.compute_similarity(query_embedding, top_k)
        
        # Build suggestions
        suggestions = []
        for idx, score in similarities:
            icd_code = self.icd11_codes[idx]
            
            suggestion = {
                "icd_code": icd_code["code"],
                "disease_name": icd_code["name"],
                "description": icd_code.get("description", ""),
                "chapter": icd_code.get("chapter", ""),
                "confidence": round(score, 4),
                "confidence_level": self.get_confidence_level(score)
            }
            
            suggestions.append(suggestion)
        
        logger.info(
            f"Mapped NAMASTE code '{namaste_code}' to {len(suggestions)} ICD-11 codes. "
            f"Top match: {suggestions[0]['icd_code']} ({suggestions[0]['confidence']:.4f})"
        )
        
        return suggestions
    
    def is_loaded(self) -> bool:
        """
        Check if ICD-11 embeddings are loaded
        
        Returns:
            True if loaded, False otherwise
        """
        return self.icd11_embeddings is not None


# Global mapper instance
mapper = SimilarityMapper()
