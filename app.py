"""
HealthGuard AI — Flask API Server
Serves ML predictions and model comparison data through a REST API.
Also serves the static frontend.
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from ml.models import predict, ALGORITHMS, DISEASES
from ml.data_loader import get_feature_info

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

SAVE_DIR = 'saved_models'


# ─── Static Frontend ──────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    """List available diseases and their feature forms."""
    disease_info = {
        'heart': {
            'name': 'Heart Disease',
            'icon': '❤️',
            'description': 'Predict heart disease risk based on clinical parameters including blood pressure, cholesterol, and ECG results.',
            'features': get_feature_info('heart')
        },
        'diabetes': {
            'name': 'Diabetes',
            'icon': '🩸',
            'description': 'Assess diabetes risk using metabolic indicators like glucose level, BMI, insulin, and family history.',
            'features': get_feature_info('diabetes')
        },
        'cancer': {
            'name': 'Breast Cancer',
            'icon': '🔬',
            'description': 'Classify breast tumors as benign or malignant using cell nucleus measurements from fine needle aspirate.',
            'features': get_feature_info('cancer')
        }
    }
    return jsonify(disease_info)


@app.route('/api/predict/<disease>', methods=['POST'])
def make_prediction(disease):
    """Make a disease prediction."""
    if disease not in DISEASES:
        return jsonify({'error': f'Unknown disease: {disease}. Available: {DISEASES}'}), 400

    if not os.path.exists(os.path.join(SAVE_DIR, 'metrics.json')):
        return jsonify({'error': 'Models not trained yet. Run train_models.py first.'}), 500

    data = request.get_json()
    if not data or 'features' not in data:
        return jsonify({'error': 'Request body must include "features" object.'}), 400

    algorithm = data.get('algorithm', 'best')
    try:
        result = predict(disease, data['features'], algorithm=algorithm, save_dir=SAVE_DIR)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/models', methods=['GET'])
def get_models():
    """Return available algorithms info."""
    return jsonify({
        key: {'name': info['name']}
        for key, info in ALGORITHMS.items()
    })


@app.route('/api/comparison', methods=['GET'])
def get_comparison():
    """Return model comparison metrics for all diseases."""
    metrics_path = os.path.join(SAVE_DIR, 'metrics.json')
    if not os.path.exists(metrics_path):
        return jsonify({'error': 'Metrics not available. Run train_models.py first.'}), 500

    with open(metrics_path, 'r') as f:
        metrics = json.load(f)

    return jsonify(metrics)


@app.route('/api/visualizations/<filename>')
def get_visualization(filename):
    """Serve generated chart images."""
    viz_dir = os.path.join('static', 'visualizations')
    return send_from_directory(viz_dir, filename)


# ─── Run Server ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if not os.path.exists(os.path.join(SAVE_DIR, 'metrics.json')):
        print("\n⚠️  Models not trained yet!")
        print("   Run: python train_models.py\n")

    print("\n🏥 HealthGuard AI Server")
    print("   Open: http://localhost:5000\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
