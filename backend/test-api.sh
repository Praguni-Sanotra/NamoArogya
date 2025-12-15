#!/bin/bash

echo "=== Testing Admin Login ==="
echo ""

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@namoarogya.com",
    "password": "admin123",
    "role": "admin"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "=== Testing Doctor Login ==="
echo ""

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@namoarogya.com",
    "password": "doctor123",
    "role": "doctor"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
