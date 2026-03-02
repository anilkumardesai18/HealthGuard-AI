"""
HealthGuard AI — Data Loader Module
Loads and preprocesses Heart Disease, Diabetes, and Breast Cancer datasets.
"""

import pandas as pd
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import os


def _get_heart_disease_data():
    """
    Generate a realistic Heart Disease dataset based on the UCI Cleveland dataset schema.
    Features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    """
    np.random.seed(42)
    n = 920

    age = np.random.randint(29, 78, n)
    sex = np.random.choice([0, 1], n, p=[0.32, 0.68])
    cp = np.random.choice([0, 1, 2, 3], n, p=[0.47, 0.17, 0.28, 0.08])
    trestbps = np.random.normal(131, 17, n).astype(int)
    chol = np.random.normal(246, 52, n).astype(int)
    fbs = np.random.choice([0, 1], n, p=[0.85, 0.15])
    restecg = np.random.choice([0, 1, 2], n, p=[0.49, 0.49, 0.02])
    thalach = np.random.normal(149, 23, n).astype(int)
    exang = np.random.choice([0, 1], n, p=[0.67, 0.33])
    oldpeak = np.abs(np.random.normal(1.04, 1.16, n)).round(1)
    slope = np.random.choice([0, 1, 2], n, p=[0.07, 0.46, 0.47])
    ca = np.random.choice([0, 1, 2, 3], n, p=[0.58, 0.22, 0.13, 0.07])
    thal = np.random.choice([0, 1, 2, 3], n, p=[0.02, 0.05, 0.53, 0.40])

    # Target: correlated with features for realistic model performance
    risk_score = (
        0.03 * age +
        0.5 * sex +
        -0.3 * (cp == 0).astype(int) +
        0.01 * trestbps +
        0.002 * chol +
        0.3 * fbs +
        -0.01 * thalach +
        0.8 * exang +
        0.4 * oldpeak +
        0.5 * ca +
        0.4 * (thal == 3).astype(int) +
        np.random.normal(0, 0.5, n)
    )
    target = (risk_score > np.median(risk_score)).astype(int)

    df = pd.DataFrame({
        'age': age, 'sex': sex, 'cp': cp, 'trestbps': trestbps,
        'chol': chol, 'fbs': fbs, 'restecg': restecg, 'thalach': thalach,
        'exang': exang, 'oldpeak': oldpeak, 'slope': slope, 'ca': ca,
        'thal': thal, 'target': target
    })
    return df


def _get_diabetes_data():
    """
    Generate a realistic Pima Indians Diabetes dataset.
    Features: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI,
              DiabetesPedigreeFunction, Age
    """
    np.random.seed(42)
    n = 768

    pregnancies = np.random.poisson(3.8, n)
    glucose = np.random.normal(121, 32, n).astype(int)
    blood_pressure = np.random.normal(69, 19, n).astype(int)
    skin_thickness = np.random.normal(20, 16, n).astype(int)
    insulin = np.random.normal(80, 115, n).astype(int)
    bmi = np.random.normal(32, 8, n).round(1)
    dpf = np.abs(np.random.exponential(0.47, n)).round(3)
    age = np.random.randint(21, 81, n)

    # Ensure realistic ranges
    glucose = np.clip(glucose, 44, 199)
    blood_pressure = np.clip(blood_pressure, 24, 122)
    skin_thickness = np.clip(skin_thickness, 7, 99)
    insulin = np.clip(insulin, 14, 846)
    bmi = np.clip(bmi, 18.2, 67.1)
    dpf = np.clip(dpf, 0.078, 2.42)

    risk_score = (
        0.02 * pregnancies +
        0.03 * glucose +
        0.005 * blood_pressure +
        0.01 * bmi +
        0.5 * dpf +
        0.02 * age +
        np.random.normal(0, 0.8, n)
    )
    target = (risk_score > np.median(risk_score)).astype(int)

    df = pd.DataFrame({
        'Pregnancies': pregnancies, 'Glucose': glucose,
        'BloodPressure': blood_pressure, 'SkinThickness': skin_thickness,
        'Insulin': insulin, 'BMI': bmi,
        'DiabetesPedigreeFunction': dpf, 'Age': age,
        'Outcome': target
    })
    return df


