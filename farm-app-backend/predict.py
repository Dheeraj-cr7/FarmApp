import os

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import \
    StandardScaler  # Added for clarity, though not strictly needed here
from xgboost import XGBClassifier

# --- CONFIGURATION (CRITICAL) ---
MODEL_DIR = 'models'
LABEL_ENCODER_FILE = 'label_encoder.pkl'
SCALER_FILE = 'scaler.pkl' # <-- NEW: Path to the Standard Scaler

# The feature columns must match the order and names used in training
FEATURES = ['n', 'p', 'k', 'ph', 'soil_moisture'] 


# --- 1. Define Test Input (UPDATED for Potassium Toxicity Test) ---
TEST_INPUT = {
    'crop_name': 'Rice',
    'n': 90.0, # Optimal N
    'p': 42.0,           # Optimal P
    'k': 220.0,          # HIGH Potassium (matches threshold in data generator)
    'ph': 6.8,           # Optimal pH
    'soil_moisture': 70.0 # Optimal Moisture
}

# --- 2. Load Resources ---
def load_resources(crop_name):
    """Loads the model, LabelEncoder, and StandardScaler."""
    
    # 2a. Load Label Encoder (to decode the predicted number back to text)
    try:
        le = joblib.load(LABEL_ENCODER_FILE)
    except FileNotFoundError:
        print(f"Error: Label Encoder file '{LABEL_ENCODER_FILE}' not found. Did you run the training script?")
        return None, None, None

    # 2b. Load Standard Scaler (CRITICAL STEP)
    try:
        scaler = joblib.load(SCALER_FILE)
    except FileNotFoundError:
        print(f"Error: Scaler file '{SCALER_FILE}' not found. Did you run the training script?")
        return None, None, None
    
    # 2c. Load Crop-Specific Model
    model_filename = f'{crop_name.lower().replace(" ", "_")}_disease_model.json'
    model_path = os.path.join(MODEL_DIR, model_filename)

    model = XGBClassifier()
    try:
        model.load_model(model_path)
    except Exception as e:
        print(f"Error loading model for {crop_name}: {e}")
        print(f"Expected model file path: {model_path}")
        return None, None, None
        
    print(f"Successfully loaded model for {crop_name}.")
    return model, le, scaler

# --- 3. Run Prediction ---
def predict_health(input_data, model, encoder, scaler):
    """Formats, SCALES the input data, and runs the prediction."""
    
    # 3a. Extract only the feature values and convert to a numpy array
    feature_values = [input_data[feature] for feature in FEATURES]
    
    # Convert to a NumPy array and reshape for single sample (1 row, 5 columns)
    input_array = np.array(feature_values).reshape(1, -1)
    
    # --- CRITICAL STEP: Scale the input data ---
    # The model expects input data to be standardized (mean=0, std=1)
    scaled_input = scaler.transform(input_array)
    
    # 3b. Make the prediction (returns the encoded number)
    encoded_prediction = model.predict(scaled_input)[0]
    
    # 3c. Decode the prediction (convert number back to Health Status string)
    predicted_status = encoder.inverse_transform([encoded_prediction])[0]
    
    return predicted_status

# --- 4. Main Execution ---
if __name__ == '__main__':
    crop = TEST_INPUT['crop_name']
    
    # Load the model, encoder, and scaler
    trained_model, label_encoder, data_scaler = load_resources(crop)
    
    if trained_model and label_encoder and data_scaler:
        # Run the prediction
        result = predict_health(TEST_INPUT, trained_model, label_encoder, data_scaler)
        
        print("\n--- TEST INPUT ---")
        print(f"Crop: {crop}")
        print(f"Inputs: N={TEST_INPUT['n']:.1f}, P={TEST_INPUT['p']:.1f}, K={TEST_INPUT['k']:.1f}, pH={TEST_INPUT['ph']:.1f}, Soil Moisture={TEST_INPUT['soil_moisture']:.1f}")
        
        print("\n--- PREDICTION RESULT ---")
        print(f"Predicted Health Status: {result}")
        
        # Check if the high K input resulted in the expected prediction
        if result == 'Potassium Toxicity':
            print("\nTest passed: The model correctly identified high Potassium as Potassium Toxicity (based on the input).")
        else:
             print(f"\nTest failed: Expected 'Potassium Toxicity' but got '{result}'.")
            
