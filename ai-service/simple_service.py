"""
Simplified AI Service - Lightweight version without ML dependencies
Serves AYUSH codes with basic search functionality
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel, Field
import json
from pathlib import Path

# Create FastAPI app
app = FastAPI(
    title="NAMOAROGYA AYUSH Service",
    description="AYUSH code browsing and search service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AYUSH codes
ayush_codes = []
try:
    data_path = Path(__file__).parent / "data" / "namaste_codes.json"
    with open(data_path, 'r', encoding='utf-8') as f:
        ayush_codes = json.load(f)
    print(f"Loaded {len(ayush_codes)} AYUSH codes")
except Exception as e:
    print(f"Error loading AYUSH codes: {e}")

# Schemas
class AyushCode(BaseModel):
    code: str
    namc_id: str = ""
    name: str
    name_diacritical: str = ""
    name_devanagari: str = ""
    name_english: str = ""
    description: str = ""
    category: str = ""
    ontology_branches: str = ""
    system: str = "Ayurveda"

class AyushSearchResponse(BaseModel):
    results: List[AyushCode]
    total: int
    limit: int
    offset: int
    has_more: bool

class HealthResponse(BaseModel):
    status: str
    codes_loaded: int
    service: str

class ModelsResponse(BaseModel):
    namaste_codes_count: int
    service: str

# Routes
@app.get("/")
async def root():
    return {
        "service": "NAMOAROGYA AYUSH Service",
        "version": "1.0.0",
        "status": "running",
        "codes_loaded": len(ayush_codes)
    }

@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        codes_loaded=len(ayush_codes),
        service="ayush-lite"
    )

@app.get("/api/v1/models", response_model=ModelsResponse)
async def get_models():
    return ModelsResponse(
        namaste_codes_count=len(ayush_codes),
        service="ayush-lite"
    )

@app.get("/api/v1/ayush/search", response_model=AyushSearchResponse)
async def search_ayush_codes(
    query: str,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Search AYUSH codes by text query"""
    query_lower = query.lower()
    results = []
    
    for code in ayush_codes:
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
    
    return AyushSearchResponse(
        results=paginated_results,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total
    )

@app.get("/api/v1/ayush/{code}", response_model=AyushCode)
async def get_ayush_code(code: str):
    """Get specific AYUSH code by ID"""
    for ayush_code in ayush_codes:
        if ayush_code.get('code') == code:
            return AyushCode(**ayush_code)
    
    raise HTTPException(status_code=404, detail=f"AYUSH code not found: {code}")

@app.get("/api/v1/ayush/categories", response_model=List[str])
async def get_categories():
    """Get list of all unique categories"""
    categories = set()
    for code in ayush_codes:
        category = code.get('category')
        if category:
            categories.add(category)
    
    return sorted(list(categories))

class RecommendationRequest(BaseModel):
    symptoms: str
    patient_history: Optional[str] = None
    top_k: int = 5

class AyushRecommendation(BaseModel):
    code: str
    name: str
    name_english: str = ""
    description: str = ""
    category: str = ""
    confidence: float
    confidence_level: str

class RecommendationResponse(BaseModel):
    query: str
    recommendations: List[AyushRecommendation]
    processing_time_ms: float

@app.post("/api/v1/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get AI recommendations based on symptoms (simple text matching)"""
    import time
    start_time = time.time()
    
    query = request.symptoms.lower()
    if request.patient_history:
        query += " " + request.patient_history.lower()
    
    # Simple scoring based on text matching
    scored_codes = []
    for code in ayush_codes:
        searchable = " ".join([
            code.get('name', ''),
            code.get('name_english', ''),
            code.get('description', ''),
            code.get('short_definition', ''),
            code.get('long_definition', '')
        ]).lower()
        
        # Count matching words
        query_words = set(query.split())
        searchable_words = set(searchable.split())
        matches = len(query_words & searchable_words)
        
        if matches > 0:
            # Simple confidence score based on matches
            confidence = min(matches / len(query_words), 1.0)
            scored_codes.append((code, confidence))
    
    # Sort by confidence and get top-k
    scored_codes.sort(key=lambda x: x[1], reverse=True)
    top_codes = scored_codes[:request.top_k]
    
    # Build recommendations
    recommendations = []
    for code, confidence in top_codes:
        if confidence >= 0.7:
            level = "high"
        elif confidence >= 0.4:
            level = "medium"
        else:
            level = "low"
        
        recommendations.append(AyushRecommendation(
            code=code.get('code', ''),
            name=code.get('name', ''),
            name_english=code.get('name_english', ''),
            description=code.get('description', ''),
            category=code.get('category', ''),
            confidence=confidence,
            confidence_level=level
        ))
    
    processing_time = (time.time() - start_time) * 1000
    
    return RecommendationResponse(
        query=request.symptoms,
        recommendations=recommendations,
        processing_time_ms=processing_time
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("simple_service:app", host="0.0.0.0", port=8001, reload=True)