def load_dataset(disease_name):
    """
    Load and preprocess a dataset for the given disease.

    Args:
        disease_name: One of 'heart', 'diabetes', 'cancer'

    Returns:
        X_train, X_test, y_train, y_test, feature_names, scaler
    """
    if disease_name == 'heart':
        df = _get_heart_disease_data()
        feature_names = [c for c in df.columns if c != 'target']
        X = df[feature_names].values
        y = df['target'].values

    elif disease_name == 'diabetes':
        df = _get_diabetes_data()
        feature_names = [c for c in df.columns if c != 'Outcome']
        X = df[feature_names].values
        y = df['Outcome'].values

    elif disease_name == 'cancer':
        data = load_breast_cancer()
        X = data.data
        y = data.target
        # In sklearn, 1 = benign, 0 = malignant. Flip so 1 = malignant (disease present)
        y = 1 - y
        feature_names = list(data.feature_names)

    else:
        raise ValueError(f"Unknown disease: {disease_name}. Use 'heart', 'diabetes', or 'cancer'.")

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    return X_train, X_test, y_train, y_test, feature_names, scaler


def get_feature_info(disease_name):
    """
    Return human-readable feature metadata for the prediction form.
    Each entry: { name, label, type, min, max, step, default, description }
    """
    if disease_name == 'heart':
        return [
            {"name": "age", "label": "Age", "type": "number", "min": 20, "max": 100, "step": 1, "default": 50, "description": "Patient age in years"},
            {"name": "sex", "label": "Sex", "type": "select", "options": [{"value": 0, "label": "Female"}, {"value": 1, "label": "Male"}], "default": 1, "description": "Biological sex"},
            {"name": "cp", "label": "Chest Pain Type", "type": "select", "options": [{"value": 0, "label": "Typical Angina"}, {"value": 1, "label": "Atypical Angina"}, {"value": 2, "label": "Non-anginal Pain"}, {"value": 3, "label": "Asymptomatic"}], "default": 0, "description": "Type of chest pain experienced"},
            {"name": "trestbps", "label": "Resting Blood Pressure", "type": "number", "min": 80, "max": 220, "step": 1, "default": 120, "description": "Resting blood pressure (mm Hg)"},
            {"name": "chol", "label": "Cholesterol", "type": "number", "min": 100, "max": 600, "step": 1, "default": 200, "description": "Serum cholesterol (mg/dl)"},
            {"name": "fbs", "label": "Fasting Blood Sugar > 120", "type": "select", "options": [{"value": 0, "label": "No"}, {"value": 1, "label": "Yes"}], "default": 0, "description": "Fasting blood sugar > 120 mg/dl"},
            {"name": "restecg", "label": "Resting ECG", "type": "select", "options": [{"value": 0, "label": "Normal"}, {"value": 1, "label": "ST-T Abnormality"}, {"value": 2, "label": "LV Hypertrophy"}], "default": 0, "description": "Resting electrocardiographic results"},
            {"name": "thalach", "label": "Max Heart Rate", "type": "number", "min": 60, "max": 220, "step": 1, "default": 150, "description": "Maximum heart rate achieved"},
            {"name": "exang", "label": "Exercise Induced Angina", "type": "select", "options": [{"value": 0, "label": "No"}, {"value": 1, "label": "Yes"}], "default": 0, "description": "Exercise induced angina"},
            {"name": "oldpeak", "label": "ST Depression", "type": "number", "min": 0, "max": 7, "step": 0.1, "default": 1.0, "description": "ST depression induced by exercise"},
            {"name": "slope", "label": "ST Slope", "type": "select", "options": [{"value": 0, "label": "Upsloping"}, {"value": 1, "label": "Flat"}, {"value": 2, "label": "Downsloping"}], "default": 1, "description": "Slope of the peak exercise ST segment"},
            {"name": "ca", "label": "Major Vessels (0-3)", "type": "number", "min": 0, "max": 3, "step": 1, "default": 0, "description": "Number of major vessels colored by fluoroscopy"},
            {"name": "thal", "label": "Thalassemia", "type": "select", "options": [{"value": 0, "label": "Normal"}, {"value": 1, "label": "Fixed Defect"}, {"value": 2, "label": "Reversible Defect"}, {"value": 3, "label": "Thalassemia"}], "default": 2, "description": "Thalassemia type"}
        ]

    elif disease_name == 'diabetes':
        return [
            {"name": "Pregnancies", "label": "Pregnancies", "type": "number", "min": 0, "max": 20, "step": 1, "default": 1, "description": "Number of pregnancies"},
            {"name": "Glucose", "label": "Glucose Level", "type": "number", "min": 40, "max": 200, "step": 1, "default": 120, "description": "Plasma glucose concentration (mg/dl)"},
            {"name": "BloodPressure", "label": "Blood Pressure", "type": "number", "min": 20, "max": 130, "step": 1, "default": 70, "description": "Diastolic blood pressure (mm Hg)"},
            {"name": "SkinThickness", "label": "Skin Thickness", "type": "number", "min": 5, "max": 100, "step": 1, "default": 20, "description": "Triceps skin fold thickness (mm)"},
            {"name": "Insulin", "label": "Insulin", "type": "number", "min": 10, "max": 850, "step": 1, "default": 80, "description": "2-Hour serum insulin (mu U/ml)"},
            {"name": "BMI", "label": "BMI", "type": "number", "min": 15, "max": 70, "step": 0.1, "default": 32.0, "description": "Body mass index (kg/m²)"},
            {"name": "DiabetesPedigreeFunction", "label": "Diabetes Pedigree", "type": "number", "min": 0.05, "max": 2.5, "step": 0.01, "default": 0.47, "description": "Diabetes pedigree function (genetic influence)"},
            {"name": "Age", "label": "Age", "type": "number", "min": 18, "max": 100, "step": 1, "default": 30, "description": "Patient age in years"}
        ]

    elif disease_name == 'cancer':
        # Use top 10 most important features for user input, rest use means
        return [
            {"name": "mean radius", "label": "Mean Radius", "type": "number", "min": 5, "max": 30, "step": 0.1, "default": 14.1, "description": "Mean of distances from center to points on the perimeter"},
            {"name": "mean texture", "label": "Mean Texture", "type": "number", "min": 9, "max": 40, "step": 0.1, "default": 19.3, "description": "Standard deviation of gray-scale values"},
            {"name": "mean perimeter", "label": "Mean Perimeter", "type": "number", "min": 40, "max": 200, "step": 0.1, "default": 92.0, "description": "Mean perimeter of the cell nucleus"},
            {"name": "mean area", "label": "Mean Area", "type": "number", "min": 140, "max": 2600, "step": 1, "default": 655, "description": "Mean area of the cell nucleus"},
            {"name": "mean smoothness", "label": "Mean Smoothness", "type": "number", "min": 0.05, "max": 0.17, "step": 0.001, "default": 0.096, "description": "Local variation in radius lengths"},
            {"name": "mean compactness", "label": "Mean Compactness", "type": "number", "min": 0.01, "max": 0.35, "step": 0.001, "default": 0.104, "description": "Perimeter² / area - 1.0"},
            {"name": "mean concavity", "label": "Mean Concavity", "type": "number", "min": 0, "max": 0.45, "step": 0.001, "default": 0.089, "description": "Severity of concave portions of the contour"},
            {"name": "mean concave points", "label": "Mean Concave Points", "type": "number", "min": 0, "max": 0.21, "step": 0.001, "default": 0.049, "description": "Number of concave portions of the contour"},
            {"name": "mean symmetry", "label": "Mean Symmetry", "type": "number", "min": 0.1, "max": 0.31, "step": 0.001, "default": 0.181, "description": "Symmetry of the cell nucleus"},
            {"name": "mean fractal dimension", "label": "Mean Fractal Dimension", "type": "number", "min": 0.04, "max": 0.1, "step": 0.001, "default": 0.063, "description": "Coastline approximation - 1"}
        ]

    return []
