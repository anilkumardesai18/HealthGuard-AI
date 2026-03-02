"""
HealthGuard AI — ML Models Module
Trains 6 ML algorithms per disease, evaluates them, and provides prediction functions.
"""

import numpy as np
import joblib
import os
import json

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, roc_curve
)

from ml.data_loader import load_dataset


# ─── Algorithm Registry ───────────────────────────────────────────────────────

ALGORITHMS = {
    'random_forest': {
        'name': 'Random Forest',
        'class': RandomForestClassifier,
        'params': {'n_estimators': 100, 'random_state': 42, 'max_depth': 10}
    },
    'svm': {
        'name': 'Support Vector Machine',
        'class': SVC,
        'params': {'kernel': 'rbf', 'probability': True, 'random_state': 42}
    },
    'knn': {
        'name': 'K-Nearest Neighbors',
        'class': KNeighborsClassifier,
        'params': {'n_neighbors': 7}
    },
    'logistic_regression': {
        'name': 'Logistic Regression',
        'class': LogisticRegression,
        'params': {'max_iter': 1000, 'random_state': 42}
    },
    'gradient_boosting': {
        'name': 'Gradient Boosting',
        'class': GradientBoostingClassifier,
        'params': {'n_estimators': 100, 'random_state': 42, 'max_depth': 5}
    },
    'naive_bayes': {
        'name': 'Gaussian Naive Bayes',
        'class': GaussianNB,
        'params': {}
    }
}

DISEASES = ['heart', 'diabetes', 'cancer']


# ─── Training ─────────────────────────────────────────────────────────────────

def train_all_models(save_dir='saved_models'):
    """
    Train all 6 algorithms on all 3 diseases.
    Returns a dict of metrics and saves models + scalers to disk.
    """
    os.makedirs(save_dir, exist_ok=True)
    all_metrics = {}

    for disease in DISEASES:
        print(f"\n{'='*60}")
        print(f"  Training models for: {disease.upper()}")
        print(f"{'='*60}")

        X_train, X_test, y_train, y_test, feature_names, scaler = load_dataset(disease)

        # Save scaler and feature names
        joblib.dump(scaler, os.path.join(save_dir, f'{disease}_scaler.joblib'))
        joblib.dump(feature_names, os.path.join(save_dir, f'{disease}_features.joblib'))

        disease_metrics = {}

        for algo_key, algo_info in ALGORITHMS.items():
            print(f"\n  → Training {algo_info['name']}...", end=' ')

            model = algo_info['class'](**algo_info['params'])
            model.fit(X_train, y_train)

            # Predictions
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else y_pred

            # Metrics
            metrics = {
                'accuracy': round(accuracy_score(y_test, y_pred) * 100, 2),
                'precision': round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
                'recall': round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
                'f1_score': round(f1_score(y_test, y_pred, zero_division=0) * 100, 2),
                'roc_auc': round(roc_auc_score(y_test, y_prob) * 100, 2),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }

            # ROC curve data
            fpr, tpr, _ = roc_curve(y_test, y_prob)
            metrics['roc_curve'] = {
                'fpr': fpr[::max(1, len(fpr)//50)].tolist(),
                'tpr': tpr[::max(1, len(tpr)//50)].tolist()
            }

            disease_metrics[algo_key] = {
                'name': algo_info['name'],
                **metrics
            }

            print(f"Accuracy: {metrics['accuracy']}%  |  F1: {metrics['f1_score']}%  |  AUC: {metrics['roc_auc']}%")

            # Save model
            model_path = os.path.join(save_dir, f'{disease}_{algo_key}.joblib')
            joblib.dump(model, model_path)

        # Determine best model
        best_key = max(disease_metrics, key=lambda k: disease_metrics[k]['accuracy'])
        disease_metrics['best_model'] = best_key
        disease_metrics['feature_names'] = feature_names

        all_metrics[disease] = disease_metrics

    # Save metrics JSON
    metrics_path = os.path.join(save_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(all_metrics, f, indent=2)

    print(f"\n\n{'='*60}")
    print("  All models trained and saved successfully!")
    print(f"{'='*60}")
    print(f"  Models directory: {os.path.abspath(save_dir)}")

    return all_metrics


# ─── Prediction ───────────────────────────────────────────────────────────────

def load_model(disease, algorithm='best', save_dir='saved_models'):
    """Load a trained model from disk."""
    metrics_path = os.path.join(save_dir, 'metrics.json')
    with open(metrics_path, 'r') as f:
        metrics = json.load(f)

    if algorithm == 'best':
        algorithm = metrics[disease]['best_model']

    model = joblib.load(os.path.join(save_dir, f'{disease}_{algorithm}.joblib'))
    scaler = joblib.load(os.path.join(save_dir, f'{disease}_scaler.joblib'))
    feature_names = joblib.load(os.path.join(save_dir, f'{disease}_features.joblib'))

    return model, scaler, feature_names, algorithm


def predict(disease, input_data, algorithm='best', save_dir='saved_models'):
    """
    Make a prediction for a given disease.

    Args:
        disease: 'heart', 'diabetes', or 'cancer'
        input_data: dict of feature_name: value
        algorithm: algorithm key or 'best'
        save_dir: directory with saved models

    Returns:
        dict with prediction, confidence, algorithm used
    """
    model, scaler, feature_names, algo_used = load_model(disease, algorithm, save_dir)

    # Build feature vector in correct order
    if disease == 'cancer':
        # For cancer, user provides 10 features; fill remaining with defaults
        from sklearn.datasets import load_breast_cancer
        default_data = load_breast_cancer()
        defaults = dict(zip(default_data.feature_names, default_data.data.mean(axis=0)))
        feature_vector = []
        for fname in feature_names:
            if fname in input_data:
                feature_vector.append(float(input_data[fname]))
            else:
                feature_vector.append(defaults.get(fname, 0.0))
    else:
        feature_vector = [float(input_data.get(fname, 0)) for fname in feature_names]

    # Scale and predict
    X = np.array(feature_vector).reshape(1, -1)
    X_scaled = scaler.transform(X)

    prediction = int(model.predict(X_scaled)[0])
    probabilities = model.predict_proba(X_scaled)[0] if hasattr(model, 'predict_proba') else [1 - prediction, prediction]

    confidence = round(float(max(probabilities)) * 100, 1)

    disease_labels = {
        'heart': {0: 'No Heart Disease Detected', 1: 'Heart Disease Risk Detected'},
        'diabetes': {0: 'Low Diabetes Risk', 1: 'Diabetes Risk Detected'},
        'cancer': {0: 'Benign (No Cancer)', 1: 'Malignant (Cancer Detected)'}
    }

    return {
        'prediction': prediction,
        'label': disease_labels[disease][prediction],
        'confidence': confidence,
        'algorithm': ALGORITHMS[algo_used]['name'],
        'probabilities': {
            'negative': round(float(probabilities[0]) * 100, 1),
            'positive': round(float(probabilities[1]) * 100, 1)
        }
    }
