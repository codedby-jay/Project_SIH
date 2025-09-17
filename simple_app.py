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

# AI Farming Assistant Knowledge Base
FARMING_KNOWLEDGE = {
    'crops': {
        'rice': {
            'soil': 'Clay or loamy soil with good water retention',
            'climate': 'Warm, humid climate with temperatures 20-35°C',
            'water': 'Requires flooding or consistent moisture',
            'fertilizer': 'High nitrogen, moderate phosphorus and potassium',
            'season': 'Monsoon season (June-October)',
            'tips': 'Maintain 2-5cm water level, transplant after 25-30 days'
        },
        'wheat': {
            'soil': 'Well-drained loamy soil with pH 6.0-7.5',
            'climate': 'Cool, dry climate with temperatures 15-25°C',
            'water': 'Moderate water requirement, avoid waterlogging',
            'fertilizer': 'Balanced NPK with emphasis on nitrogen',
            'season': 'Winter season (November-April)',
            'tips': 'Sow after monsoon, harvest when grain moisture is 20-25%'
        },
        'maize': {
            'soil': 'Well-drained fertile soil with pH 5.8-8.0',
            'climate': 'Warm climate with temperatures 21-27°C',
            'water': 'Regular watering, especially during tasseling',
            'fertilizer': 'High nitrogen requirement, split application',
            'season': 'Kharif (June-October) and Rabi (November-April)',
            'tips': 'Plant after soil temperature reaches 16°C'
        },
        'cotton': {
            'soil': 'Deep, well-drained black cotton soil',
            'climate': 'Hot climate with temperatures 21-30°C',
            'water': 'Moderate water, avoid excess moisture',
            'fertilizer': 'Balanced NPK with micronutrients',
            'season': 'Kharif season (May-October)',
            'tips': 'Requires 180-200 frost-free days'
        }
    },
    'soil_management': {
        'sandy': {
            'characteristics': 'Good drainage, low water retention, low fertility',
            'improvements': 'Add organic matter, compost, cover crops',
            'suitable_crops': 'Carrots, radish, potatoes, groundnuts',
            'fertilizer': 'Frequent light applications, organic fertilizers'
        },
        'clay': {
            'characteristics': 'Poor drainage, high water retention, high fertility',
            'improvements': 'Add sand, organic matter, improve drainage',
            'suitable_crops': 'Rice, wheat, sugarcane, cotton',
            'fertilizer': 'Less frequent, heavy applications'
        },
        'loamy': {
            'characteristics': 'Ideal soil, good drainage and retention',
            'improvements': 'Maintain organic matter, regular testing',
            'suitable_crops': 'Most crops grow well',
            'fertilizer': 'Balanced application based on crop needs'
        }
    },
    'irrigation': {
        'drip': {
            'description': 'Water delivered directly to plant roots',
            'advantages': 'Water efficient, reduces weeds, precise control',
            'suitable_for': 'Vegetables, fruits, cash crops',
            'cost': 'High initial, low operational'
        },
        'sprinkler': {
            'description': 'Water sprayed over crops like rainfall',
            'advantages': 'Good coverage, suitable for various terrains',
            'suitable_for': 'Field crops, lawns, orchards',
            'cost': 'Moderate initial and operational'
        },
        'flood': {
            'description': 'Field flooded with water',
            'advantages': 'Simple, low cost, suitable for rice',
            'suitable_for': 'Rice, sugarcane',
            'cost': 'Low initial, high water usage'
        }
    },
    'fertilizers': {
        'organic': {
            'types': 'Compost, manure, vermicompost, green manure',
            'benefits': 'Improves soil structure, slow release, eco-friendly',
            'application': 'Apply before planting, mix with soil',
            'crops': 'All crops, especially vegetables and fruits'
        },
        'chemical': {
            'types': 'NPK, urea, DAP, potash',
            'benefits': 'Quick results, precise nutrient control',
            'application': 'Follow soil test recommendations',
            'crops': 'Field crops, high-yield varieties'
        },
        'bio': {
            'types': 'Rhizobium, Azotobacter, PSB, KSB',
            'benefits': 'Enhance nutrient availability, eco-friendly',
            'application': 'Seed treatment or soil application',
            'crops': 'Legumes, cereals, all crops'
        }
    }
}

