"""
Simplified Flask Backend for Crop Recommendation System
This version works without requiring model training
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import numpy as np
from datetime import datetime
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crop_recommendation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Simple rule-based crop recommendation system
def simple_crop_recommendation(N, P, K, temperature, humidity, ph, rainfall):
    """
    Simple rule-based crop recommendation system
    This is a fallback when the ML model is not available
    """
    # Simple rules based on typical crop requirements
    if temperature < 15:
        if humidity > 80:
            return "rice", 0.85
        else:
            return "wheat", 0.80
    elif temperature < 25:
        if ph > 7:
            return "maize", 0.82
        elif rainfall > 200:
            return "rice", 0.88
        else:
            return "chickpea", 0.75
    elif temperature < 35:
        if humidity > 70:
            return "banana", 0.90
        elif ph > 6.5:
            return "mango", 0.85
        else:
            return "cotton", 0.78
    else:
        if rainfall > 150:
            return "sugarcane", 0.80
        else:
            return "cotton", 0.75

def validate_input_data(data):
    """Validate the input data for prediction"""
    required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    
    # Check if all required fields are present
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    # Check if all values are numeric
    for field in required_fields:
        try:
            float(data[field])
        except (ValueError, TypeError):
            return False, f"Invalid value for {field}: must be a number"
    
    # Validate pH range (0-14)
    ph_value = float(data['ph'])
    if ph_value < 0 or ph_value > 14:
        return False, "pH value must be between 0 and 14"
    
    # Validate humidity range (0-100)
    humidity_value = float(data['humidity'])
    if humidity_value < 0 or humidity_value > 100:
        return False, "Humidity value must be between 0 and 100"
    
    # Validate temperature range (reasonable agricultural range)
    temp_value = float(data['temperature'])
    if temp_value < -50 or temp_value > 60:
        return False, "Temperature value must be between -50 and 60 degrees Celsius"
    
    # Validate rainfall (non-negative)
    rainfall_value = float(data['rainfall'])
    if rainfall_value < 0:
        return False, "Rainfall value must be non-negative"
    
    return True, "Valid input data"

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Log the incoming request
        logger.info(f"Prediction request received at {datetime.now()}")
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            logger.warning("No JSON data received")
            return jsonify({
                'error': 'No JSON data provided',
                'message': 'Please send valid JSON data with required fields'
            }), 400
        
        # Validate input data
        is_valid, message = validate_input_data(data)
        if not is_valid:
            logger.warning(f"Invalid input data: {message}")
            return jsonify({
                'error': 'Invalid input data',
                'message': message
            }), 400
        
        # Make prediction using simple rule-based system
        prediction, confidence = simple_crop_recommendation(
            float(data['N']),
            float(data['P']),
            float(data['K']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        )
        
        # Log the prediction result
        logger.info(f"Prediction: {prediction}, Confidence: {confidence:.3f}")
        
        # Return successful response
        response = {
            'recommended_crop': prediction,
            'confidence': confidence
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing your request'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_type': 'rule-based',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API information"""
    return jsonify({
        'message': 'Crop Recommendation API (Simple Version)',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': 'Get crop recommendation',
            'GET /health': 'Health check',
            'GET /': 'API information'
        },
        'required_fields': ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    }), 200

if __name__ == '__main__':
    try:
        logger.info("Starting Simple Crop Recommendation API server...")
        
        # Run the Flask app
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True,
            threaded=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        exit(1)

