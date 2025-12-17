"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MappingRequest(BaseModel):
    """Request schema for NAMASTE to ICD-11 mapping"""
    
    namaste_code: str = Field(..., description="NAMASTE/AYUSH code", example="AYU-001")
    disease_name: str = Field(..., description="Disease name in AYUSH terminology", example="Amlapitta")
    symptoms: Optional[str] = Field(None, description="Additional symptoms or notes", example="Acid reflux, heartburn")
    top_k: Optional[int] = Field(5, description="Number of suggestions to return", ge=1, le=10)
    
    class Config:
        json_schema_extra = {
            "example": {
                "namaste_code": "AYU-001",
                "disease_name": "Amlapitta",
                "symptoms": "Acid reflux, indigestion, heartburn",
                "top_k": 5
            }
        }


class Suggestion(BaseModel):
    """Single ICD-11 code suggestion"""
    
    icd_code: str = Field(..., description="ICD-11 code")
    disease_name: str = Field(..., description="ICD-11 disease name")
    description: str = Field("", description="Disease description")
    chapter: str = Field("", description="ICD-11 chapter")
    confidence: float = Field(..., description="Confidence score (0-1)", ge=0, le=1)
    confidence_level: str = Field(..., description="Confidence level: high/medium/low")
    
    class Config:
        json_schema_extra = {
            "example": {
                "icd_code": "DA63",
                "disease_name": "Gastroesophageal reflux disease",
                "description": "GERD with or without esophagitis",
                "chapter": "Digestive system",
                "confidence": 0.91,
                "confidence_level": "high"
            }
        }


class MappingResponse(BaseModel):
    """Response schema for mapping results"""
    
    namaste_code: str = Field(..., description="Original NAMASTE code")
    disease_name: str = Field(..., description="Original disease name")
    suggestions: List[Suggestion] = Field(..., description="List of ICD-11 suggestions")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    processing_time_ms: Optional[float] = Field(None, description="Processing time in milliseconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "namaste_code": "AYU-001",
                "disease_name": "Amlapitta",
                "suggestions": [
                    {
                        "icd_code": "DA63",
                        "disease_name": "Gastroesophageal reflux disease",
                        "description": "GERD with or without esophagitis",
                        "chapter": "Digestive system",
                        "confidence": 0.91,
                        "confidence_level": "high"
                    }
                ],
                "timestamp": "2024-01-15T10:30:00Z",
                "processing_time_ms": 45.2
            }
        }


class FeedbackRequest(BaseModel):
    """Request schema for doctor feedback"""
    
    namaste_code: str = Field(..., description="Original NAMASTE code")
    suggested_icd_code: str = Field(..., description="ICD-11 code that was suggested")
    accepted: bool = Field(..., description="Whether the suggestion was accepted")
    correct_icd_code: Optional[str] = Field(None, description="Correct ICD-11 code if suggestion was rejected")
    notes: Optional[str] = Field(None, description="Additional feedback notes")
    doctor_id: Optional[str] = Field(None, description="Doctor identifier")
    
    class Config:
        json_schema_extra = {
            "example": {
                "namaste_code": "AYU-001",
                "suggested_icd_code": "DA63",
                "accepted": True,
                "correct_icd_code": None,
                "notes": "Perfect match",
                "doctor_id": "DOC-123"
            }
        }


class FeedbackResponse(BaseModel):
    """Response schema for feedback submission"""
    
    success: bool = Field(..., description="Whether feedback was recorded")
    message: str = Field(..., description="Response message")
    feedback_id: Optional[str] = Field(None, description="Feedback record ID")


class HealthResponse(BaseModel):
    """Response schema for health check"""
    
    status: str = Field(..., description="Service status")
    model_loaded: bool = Field(..., description="Whether ML model is loaded")
    icd11_codes_loaded: int = Field(..., description="Number of ICD-11 codes loaded")
    cache_enabled: bool = Field(..., description="Whether caching is enabled")
    uptime_seconds: float = Field(..., description="Service uptime in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "model_loaded": True,
                "icd11_codes_loaded": 150,
                "cache_enabled": False,
                "uptime_seconds": 3600.5
            }
        }


class ModelInfo(BaseModel):
    """Model information schema"""
    
    model_name: str = Field(..., description="Model name")
    embedding_dim: int = Field(..., description="Embedding dimension")
    model_loaded: bool = Field(..., description="Whether model is loaded")


class ModelsResponse(BaseModel):
    """Response schema for models endpoint"""
    
    embedding_model: ModelInfo
    icd11_codes_count: int
    namaste_codes_count: int


class AyushCode(BaseModel):
    """Schema for AYUSH code data"""
    
    code: str = Field(..., description="AYUSH code identifier")
    namc_id: str = Field("", description="NAMC ID")
    name: str = Field(..., description="AYUSH term name")
    name_diacritical: str = Field("", description="Name with diacritical marks")
    name_devanagari: str = Field("", description="Name in Devanagari script")
    name_english: str = Field("", description="English name")
    description: str = Field("", description="Description")
    category: str = Field("", description="Category")
    ontology_branches: str = Field("", description="Ontology branches")
    system: str = Field("Ayurveda", description="Medical system")


class AyushSearchResponse(BaseModel):
    """Response schema for AYUSH code search"""
    
    results: List[AyushCode] = Field(..., description="Search results")
    total: int = Field(..., description="Total matching results")
    limit: int = Field(..., description="Results per page")
    offset: int = Field(..., description="Pagination offset")
    has_more: bool = Field(..., description="Whether more results exist")


class RecommendationRequest(BaseModel):
    """Request schema for AI recommendations"""
    
    symptoms: str = Field(..., description="Patient symptoms description", example="fever, cough, breathlessness")
    patient_history: Optional[str] = Field(None, description="Optional patient history")
    top_k: Optional[int] = Field(5, description="Number of recommendations", ge=1, le=20)


class AyushRecommendation(BaseModel):
    """Single AYUSH code recommendation"""
    
    code: str = Field(..., description="AYUSH code")
    name: str = Field(..., description="AYUSH term name")
    name_english: str = Field("", description="English name")
    description: str = Field("", description="Description")
    category: str = Field("", description="Category")
    confidence: float = Field(..., description="Confidence score", ge=0, le=1)
    confidence_level: str = Field(..., description="Confidence level: high/medium/low")


class RecommendationResponse(BaseModel):
    """Response schema for recommendations"""
    
    query: str = Field(..., description="Original query")
    recommendations: List[AyushRecommendation] = Field(..., description="AI recommendations")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")