def get_chatbot_response(message):
    """
    Generate AI-powered farming assistant responses based on user queries
    """
    message_lower = message.lower()
    
    # Crop-specific queries
    if any(crop in message_lower for crop in ['rice', 'wheat', 'maize', 'cotton', 'corn']):
        crop_name = None
        for crop in ['rice', 'wheat', 'maize', 'cotton']:
            if crop in message_lower or (crop == 'maize' and 'corn' in message_lower):
                crop_name = crop
                break
        
        if crop_name and crop_name in FARMING_KNOWLEDGE['crops']:
            crop_info = FARMING_KNOWLEDGE['crops'][crop_name]
            return f"""🌾 **{crop_name.title()} Cultivation Guide:**

**Soil Requirements:** {crop_info['soil']}
**Climate:** {crop_info['climate']}
**Water Needs:** {crop_info['water']}
**Fertilizer:** {crop_info['fertilizer']}
**Growing Season:** {crop_info['season']}

💡 **Pro Tip:** {crop_info['tips']}

Would you like specific advice on any aspect of {crop_name} cultivation?"""
    
    # Soil management queries
    elif any(word in message_lower for word in ['soil', 'sandy', 'clay', 'loamy', 'fertility']):
        if 'sandy' in message_lower:
            soil_type = 'sandy'
        elif 'clay' in message_lower:
            soil_type = 'clay'
        elif 'loamy' in message_lower:
            soil_type = 'loamy'
        else:
            return """🌱 **Soil Management Tips:**

**Know Your Soil Type:**
• Sandy: Good drainage, needs organic matter
• Clay: Rich but heavy, improve drainage
• Loamy: Ideal balance of sand, silt, clay

**General Improvements:**
• Add compost regularly
• Test pH levels (6.0-7.5 ideal for most crops)
• Use cover crops
• Avoid overworking wet soil

Which soil type would you like specific advice for?"""
        
        if soil_type in FARMING_KNOWLEDGE['soil_management']:
            soil_info = FARMING_KNOWLEDGE['soil_management'][soil_type]
            return f"""🌱 **{soil_type.title()} Soil Management:**

**Characteristics:** {soil_info['characteristics']}
**Improvements:** {soil_info['improvements']}
**Suitable Crops:** {soil_info['suitable_crops']}
**Fertilizer Strategy:** {soil_info['fertilizer']}

Need help with specific soil problems?"""
    
    # Irrigation queries
    elif any(word in message_lower for word in ['irrigation', 'watering', 'drip', 'sprinkler', 'water']):
        if 'drip' in message_lower:
            method = 'drip'
        elif 'sprinkler' in message_lower:
            method = 'sprinkler'
        elif 'flood' in message_lower:
            method = 'flood'
        else:
            return """💧 **Irrigation Methods Comparison:**

**Drip Irrigation:** Most efficient, 90-95% efficiency
**Sprinkler:** Good for field crops, 70-80% efficiency  
**Flood/Furrow:** Traditional method, 40-60% efficiency

**Water-Saving Tips:**
• Water early morning or evening
• Mulch around plants
• Check soil moisture before watering
• Use drought-resistant varieties

Which irrigation method interests you most?"""
        
        if method in FARMING_KNOWLEDGE['irrigation']:
            irrigation_info = FARMING_KNOWLEDGE['irrigation'][method]
            return f"""💧 **{method.title()} Irrigation System:**

**How it works:** {irrigation_info['description']}
**Advantages:** {irrigation_info['advantages']}
**Best for:** {irrigation_info['suitable_for']}
**Cost consideration:** {irrigation_info['cost']}

Would you like installation or maintenance tips?"""
    
    # Fertilizer queries
    elif any(word in message_lower for word in ['fertilizer', 'fertiliser', 'nutrient', 'npk', 'organic', 'compost']):
        if 'organic' in message_lower:
            fert_type = 'organic'
        elif 'chemical' in message_lower or 'npk' in message_lower:
            fert_type = 'chemical'
        elif 'bio' in message_lower:
            fert_type = 'bio'
        else:
            return """🌿 **Fertilizer Guide:**

**Organic Fertilizers:** Slow release, improve soil health
**Chemical Fertilizers:** Quick results, precise control
**Bio-fertilizers:** Enhance nutrient availability naturally

**NPK Basics:**
• N (Nitrogen): Leaf growth, green color
• P (Phosphorus): Root development, flowering
• K (Potassium): Disease resistance, fruit quality

**Application Tips:**
• Test soil before applying
• Follow recommended doses
• Apply at right growth stages

Which type of fertilizer would you like to know more about?"""
        
        if fert_type in FARMING_KNOWLEDGE['fertilizers']:
            fert_info = FARMING_KNOWLEDGE['fertilizers'][fert_type]
            return f"""🌿 **{fert_type.title()} Fertilizers:**

**Types:** {fert_info['types']}
**Benefits:** {fert_info['benefits']}
**Application:** {fert_info['application']}
**Best for:** {fert_info['crops']}

Need specific application rates or timing advice?"""
    
    # Pest and disease queries
    elif any(word in message_lower for word in ['pest', 'disease', 'insect', 'fungus', 'bug']):
        return """🐛 **Integrated Pest Management (IPM):**

**Prevention First:**
• Crop rotation
• Resistant varieties
• Proper spacing
• Clean cultivation

**Natural Control:**
• Beneficial insects (ladybugs, spiders)
• Neem oil spray
• Companion planting
• Pheromone traps

**Chemical Control (Last Resort):**
• Use only when necessary
• Follow label instructions
• Rotate different chemicals
• Protect beneficial insects

**Common Issues:**
• Aphids: Use neem oil or ladybugs
• Fungal diseases: Improve air circulation
• Caterpillars: Bt spray or hand picking

What specific pest problem are you facing?"""
    
    # Weather and climate queries
    elif any(word in message_lower for word in ['weather', 'climate', 'rain', 'drought', 'temperature']):
        return """🌤️ **Weather & Climate Management:**

**Monsoon Preparation:**
• Ensure proper drainage
• Choose flood-resistant varieties
• Store seeds and fertilizers safely

**Drought Management:**
• Mulching to retain moisture
• Drought-tolerant crops
• Efficient irrigation systems
• Rainwater harvesting

**Temperature Stress:**
• Shade nets for extreme heat
• Windbreaks for cold protection
• Proper planting timing

**Weather Monitoring:**
• Use weather apps/forecasts
• Plan operations accordingly
• Have contingency plans

Are you dealing with any specific weather challenges?"""
    
    # General farming advice
    elif any(word in message_lower for word in ['farming', 'agriculture', 'cultivation', 'growing']):
        return """🚜 **Smart Farming Practices:**

**Planning Phase:**
• Soil testing
• Crop selection based on climate
• Market research
• Resource planning

**Execution:**
• Quality seeds/seedlings
• Proper spacing
• Timely operations
• Record keeping

**Technology Integration:**
• Weather monitoring
• Soil sensors
• Precision agriculture
• Mobile apps for guidance

**Sustainability:**
• Crop rotation
• Organic practices
• Water conservation
• Biodiversity preservation

**Success Factors:**
• Continuous learning
• Networking with other farmers
• Government scheme utilization
• Market linkages

What specific aspect of farming would you like to explore?"""
    
    # Crop recommendation integration
    elif any(word in message_lower for word in ['recommend', 'suggestion', 'best crop', 'which crop']):
        return """🎯 **Crop Recommendation Service:**

I can help you choose the best crop based on your conditions! 

**For personalized recommendations, please use the main form above with:**
• Soil nutrients (N, P, K levels)
• Temperature and humidity
• pH level
• Expected rainfall

**Quick Guidelines:**
• **High temperature + humidity:** Rice, sugarcane
• **Moderate temperature:** Wheat, maize
• **Low rainfall:** Cotton, millet
• **High rainfall:** Rice, jute

**Factors to Consider:**
• Local market demand
• Your experience level
• Available resources
• Government support schemes

Would you like to fill the recommendation form above, or do you have specific conditions to discuss?"""
    
    # Default response for unrecognized queries
    else:
        return """🌱 **I'm here to help with your farming questions!**

I can assist you with:
• 🌾 **Crop cultivation** (rice, wheat, maize, cotton, etc.)
• 🌱 **Soil management** (sandy, clay, loamy soils)
• 💧 **Irrigation systems** (drip, sprinkler, flood)
• 🌿 **Fertilizers** (organic, chemical, bio-fertilizers)
• 🐛 **Pest & disease management**
• 🌤️ **Weather & climate adaptation**
• 🎯 **Crop recommendations** (use the form above)

**Example questions you can ask:**
• "How to grow rice in clay soil?"
• "Best irrigation for vegetables?"
• "Organic fertilizers for tomatoes?"
• "How to manage aphids naturally?"

What would you like to know about farming?"""

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

@app.route('/chatbot', methods=['POST'])
def chatbot():
    """AI Farming Assistant Chatbot endpoint"""
    try:
        # Log the incoming request
        logger.info(f"Chatbot request received at {datetime.now()}")
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'message' not in data:
            logger.warning("No message provided in chatbot request")
            return jsonify({
                'error': 'No message provided',
                'response': 'Please provide a message to get farming assistance.'
            }), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({
                'error': 'Empty message',
                'response': 'Please ask me something about farming, crops, or agriculture!'
            }), 400
        
        # Generate AI response
        bot_response = get_chatbot_response(user_message)
        
        # Log the interaction
        logger.info(f"Chatbot - User: {user_message[:50]}... | Bot: {bot_response[:50]}...")
        
        # Return successful response
        return jsonify({
            'response': bot_response,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in chatbot: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'response': 'Sorry, I encountered an error. Please try again or contact support.'
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
            'GET /': 'API information',
            'POST /chatbot': 'AI Farming Assistant Chatbot'
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
