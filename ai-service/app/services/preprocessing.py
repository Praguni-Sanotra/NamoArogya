"""
Medical text preprocessing for NLP pipeline
"""

import re
import spacy
from typing import List, Dict
from app.utils.logger import logger


class MedicalPreprocessor:
    """
    Preprocesses medical text for embedding generation
    """
    
    # Medical stopwords (common words with little semantic value)
    MEDICAL_STOPWORDS = {
        'patient', 'disease', 'condition', 'syndrome', 'disorder',
        'symptoms', 'signs', 'diagnosis', 'treatment', 'therapy'
    }
    
    # AYUSH to Allopathy synonym mapping
    AYUSH_SYNONYMS = {
        'amlapitta': ['acid reflux', 'heartburn', 'gerd', 'gastritis'],
        'jwara': ['fever', 'pyrexia'],
        'kasa': ['cough'],
        'shwasa': ['dyspnea', 'breathlessness', 'asthma'],
        'atisara': ['diarrhea', 'loose stools'],
        'arsha': ['hemorrhoids', 'piles'],
        'pandu': ['anemia', 'pallor'],
        'prameha': ['diabetes', 'polyuria'],
        'vata': ['wind', 'gas', 'bloating'],
        'pitta': ['bile', 'heat', 'inflammation'],
        'kapha': ['phlegm', 'mucus', 'congestion']
    }
    
    def __init__(self):
        """Initialize preprocessor with spaCy model"""
        self.nlp = None
        
    def load_model(self):
        """
        Load spaCy model for lemmatization
        
        Note: Downloads en_core_web_sm if not available
        """
        try:
            logger.info("Loading spaCy model...")
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except OSError:
            logger.warning("spaCy model not found. Downloading...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model downloaded and loaded")
    
    def clean_text(self, text: str) -> str:
        """
        Basic text cleaning
        
        Args:
            text: Input text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces and hyphens
        text = re.sub(r'[^a-z0-9\s\-]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def expand_ayush_terms(self, text: str) -> str:
        """
        Expand AYUSH terms with allopathic synonyms
        
        Args:
            text: Input text with AYUSH terms
            
        Returns:
            Text with expanded synonyms
        """
        text_lower = text.lower()
        expanded_terms = [text]
        
        for ayush_term, synonyms in self.AYUSH_SYNONYMS.items():
            if ayush_term in text_lower:
                # Add synonyms to create richer semantic representation
                expanded_terms.extend(synonyms)
        
        return " ".join(expanded_terms)
    
    def lemmatize(self, text: str) -> str:
        """
        Lemmatize text using spaCy
        
        Args:
            text: Input text
            
        Returns:
            Lemmatized text
        """
        if self.nlp is None:
            logger.warning("spaCy model not loaded. Skipping lemmatization.")
            return text
        
        doc = self.nlp(text)
        lemmas = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]
        
        return " ".join(lemmas)
    
    def remove_medical_stopwords(self, text: str) -> str:
        """
        Remove medical-specific stopwords
        
        Args:
            text: Input text
            
        Returns:
            Text without medical stopwords
        """
        words = text.split()
        filtered = [w for w in words if w.lower() not in self.MEDICAL_STOPWORDS]
        return " ".join(filtered)
    
    def preprocess(
        self,
        text: str,
        expand_synonyms: bool = True,
        lemmatize: bool = True
    ) -> str:
        """
        Full preprocessing pipeline
        
        Args:
            text: Input text
            expand_synonyms: Whether to expand AYUSH synonyms
            lemmatize: Whether to apply lemmatization
            
        Returns:
            Preprocessed text ready for embedding
        """
        if not text:
            return ""
        
        # Step 1: Clean text
        text = self.clean_text(text)
        
        # Step 2: Expand AYUSH terms (if enabled)
        if expand_synonyms:
            text = self.expand_ayush_terms(text)
        
        # Step 3: Lemmatize (if enabled)
        if lemmatize and self.nlp is not None:
            text = self.lemmatize(text)
        
        # Step 4: Remove medical stopwords
        text = self.remove_medical_stopwords(text)
        
        logger.debug(f"Preprocessed text: '{text[:100]}...'")
        return text
    
    def preprocess_batch(self, texts: List[str]) -> List[str]:
        """
        Preprocess multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of preprocessed texts
        """
        return [self.preprocess(text) for text in texts]
    
    def is_loaded(self) -> bool:
        """Check if spaCy model is loaded"""
        return self.nlp is not None


# Global preprocessor instance
preprocessor = MedicalPreprocessor()
