import os

import numpy as np
import pandas as pd

# --- CONFIGURATION ---
NUM_RECORDS = 100000
OUTPUT_FILE = 'MOCK_DATA_100K_DUAL.csv' # Changed output file name for clarity

# Define realistic optimal ranges for key features
OPTIMAL_N = (70, 120)
OPTIMAL_P = (35, 60)
OPTIMAL_K = (50, 80)
OPTIMAL_PH = (6.0, 7.5)
OPTIMAL_MOIST = (60, 85)

# Define the deficiency/toxicity thresholds
N_LOW = (10, 30)
P_LOW = (10, 25)
K_LOW = (10, 35)
K_HIGH = (150, 250) # High K for Toxicity
PH_STRESS_LOW = (4.0, 5.5) # Acidic pH
PH_STRESS_HIGH = (8.0, 9.5) # Alkaline pH

# Define all target classes
HEALTH_CLASSES = ['Optimal Health', 'Nitrogen Deficiency', 'Phosphorus Deficiency', 
                  'Potassium Deficiency', 'Potassium Toxicity', 'pH Stress']
CROP_CLASSES = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton'] 


def get_disease_label(status):
    """Maps general health status to a specific disease/issue."""
    if status == 'Optimal Health':
        return 'Healthy'
    elif status == 'Nitrogen Deficiency':
        return np.random.choice(['Brown Spot', 'Yellowing', 'Stunted Growth'])
    elif status == 'Phosphorus Deficiency':
        return np.random.choice(['Purple Leaf Syndrome', 'Delayed Maturity'])
    elif status == 'Potassium Deficiency':
        return np.random.choice(['Leaf Margin Scorch', 'Weak Stem'])
    elif status == 'Potassium Toxicity':
        return np.random.choice(['Salt Stress', 'Root Rot'])
    elif status == 'pH Stress':
        return np.random.choice(['Nutrient Lockout', 'Fungal Infection Risk'])
    return 'Unknown Issue'


def generate_correlated_data(n_samples):
    """Generates synthetic data points with engineered correlations and dual labels."""
    
    data = []
    
    # Generate balanced data for each class
    n_per_class = n_samples // len(HEALTH_CLASSES)
    
    # List of pH ranges for easy indexing
    PH_RANGES = [PH_STRESS_LOW, PH_STRESS_HIGH]
    
    for i, status in enumerate(HEALTH_CLASSES):
        for _ in range(n_per_class):
            
            # 1. Start with optimal values
            n_val, p_val, k_val, ph_val, moist_val = \
                np.random.uniform(*OPTIMAL_N), \
                np.random.uniform(*OPTIMAL_P), \
                np.random.uniform(*OPTIMAL_K), \
                np.random.uniform(*OPTIMAL_PH), \
                np.random.uniform(*OPTIMAL_MOIST)
            
            # 2. Introduce the specific problem
            if status == 'Nitrogen Deficiency':
                n_val = np.random.uniform(*N_LOW)
            elif status == 'Phosphorus Deficiency':
                p_val = np.random.uniform(*P_LOW)
            elif status == 'Potassium Deficiency':
                 k_val = np.random.uniform(*K_LOW)
            elif status == 'Potassium Toxicity':
                k_val = np.random.uniform(*K_HIGH) 
            elif status == 'pH Stress':
                # FIX APPLIED: Randomly choose one of the indices (0 or 1) and use the result
                ph_range = PH_RANGES[np.random.randint(0, len(PH_RANGES))]
                ph_val = np.random.uniform(*ph_range)
            
            # 3. Get dual labels
            crop_name = np.random.choice(CROP_CLASSES)
            disease_label = get_disease_label(status)
            
            data.append({
                'crop': crop_name,
                'health_status': status,          # Generic label
                'disease_label': disease_label,   # Specific label
                'n': round(n_val, 2),
                'p': round(p_val, 2),
                'k': round(k_val, 2),
                'ph': round(ph_val, 2),
                'soil_moisture': round(moist_val, 2)
            })
            
    return pd.DataFrame(data)

# --- EXECUTION ---
if __name__ == '__main__':
    print(f"Generating {NUM_RECORDS} synthetic records...")
    df_synthetic = generate_correlated_data(NUM_RECORDS)
    
    # Shuffle the dataset to mix the classes before saving
    df_synthetic = df_synthetic.sample(frac=1).reset_index(drop=True)
    
    df_synthetic.to_csv(OUTPUT_FILE, index=False)
    
    print(f"\n--- SUCCESS ---")
    print(f"Dataset generated and saved to: {OUTPUT_FILE}")
    print(f"Total records: {len(df_synthetic)}")
    print(f"Distribution Check (Health Status):\n{df_synthetic['health_status'].value_counts()}")
    
    # Final step reminder for the user
    print("\nNext steps to use this dual-label data:")
    print("----------------------------------------------------------------------")
    print(f"1. Update DATASET_PATH in train.py to: '{OUTPUT_FILE}'")
    print("2. Choose which column to train on (e.g., set TARGET_COLUMN = 'disease_label').")
    print("3. Run: py train.py")
    print("3. Run: py train.py")
