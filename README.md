# 🛡️ HealthGuard AI — Multi-Disease Prediction System

> **AICTE Capstone Project** — An AI/ML system that predicts Heart Disease, Diabetes, and Breast Cancer using 6 machine learning algorithms.

![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=flat-square&logo=flask)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-orange?style=flat-square&logo=scikit-learn)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [ML Algorithms](#-ml-algorithms)
- [Datasets](#-datasets)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Disclaimer](#-disclaimer)

---

## 🔍 Overview

HealthGuard AI is a full-stack machine learning web application that:

1. **Trains 6 ML algorithms** on 3 different medical datasets
2. **Compares their performance** using accuracy, precision, recall, F1-score, and ROC-AUC
3. **Serves predictions** through an interactive, premium-designed web interface
4. **Visualizes results** with dynamic charts, confidence gauges, and comparison dashboards

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔬 **Multi-Disease Prediction** | Predict Heart Disease, Diabetes, and Breast Cancer |
| 🤖 **6 ML Algorithms** | Random Forest, SVM, KNN, Logistic Regression, Gradient Boosting, Naive Bayes |
| 📊 **Model Comparison** | Interactive dashboard comparing all algorithms across 5 metrics |
| 🎯 **Confidence Scores** | Each prediction comes with a probability-based confidence percentage |
| 📈 **Visualizations** | ROC curves, confusion matrices, and bar charts (Matplotlib + Chart.js) |
| 🌙 **Premium Dark UI** | Glassmorphism design with smooth animations and responsive layout |
| 🔌 **REST API** | Clean Flask API — extensible for mobile apps or other frontends |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **ML / Data Science** | Python, scikit-learn, pandas, NumPy, Matplotlib, Seaborn |
| **Backend** | Flask, Flask-CORS |
| **Frontend** | HTML5, CSS3 (custom dark theme), Vanilla JavaScript |
| **Charts** | Chart.js (frontend), Matplotlib/Seaborn (backend) |

---

## 🤖 ML Algorithms

| # | Algorithm | Type | Strengths |
|---|-----------|------|-----------|
| 1 | **Random Forest** | Ensemble (Bagging) | Handles non-linear data, reduces overfitting |
| 2 | **Support Vector Machine** | Kernel-based | Effective in high-dimensional spaces |
| 3 | **K-Nearest Neighbors** | Instance-based | Simple, no training phase |
| 4 | **Logistic Regression** | Linear | Interpretable, fast, great baseline |
| 5 | **Gradient Boosting** | Ensemble (Boosting) | Best accuracy on tabular data |
| 6 | **Gaussian Naive Bayes** | Probabilistic | Fast, works with small datasets |

---

## 📊 Datasets

| Disease | Dataset | Records | Features |
|---------|---------|---------|----------|
| ❤️ Heart Disease | UCI Cleveland (schema) | 920 | 13 |
| 🩸 Diabetes | Pima Indians (schema) | 768 | 8 |
| 🔬 Breast Cancer | Wisconsin (scikit-learn) | 569 | 30 |

---

## 📁 Project Structure

```
HealthGuard-AI/
├── app.py                  # Flask API server
├── train_models.py         # Model training pipeline
├── requirements.txt        # Python dependencies
├── .gitignore              # Git ignore rules
├── README.md               # This file
│
├── ml/                     # ML core module
│   ├── __init__.py
│   ├── data_loader.py      # Dataset loading & preprocessing
│   ├── models.py           # 6 ML algorithms — train & predict
│   └── visualizations.py   # Chart generation (Matplotlib)
│
├── saved_models/           # Trained models (auto-generated)
│   ├── *.joblib            # Serialized model files
│   └── metrics.json        # Performance metrics
│
└── static/                 # Web frontend
    ├── index.html           # Main SPA page
    ├── css/style.css        # Premium dark theme
    ├── js/app.js            # Frontend logic
    └── visualizations/      # Generated chart images
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/HealthGuard-AI.git
cd HealthGuard-AI

# 2. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Train all models (one-time setup)
python train_models.py

# 5. Start the web server
python app.py
```

Open your browser and visit: **http://localhost:5000**

---

## 💡 Usage

1. **Select a disease** — Click on Heart Disease, Diabetes, or Breast Cancer
2. **Enter patient data** — Fill in the clinical parameters
3. **Choose an algorithm** — Select a specific ML algorithm or use "Best (Auto)"
4. **Get prediction** — Click "Predict Now" to see the result with confidence score
5. **Compare models** — Scroll to the comparison dashboard to see performance metrics

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diseases` | List available diseases and feature metadata |
| POST | `/api/predict/<disease>` | Make a prediction (body: `{features, algorithm}`) |
| GET | `/api/models` | List available ML algorithms |
| GET | `/api/comparison` | Get all model metrics |
| GET | `/api/visualizations/<filename>` | Serve chart images |

### Example Prediction Request

```bash
curl -X POST http://localhost:5000/api/predict/heart \
  -H "Content-Type: application/json" \
  -d '{"features": {"age": 55, "sex": 1, "cp": 2, "trestbps": 140, "chol": 250, "fbs": 0, "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 1.5, "slope": 1, "ca": 0, "thal": 2}, "algorithm": "best"}'
```

---

## ⚠️ Disclaimer

> This system is designed for **educational and research purposes only**. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <b>Built with ❤️ for AICTE Capstone Project 2026</b>
</div>
