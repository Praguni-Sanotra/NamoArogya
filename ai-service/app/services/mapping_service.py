"""
Core mapping service for NAMASTE to ICD-11 code mapping
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Optional
import numpy as np

from app.config import settings
from app.utils.logger import logger
from app.models.embedder import embedder
from app.models.mapper import mapper
from app.services.preprocessing import preprocessor


class MappingService:
    """
    Main service for semantic mapping between NAMASTE and ICD-11 codes
    """
    
    def __init__(self):
        """Initialize the mapping service"""
        self.icd11_codes = []
        self.namaste_codes = []
        self.icd11_embeddings = None
        self.is_initialized = False
    
    async def initialize(self):
        """
        Initialize all components: load models, data, and embeddings
        
        This should be called during application startup
        """
        try:
            logger.info("Initializing Mapping Service...")
            start_time = time.time()
            
            # Step 1: Load preprocessing model
            logger.info("Loading preprocessing model...")
            preprocessor.load_model()
            
            # Step 2: Load embedding model
            logger.info("Loading embedding model...")
            embedder.load_model()
            
            # Step 3: Load datasets
            logger.info("Loading datasets...")
            self._load_datasets()
            
            # Step 4: Generate ICD-11 embeddings
            logger.info("Generating ICD-11 embeddings...")
            self._generate_icd11_embeddings()
            
            # Step 5: Load embeddings into mapper
            mapper.load_icd11_embeddings(self.icd11_embeddings, self.icd11_codes)
            
            self.is_initialized = True
            elapsed = time.time() - start_time
            
            logger.info(
                f"Mapping Service initialized successfully in {elapsed:.2f}s. "
                f"Loaded {len(self.icd11_codes)} ICD-11 codes, "
                f"{len(self.namaste_codes)} NAMASTE codes."
            )
            
        except Exception as e:
            logger.error(f"Failed to initialize Mapping Service: {e}")
            raise
    
    def _load_datasets(self):
        """Load NAMASTE and ICD-11 datasets from JSON files"""
        # Load ICD-11 codes
        icd11_path = Path(settings.icd11_data_path)
        if not icd11_path.exists():
            raise FileNotFoundError(f"ICD-11 dataset not found: {icd11_path}")
        
        with open(icd11_path, 'r') as f:
            self.icd11_codes = json.load(f)
        
        logger.info(f"Loaded {len(self.icd11_codes)} ICD-11 codes")
        
        # Load NAMASTE codes
        namaste_path = Path(settings.namaste_data_path)
        if not namaste_path.exists():
            raise FileNotFoundError(f"NAMASTE dataset not found: {namaste_path}")
        
        with open(namaste_path, 'r') as f:
            self.namaste_codes = json.load(f)
        
        logger.info(f"Loaded {len(self.namaste_codes)} NAMASTE codes")
    
    def _generate_icd11_embeddings(self):
        """Generate and cache embeddings for all ICD-11 codes"""
        # Prepare text for embedding (combine name and description)
        icd11_texts = [
            f"{code['name']} {code.get('description', '')}"
            for code in self.icd11_codes
        ]
        
        # Preprocess texts
        preprocessed_texts = preprocessor.preprocess_batch(icd11_texts)
        
        # Generate embeddings
        self.icd11_embeddings = embedder.encode_batch(preprocessed_texts)
        
        logger.info(f"Generated embeddings with shape: {self.icd11_embeddings.shape}")
    
    async def map_namaste_to_icd11(
        self,
        namaste_code: str,
        disease_name: str,
        symptoms: Optional[str] = None,
        top_k: int = 5
    ) -> Dict:
        """
        Map NAMASTE disease to ICD-11 codes
        
        Args:
            namaste_code: NAMASTE/AYUSH code
            disease_name: Disease name
            symptoms: Optional additional symptoms
            top_k: Number of suggestions to return
            
        Returns:
            Dictionary with suggestions and metadata
        """
        if not self.is_initialized:
            raise RuntimeError("Mapping Service not initialized. Call initialize() first.")
        
        start_time = time.time()
        
        try:
            # Step 1: Prepare query text
            query_text = disease_name
            if symptoms:
                query_text = f"{disease_name} {symptoms}"
            
            logger.info(f"Mapping NAMASTE code: {namaste_code}, Query: {query_text}")
            
            # Step 2: Preprocess query
            preprocessed_query = preprocessor.preprocess(query_text)
            
            # Step 3: Generate query embedding
            query_embedding = embedder.encode(preprocessed_query)
            
            # Step 4: Find similar ICD-11 codes
            suggestions = mapper.map_to_icd11(
                query_embedding,
                namaste_code=namaste_code,
                top_k=top_k
            )
            
            # Calculate processing time
            processing_time = (time.time() - start_time) * 1000  # Convert to ms
            
            result = {
                "namaste_code": namaste_code,
                "disease_name": disease_name,
                "suggestions": suggestions,
                "processing_time_ms": round(processing_time, 2)
            }
            
            logger.info(f"Mapping completed in {processing_time:.2f}ms")
            return result
            
        except Exception as e:
            logger.error(f"Mapping failed: {e}")
            raise
    
    async def save_feedback(
        self,
        namaste_code: str,
        suggested_icd_code: str,
        accepted: bool,
        correct_icd_code: Optional[str] = None,
        notes: Optional[str] = None,
        doctor_id: Optional[str] = None
    ) -> Dict:
        """
        Save doctor feedback for future model improvement
        
        Args:
            namaste_code: Original NAMASTE code
            suggested_icd_code: ICD-11 code that was suggested
            accepted: Whether suggestion was accepted
            correct_icd_code: Correct ICD-11 code if rejected
            notes: Additional notes
            doctor_id: Doctor identifier
            
        Returns:
            Feedback record with ID
        """
        try:
            feedback_path = Path(settings.feedback_data_path)
            
            # Load existing feedback
            if feedback_path.exists():
                with open(feedback_path, 'r') as f:
                    feedback_data = json.load(f)
            else:
                feedback_data = []
            
            # Create new feedback record
            feedback_record = {
                "id": f"FB-{len(feedback_data) + 1:04d}",
                "timestamp": time.time(),
                "namaste_code": namaste_code,
                "suggested_icd_code": suggested_icd_code,
                "accepted": accepted,
                "correct_icd_code": correct_icd_code,
                "notes": notes,
                "doctor_id": doctor_id
            }
            
            # Append and save
            feedback_data.append(feedback_record)
            
            with open(feedback_path, 'w') as f:
                json.dump(feedback_data, f, indent=2)
            
            logger.info(f"Feedback saved: {feedback_record['id']}")
            return feedback_record
            
        except Exception as e:
            logger.error(f"Failed to save feedback: {e}")
            raise
    
    def get_stats(self) -> Dict:
        """
        Get service statistics
        
        Returns:
            Dictionary with service stats
        """
        return {
            "icd11_codes_loaded": len(self.icd11_codes),
            "namaste_codes_loaded": len(self.namaste_codes),
            "model_loaded": embedder.is_loaded(),
            "mapper_loaded": mapper.is_loaded(),
            "preprocessor_loaded": preprocessor.is_loaded(),
            "is_initialized": self.is_initialized
        }
    
    async def search_ayush_codes(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """
        Search AYUSH codes by text query
        
        Args:
            query: Search query text
            category: Optional category filter
            limit: Maximum results to return
            offset: Pagination offset
            
        Returns:
            Dictionary with search results and metadata
        """
        if not self.is_initialized:
            raise RuntimeError("Mapping Service not initialized")
        
        query_lower = query.lower()
        results = []
        
        for code in self.namaste_codes:
            # Skip if category filter doesn't match
            if category and code.get('category') != category:
                continue
            
            # Search in multiple fields
            searchable_text = " ".join([
                code.get('name', ''),
                code.get('name_english', ''),
                code.get('name_diacritical', ''),
                code.get('description', ''),
                code.get('code', '')
            ]).lower()
            
            if query_lower in searchable_text:
                results.append(code)
        
        # Pagination
        total = len(results)
        paginated_results = results[offset:offset + limit]
        
        return {
            "results": paginated_results,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    
    async def get_ayush_code(self, code: str) -> Optional[Dict]:
        """
        Get specific AYUSH code by code ID
        
        Args:
            code: AYUSH code identifier
            
        Returns:
            Code details or None if not found
        """
        if not self.is_initialized:
            raise RuntimeError("Mapping Service not initialized")
        
        for ayush_code in self.namaste_codes:
            if ayush_code.get('code') == code:
                return ayush_code
        
        return None
    
    def get_categories(self) -> List[str]:
        """
        Get list of all unique categories
        
        Returns:
            List of category names
        """
        if not self.is_initialized:
            raise RuntimeError("Mapping Service not initialized")
        
        categories = set()
        for code in self.namaste_codes:
            category = code.get('category')
            if category:
                categories.add(category)
        
        return sorted(list(categories))
    
    async def get_recommendations(
        self,
        symptoms: str,
        patient_history: Optional[str] = None,
        top_k: int = 5
    ) -> Dict:
        """
        Get AI-powered AYUSH code recommendations based on symptoms
        
        Args:
            symptoms: Patient symptoms description
            patient_history: Optional patient history
            top_k: Number of recommendations to return
            
        Returns:
            Dictionary with AYUSH code recommendations
        """
        if not self.is_initialized:
            raise RuntimeError("Mapping Service not initialized")
        
        start_time = time.time()
        
        try:
            # Prepare query text
            query_text = symptoms
            if patient_history:
                query_text = f"{symptoms} {patient_history}"
            
            logger.info(f"Getting recommendations for: {query_text[:100]}...")
            
            # Preprocess query
            preprocessed_query = preprocessor.preprocess(query_text)
            
            # Generate query embedding
            query_embedding = embedder.encode(preprocessed_query)
            
            # Generate embeddings for AYUSH codes if not cached
            ayush_texts = [
                f"{code.get('name', '')} {code.get('name_english', '')} {code.get('description', '')}"
                for code in self.namaste_codes
            ]
            
            # Preprocess and encode
            preprocessed_texts = preprocessor.preprocess_batch(ayush_texts)
            ayush_embeddings = embedder.encode_batch(preprocessed_texts)
            
            # Calculate similarities
            from sklearn.metrics.pairwise import cosine_similarity
            similarities = cosine_similarity([query_embedding], ayush_embeddings)[0]
            
            # Get top-k indices
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            # Build recommendations
            recommendations = []
            for idx in top_indices:
                code = self.namaste_codes[idx]
                confidence = float(similarities[idx])
                
                # Determine confidence level
                if confidence >= 0.7:
                    confidence_level = "high"
                elif confidence >= 0.5:
                    confidence_level = "medium"
                else:
                    confidence_level = "low"
                
                recommendations.append({
                    "code": code.get('code'),
                    "name": code.get('name'),
                    "name_english": code.get('name_english'),
                    "description": code.get('description'),
                    "category": code.get('category'),
                    "confidence": round(confidence, 3),
                    "confidence_level": confidence_level
                })
            
            processing_time = (time.time() - start_time) * 1000
            
            result = {
                "query": symptoms,
                "recommendations": recommendations,
                "processing_time_ms": round(processing_time, 2)
            }
            
            logger.info(f"Recommendations generated in {processing_time:.2f}ms")
            return result
            
        except Exception as e:
            logger.error(f"Recommendation failed: {e}")
            raise



# Global service instance
mapping_service = MappingService()
