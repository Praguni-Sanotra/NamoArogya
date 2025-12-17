"""
FastAPI routes for AI/NLP mapping service
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List, Optional
import time

from app.api import schemas
from app.services.mapping_service import mapping_service
from app.models.embedder import embedder
from app.models.mapper import mapper
from app.config import settings
from app.utils.logger import logger

# Create router
router = APIRouter()

# Track service start time
service_start_time = time.time()


@router.post(
    "/map",
    response_model=schemas.MappingResponse,
    summary="Map NAMASTE to ICD-11",
    description="Map AYUSH/NAMASTE disease code to ICD-11 codes using semantic similarity"
)
async def map_namaste_to_icd11(request: schemas.MappingRequest):
    """
    Map NAMASTE disease to ICD-11 codes
    
    Returns ranked ICD-11 suggestions with confidence scores
    """
    try:
        result = await mapping_service.map_namaste_to_icd11(
            namaste_code=request.namaste_code,
            disease_name=request.disease_name,
            symptoms=request.symptoms,
            top_k=request.top_k
        )
        
        return schemas.MappingResponse(
            namaste_code=result["namaste_code"],
            disease_name=result["disease_name"],
            suggestions=result["suggestions"],
            timestamp=datetime.utcnow(),
            processing_time_ms=result["processing_time_ms"]
        )
        
    except Exception as e:
        logger.error(f"Mapping request failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mapping failed: {str(e)}"
        )


@router.post(
    "/feedback",
    response_model=schemas.FeedbackResponse,
    summary="Submit doctor feedback",
    description="Submit feedback on ICD-11 mapping suggestions for model improvement"
)
async def submit_feedback(request: schemas.FeedbackRequest):
    """
    Submit doctor feedback on mapping suggestions
    
    Used for human-in-the-loop model improvement
    """
    try:
        feedback_record = await mapping_service.save_feedback(
            namaste_code=request.namaste_code,
            suggested_icd_code=request.suggested_icd_code,
            accepted=request.accepted,
            correct_icd_code=request.correct_icd_code,
            notes=request.notes,
            doctor_id=request.doctor_id
        )
        
        return schemas.FeedbackResponse(
            success=True,
            message="Feedback recorded successfully",
            feedback_id=feedback_record["id"]
        )
        
    except Exception as e:
        logger.error(f"Feedback submission failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save feedback: {str(e)}"
        )


@router.get(
    "/health",
    response_model=schemas.HealthResponse,
    summary="Health check",
    description="Check service health and readiness"
)
async def health_check():
    """
    Health check endpoint
    
    Returns service status and component health
    """
    stats = mapping_service.get_stats()
    uptime = time.time() - service_start_time
    
    return schemas.HealthResponse(
        status="healthy" if stats["is_initialized"] else "initializing",
        model_loaded=stats["model_loaded"],
        icd11_codes_loaded=stats["icd11_codes_loaded"],
        cache_enabled=settings.redis_enabled,
        uptime_seconds=round(uptime, 2)
    )


@router.get(
    "/models",
    response_model=schemas.ModelsResponse,
    summary="Model information",
    description="Get information about loaded models and datasets"
)
async def get_models_info():
    """
    Get model and dataset information
    """
    stats = mapping_service.get_stats()
    
    return schemas.ModelsResponse(
        embedding_model=schemas.ModelInfo(
            model_name=settings.model_name,
            embedding_dim=settings.embedding_dim,
            model_loaded=embedder.is_loaded()
        ),
        icd11_codes_count=stats["icd11_codes_loaded"],
        namaste_codes_count=stats["namaste_codes_loaded"]
    )


@router.get(
    "/ayush/search",
    response_model=schemas.AyushSearchResponse,
    summary="Search AYUSH codes",
    description="Search AYUSH/NAMASTE codes by text query with optional category filter"
)
async def search_ayush_codes(
    query: str,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """
    Search AYUSH codes by text query
    
    Searches across code, name, English name, and description fields
    """
    try:
        result = await mapping_service.search_ayush_codes(
            query=query,
            category=category,
            limit=limit,
            offset=offset
        )
        
        return schemas.AyushSearchResponse(**result)
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.get(
    "/ayush/{code}",
    response_model=schemas.AyushCode,
    summary="Get AYUSH code details",
    description="Get detailed information about a specific AYUSH code"
)
async def get_ayush_code(code: str):
    """
    Get specific AYUSH code by ID
    """
    try:
        result = await mapping_service.get_ayush_code(code)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"AYUSH code not found: {code}"
            )
        
        return schemas.AyushCode(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get AYUSH code: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get code: {str(e)}"
        )


@router.get(
    "/ayush/categories",
    response_model=List[str],
    summary="Get AYUSH categories",
    description="Get list of all available AYUSH code categories"
)
async def get_categories():
    """
    Get list of all unique categories
    """
    try:
        categories = mapping_service.get_categories()
        return categories
        
    except Exception as e:
        logger.error(f"Failed to get categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get categories: {str(e)}"
        )


@router.post(
    "/recommend",
    response_model=schemas.RecommendationResponse,
    summary="Get AI recommendations",
    description="Get AI-powered AYUSH code recommendations based on symptoms"
)
async def get_recommendations(request: schemas.RecommendationRequest):
    """
    Get AI-powered AYUSH code recommendations
    
    Uses semantic similarity to match symptoms with AYUSH codes
    """
    try:
        result = await mapping_service.get_recommendations(
            symptoms=request.symptoms,
            patient_history=request.patient_history,
            top_k=request.top_k
        )
        
        return schemas.RecommendationResponse(**result)
        
    except Exception as e:
        logger.error(f"Recommendation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation failed: {str(e)}"
        )

