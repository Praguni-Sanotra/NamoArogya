# NAMOAROGYA AI/NLP Mapping Service

Production-grade AI microservice for semantic mapping between AYUSH (NAMASTE) disease codes and ICD-11 codes using NLP and transformer embeddings.

## 🎯 Overview

This service uses state-of-the-art NLP techniques to map traditional AYUSH medical terminology to standardized ICD-11 codes, enabling interoperability between traditional and modern healthcare systems.

### Key Features

- **Semantic Understanding**: Uses transformer-based embeddings to understand clinical semantics
- **High Accuracy**: Cosine similarity matching with confidence scoring
- **Fast Inference**: <500ms response time
- **Human-in-the-Loop**: Doctor feedback mechanism for continuous improvement
- **Production Ready**: Docker-ready, scalable, with health checks
- **FHIR Compatible**: Designed to integrate with FHIR-compliant EMR systems

## 🏗️ Architecture

```
NAMASTE Input → Preprocessing → Embedding → Similarity Matching → Ranked ICD-11 Codes
                    ↓              ↓              ↓
                 spaCy      Transformers    Cosine Similarity
```

### Components

1. **Medical Preprocessor** - Text cleaning, lemmatization, AYUSH synonym expansion
2. **Transformer Embedder** - `sentence-transformers/all-MiniLM-L6-v2` for semantic embeddings
3. **Similarity Mapper** - Cosine similarity with confidence scoring
4. **Feedback System** - Stores doctor validations for model improvement

## 📊 How It Works

### 1. Preprocessing

```python
Input: "Amlapitta with acid reflux"
↓
Cleaned: "amlapitta acid reflux"
↓
Expanded: "amlapitta acid reflux heartburn gerd gastritis"
↓
Lemmatized: "amlapitta acid reflux heartburn gerd gastritis"
```

### 2. Embedding Generation

Converts text to 384-dimensional semantic vector using pre-trained transformer model.

### 3. Similarity Matching

Computes cosine similarity between NAMASTE embedding and all ICD-11 embeddings:

```
similarity = cosine(namaste_embedding, icd11_embedding)
```

### 4. Confidence Scoring

```python
if similarity >= 0.85:  confidence = "high"
elif similarity >= 0.70: confidence = "medium"
else:                    confidence = "low"
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Docker (optional)
- 2GB RAM minimum

### Installation

```bash
# Clone repository
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment file
cp env.example .env
```

### Running Locally

```bash
# Start the service
uvicorn app.main:app --reload

# Service will be available at:
# http://localhost:8000
# API Docs: http://localhost:8000/api/v1/docs
```

### Running with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f ai-service

# Stop
docker-compose down
```

## 📡 API Endpoints

### POST /api/v1/map

Map NAMASTE code to ICD-11 codes.

**Request:**
```json
{
  "namaste_code": "AYU-001",
  "disease_name": "Amlapitta",
  "symptoms": "Acid reflux, heartburn",
  "top_k": 5
}
```

**Response:**
```json
{
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
```

### POST /api/v1/feedback

Submit doctor feedback on suggestions.

**Request:**
```json
{
  "namaste_code": "AYU-001",
  "suggested_icd_code": "DA63",
  "accepted": true,
  "notes": "Perfect match",
  "doctor_id": "DOC-123"
}
```

### GET /api/v1/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "icd11_codes_loaded": 15,
  "cache_enabled": false,
  "uptime_seconds": 3600.5
}
```

### GET /api/v1/models

Get model information.

## 🧪 Testing

```bash
# Test mapping
curl -X POST http://localhost:8000/api/v1/map \
  -H "Content-Type: application/json" \
  -d '{
    "namaste_code": "AYU-001",
    "disease_name": "Amlapitta",
    "symptoms": "Acid reflux"
  }'

# Health check
curl http://localhost:8000/api/v1/health
```

## 🔌 Integration with Backend

### Node.js Backend Integration

```javascript
// backend/src/services/aiMappingService.js
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function suggestICD11Codes(namasteCode, diseaseName, symptoms) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/map`, {
      namaste_code: namasteCode,
      disease_name: diseaseName,
      symptoms: symptoms,
      top_k: 5
    });
    
    return response.data.suggestions;
  } catch (error) {
    console.error('AI mapping failed:', error);
    throw error;
  }
}

module.exports = { suggestICD11Codes };
```

### Docker Compose Integration

```yaml
# Add to main docker-compose.yml
services:
  backend:
    # ... existing config
    environment:
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - ai-service
  
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    networks:
      - namoarogya-network
```

## 📁 Project Structure

```
ai-service/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── models/
│   │   ├── embedder.py      # Transformer embeddings
│   │   └── mapper.py        # Similarity matching
│   ├── services/
│   │   ├── preprocessing.py # Text preprocessing
│   │   └── mapping_service.py # Core service
│   ├── api/
│   │   ├── routes.py        # API endpoints
│   │   └── schemas.py       # Pydantic models
│   └── utils/
│       └── logger.py        # Logging
├── data/
│   ├── namaste_codes.json   # AYUSH dataset
│   ├── icd11_codes.json     # ICD-11 dataset
│   └── feedback.json        # Feedback storage
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 🎯 Model Selection

### Why `sentence-transformers/all-MiniLM-L6-v2`?

- **Fast**: ~50ms inference time
- **Lightweight**: 80MB model size
- **Accurate**: Good transfer learning to medical domain
- **Proven**: Widely used in production systems

### Alternative Models

For better medical accuracy (slower):
- `microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext`
- `dmis-lab/biobert-v1.1`

## 📈 Performance

- **Inference Time**: <500ms per request
- **Throughput**: 100+ requests/second
- **Memory**: <2GB RAM
- **Model Load Time**: ~30 seconds

## 🔒 Security

- Input validation using Pydantic
- CORS configuration
- Rate limiting (can be added)
- No sensitive data in logs

## 🚀 Deployment

### Production Checklist

- [ ] Set `ENV=production` in `.env`
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Enable Redis caching for better performance
- [ ] Set up load balancer for scaling
- [ ] Configure health check endpoints
- [ ] Set up backup for feedback data

### Scaling

```bash
# Scale with Docker Compose
docker-compose up -d --scale ai-service=3

# Or use Kubernetes
kubectl scale deployment ai-service --replicas=5
```

## 📝 Feedback Loop

Doctor feedback is stored in `data/feedback.json` and can be used to:

1. **Fine-tune the model** - Retrain with validated mappings
2. **Improve confidence thresholds** - Adjust based on acceptance rates
3. **Expand synonym dictionary** - Add new AYUSH-Allopathy mappings
4. **Create training data** - Build supervised learning dataset

## 🔮 Future Enhancements

- [ ] Active learning from feedback
- [ ] Multi-lingual support (Hindi, regional languages)
- [ ] Batch processing API
- [ ] Explainability features (why this match?)
- [ ] Custom fine-tuned medical model
- [ ] Real-time model updates
- [ ] A/B testing framework

## 📚 API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## 🤝 Contributing

1. Add new AYUSH synonyms to `preprocessing.py`
2. Expand datasets in `data/` directory
3. Improve confidence scoring logic
4. Add unit tests

## 📄 License

Proprietary - NAMOAROGYA Healthcare Platform

## 🆘 Support

For issues or questions:
- Check logs: `docker-compose logs ai-service`
- Health check: `curl http://localhost:8000/api/v1/health`
- API docs: http://localhost:8000/api/v1/docs

---

**Built with ❤️ for better healthcare interoperability**
