"""
Main FastAPI application for AI/NLP Mapping Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import router
from app.services.mapping_service import mapping_service
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    
    Handles startup and shutdown events
    """
    # Startup
    logger.info("Starting AI/NLP Mapping Service...")
    try:
        await mapping_service.initialize()
        logger.info("Service started successfully")
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI/NLP Mapping Service...")


# Create FastAPI app
app = FastAPI(
    title="NAMOAROGYA AI/NLP Mapping Service",
    description="Semantic mapping service for AYUSH (NAMASTE) to ICD-11 codes using NLP and transformers",
    version="1.0.0",
    docs_url=f"/api/{settings.api_version}/docs",
    redoc_url=f"/api/{settings.api_version}/redoc",
    openapi_url=f"/api/{settings.api_version}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(
    router,
    prefix=f"/api/{settings.api_version}",
    tags=["AI Mapping"]
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "NAMOAROGYA AI/NLP Mapping Service",
        "version": "1.0.0",
        "status": "running",
        "docs": f"/api/{settings.api_version}/docs"
    }


@app.get("/ping")
async def ping():
    """Simple ping endpoint"""
    return {"ping": "pong"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.env == "development",
        log_level=settings.log_level.lower()
    )
