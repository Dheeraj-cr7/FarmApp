import json
import os

import joblib
import numpy as np
import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

# --- API CONFIGURATION ---
app = Flask(__name__)
CORS(app) 
PORT = 3000 

# --- MODEL CONFIGURATION (UPDATED) ---
MODEL_DIR = 'models'
LABEL_ENCODER_FILE = 'label_encoder.pkl'
SCALER_FILE = 'scaler.pkl' 
DISEASE_MAP_FILE = 'disease_to_health_map.pkl' # <-- NEW MAPPING FILE PATH
FEATURES = ['N', 'P', 'K', 'pH', 'Soil_Moisture'] 

# --- SUPABASE CONFIGURATION (LOADED FROM ENVIRONMENT VARIABLES) ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_TABLE = "crop_data"

# Global cache for resources
MODELS_CACHE = {}
GLOBAL_LABEL_ENCODER = None
GLOBAL_SCALER = None 
GLOBAL_DISEASE_MAP = None # <-- NEW GLOBAL MAP VARIABLE

def load_resources():
    """Loads all necessary resources into memory once."""
    global GLOBAL_LABEL_ENCODER
    global GLOBAL_SCALER 
    global GLOBAL_DISEASE_MAP # <-- Load the new mapping
    global MODELS_CACHE

    print("Initializing API: Loading models, encoder, scaler, and map...")

    # Load Label Encoder
    try:
        GLOBAL_LABEL_ENCODER = joblib.load(LABEL_ENCODER_FILE)
        print(f"Loaded Label Encoder with classes: {GLOBAL_LABEL_ENCODER.classes_}")
    except FileNotFoundError:
        print(f"CRITICAL ERROR: Label Encoder file '{LABEL_ENCODER_FILE}' not found.")
        return False
    
    # Load Standard Scaler
    try:
        GLOBAL_SCALER = joblib.load(SCALER_FILE)
        print("Loaded Standard Scaler successfully.")
    except FileNotFoundError:
        print(f"CRITICAL ERROR: Scaler file '{SCALER_FILE}' not found. Did you run train.py?")
        return False

    # Load Disease to Health Map (CRITICAL FIX)
    try:
        GLOBAL_DISEASE_MAP = joblib.load(DISEASE_MAP_FILE)
        print("Loaded Disease Mapping successfully.")
    except FileNotFoundError:
        print(f"CRITICAL ERROR: Mapping file '{DISEASE_MAP_FILE}' not found. Run train.py first!")
        return False


    # Load all models found in the models directory
    for filename in os.listdir(MODEL_DIR):
        if filename.endswith(".json"):
            crop_name_key = filename.replace('_disease_model.json', '').replace('_', ' ').title()
            model_path = os.path.join(MODEL_DIR, filename)
            
            model = XGBClassifier()
            try:
                model.load_model(model_path)
                MODELS_CACHE[crop_name_key] = model
                print(f" - Loaded model for: {crop_name_key}")
            except Exception as e:
                print(f" - Error loading {crop_name_key} model from {model_path}: {e}")
                
    if not MODELS_CACHE:
        print("CRITICAL ERROR: No models loaded. Check the 'models' directory.")
        return False

    return True

def save_prediction_to_supabase(data, specific_disease, user_id):
    """Sends the prediction and input data to the Supabase REST API."""
    
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
          print("CRITICAL: Supabase credentials (SUPABASE_URL or SUPABASE_ANON_KEY) not found in environment variables. Skipping save to DB.")
          return False

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # The database column is 'predicted_disease', which now stores the SPECIFIC disease label
    supabase_payload = {
        "user_id": user_id, 
        "crop_name": data.get('crop_name'),
        "nitrogen": data.get('N'),
        "phosphorus": data.get('P'),
        "potassium": data.get('K'),
        "ph": data.get('pH'),
        "soil_moisture": data.get('Soil_Moisture'),
        "predicted_disease": specific_disease # Log the specific disease
    }
    
    supabase_api_endpoint = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"

    try:
        response = requests.post(supabase_api_endpoint, 
                                 headers=headers, 
                                 json=supabase_payload)
        response.raise_for_status() 
        print("Prediction logged to Supabase successfully.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error saving prediction to Supabase: {e}")
        print(f"Supabase Response Text: {response.text if 'response' in locals() else 'No response object.'}")
        return False

@app.route('/predict', methods=['POST'])
def predict():
    """API endpoint to receive data and return both specific disease and generic health status."""
    
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON data received."}), 400

    crop_name = data.get('crop_name')
    user_id = data.get('user_id') 

    if not crop_name or not user_id:
        return jsonify({"error": "Missing 'crop_name' or 'user_id' in request."}), 400
    
    if crop_name not in MODELS_CACHE:
        return jsonify({"error": f"Model for crop '{crop_name}' not found on server. Loaded models: {list(MODELS_CACHE.keys())}"}), 404

    # 3. Prepare features for prediction
    try:
        feature_values = [data[feature] for feature in FEATURES]
        input_array = np.array(feature_values).reshape(1, -1)
    except KeyError as e:
        return jsonify({"error": f"Missing required feature: {e}. Required features are: {FEATURES}"}), 400

    # 4. Run the Prediction
    try:
        # Scale the input data
        scaled_input = GLOBAL_SCALER.transform(input_array)
        
        model = MODELS_CACHE[crop_name]
        encoded_prediction = model.predict(scaled_input)[0] 
        
        # This is the specific disease prediction (e.g., 'Brown Spot')
        predicted_disease = GLOBAL_LABEL_ENCODER.inverse_transform([encoded_prediction])[0]
        
        # FIX: Use the map to get the generic health status (e.g., 'Nitrogen Deficiency')
        generic_status = GLOBAL_DISEASE_MAP.get(predicted_disease, predicted_disease)
        
        # If the map isn't working or the status is 'Healthy', the generic status is the same.
        if generic_status == 'Healthy':
             generic_status = 'Optimal Health'

    except Exception as e:
        print(f"Prediction failed: {e}")
        return jsonify({"error": "Prediction failed due to internal model error."}), 500

    # 5. Log Prediction to Supabase (Asynchronously)
    save_prediction_to_supabase(data, predicted_disease, user_id)
    
    # 6. Return the result to the Expo app with BOTH statuses
    return jsonify({
        "status": "success",
        "crop": crop_name,
        "predicted_disease": str(predicted_disease), # Specific label
        "predicted_health": str(generic_status),     # Generic deficiency/health status
        "user_id": user_id
    }), 200

# --- Start API Server ---
if __name__ == '__main__':
    if load_resources():
        print("\n--- Starting Flask API Server ---")
        print(f"API is running. Access prediction endpoint at http://<Your IP Address>:{PORT}/predict")
        app.run(host='0.0.0.0', port=PORT)