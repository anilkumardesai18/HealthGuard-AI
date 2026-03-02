# HealthGuard AI — Multi-Disease Prediction System
### AICTE Capstone Project Presentation

---

<!-- ═══════════════════════════════════════ -->
## Slide 1 — Title Slide
<!-- ═══════════════════════════════════════ -->

# 🛡️ HealthGuard AI
### Multi-Disease Prediction System Using Machine Learning

**Capstone Project — AICTE 2026**

| | |
|---|---|
| **Project Title** | HealthGuard AI — Multi-Disease Prediction System |
| **Domain** | Artificial Intelligence & Machine Learning |
| **Tech Stack** | Python, scikit-learn, Flask, HTML/CSS/JS, Chart.js, Three.js |

---

<!-- ═══════════════════════════════════════ -->
## Slide 2 — Problem Statement
<!-- ═══════════════════════════════════════ -->

# Problem Statement

### The Challenge

- **Cardiovascular diseases**, **diabetes**, and **cancer** are among the **leading causes of death** worldwide, collectively responsible for over **60% of global mortality** (WHO, 2024).
- **Early detection** can **reduce mortality by 30–50%**, yet many cases go undiagnosed due to limited access to timely screening and specialist consultation.
- **Traditional diagnostic methods** are:
  - Time-consuming and require specialist expertise
  - Expensive and not accessible in rural or underserved areas
  - Prone to **human error and subjectivity** in interpretation

### The Gap

- There is a **lack of accessible, intelligent tools** that can provide **preliminary risk assessments** using standard clinical parameters — enabling early warning before expensive diagnostic procedures.
- Existing ML-based health tools often use **only a single algorithm**, making it impossible to evaluate model reliability or compare prediction confidence.

---

<!-- ═══════════════════════════════════════ -->
## Slide 3 — Proposed Solution
<!-- ═══════════════════════════════════════ -->

# Proposed Solution

### HealthGuard AI — An Intelligent Multi-Disease Prediction System

A **full-stack web application** that uses **6 machine learning algorithms** to predict **3 life-threatening diseases** and provides:

| Feature | Description |
|---------|-------------|
| 🔬 **Multi-Disease Prediction** | Heart Disease, Diabetes, and Breast Cancer — from a single platform |
| 🤖 **6 ML Algorithms** | Random Forest, SVM, KNN, Logistic Regression, Gradient Boosting, Naive Bayes |
| 📊 **Model Comparison** | Side-by-side algorithm performance using 5 evaluation metrics |
| 🎯 **Confidence Scoring** | Each prediction includes a probability-based confidence percentage |
| 📈 **Visual Analytics** | Interactive charts, ROC curves, confusion matrices, and comparison dashboards |
| 🌐 **Web Interface** | Premium, responsive UI with 3D animations — accessible from any browser |
| 🔌 **REST API** | Extensible backend that can integrate with mobile apps or hospital systems |

### Key Differentiator
Unlike single-algorithm tools, HealthGuard AI **trains, evaluates, and compares 6 algorithms simultaneously**, allowing users and practitioners to understand **which model is most reliable** for each disease.

---

<!-- ═══════════════════════════════════════ -->
## Slide 4 — System Approach
<!-- ═══════════════════════════════════════ -->

# System Approach

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    USER (Web Browser)                     │
│   Disease Selection → Input Parameters → Get Prediction  │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP Request
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  FLASK REST API (Backend)                 │
│   /api/diseases  │  /api/predict  │  /api/comparison     │
└──────────────────────┬───────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  Heart   │ │ Diabetes │ │  Cancer  │
    │  Models  │ │  Models  │ │  Models  │
    │ (6 algos)│ │ (6 algos)│ │ (6 algos)│
    └──────────┘ └──────────┘ └──────────┘
          │            │            │
          └────────────┼────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│              DATA LAYER (Preprocessing)                   │
│   Loading → Cleaning → Scaling → Train/Test Split        │
└──────────────────────────────────────────────────────────┘
```

### Data Pipeline

| Step | Process | Tool |
|------|---------|------|
| 1 | Load datasets (Heart, Diabetes, Cancer) | pandas, scikit-learn |
| 2 | Handle missing values & outliers | NumPy |
| 3 | Feature scaling (StandardScaler) | scikit-learn |
| 4 | Stratified train/test split (80:20) | scikit-learn |
| 5 | Train 6 algorithms per disease (18 models total) | scikit-learn |
| 6 | Evaluate with 5 metrics + ROC curves | scikit-learn, Matplotlib |
| 7 | Serialize models for deployment | joblib |

### Datasets Used

| Disease | Source | Records | Features | Target |
|---------|--------|---------|----------|--------|
| Heart Disease | UCI Cleveland Schema | 920 | 13 | Binary (0/1) |
| Diabetes | Pima Indians Schema | 768 | 8 | Binary (0/1) |
| Breast Cancer | Wisconsin (sklearn) | 569 | 30 | Binary (0/1) |

---

<!-- ═══════════════════════════════════════ -->
## Slide 5 — Algorithms and Deployment
<!-- ═══════════════════════════════════════ -->

# Algorithms & Deployment

### Machine Learning Algorithms

| # | Algorithm | Type | How It Works | Why Chosen |
|---|-----------|------|-------------|------------|
| 1 | **Random Forest** | Ensemble (Bagging) | Combines multiple decision trees via majority voting | Robust to overfitting, handles non-linear data |
| 2 | **Support Vector Machine** | Kernel-based | Finds the optimal separating hyperplane using RBF kernel | Effective in high-dimensional feature spaces |
| 3 | **K-Nearest Neighbors** | Instance-based | Classifies based on majority vote of K nearest samples | Simple, non-parametric, no training phase |
| 4 | **Logistic Regression** | Linear (Probabilistic) | Models probability via sigmoid function | Highly interpretable, strong baseline |
| 5 | **Gradient Boosting** | Ensemble (Boosting) | Sequentially builds trees, each correcting prior errors | Best accuracy on structured/tabular data |
| 6 | **Gaussian Naive Bayes** | Probabilistic | Applies Bayes' theorem assuming feature independence | Fast, works well with small datasets |

### Evaluation Metrics

| Metric | Formula | What It Measures |
|--------|---------|------------------|
| **Accuracy** | (TP+TN) / Total | Overall correctness |
| **Precision** | TP / (TP+FP) | Exactness — minimizes false positives |
| **Recall** | TP / (TP+FN) | Completeness — minimizes missed cases |
| **F1 Score** | 2 × (P×R)/(P+R) | Harmonic mean of precision and recall |
| **ROC-AUC** | Area under ROC curve | Discrimination ability across thresholds |

### Deployment Architecture

| Component | Technology | Role |
|-----------|-----------|------|
| Backend Server | Flask (Python) | REST API serving predictions |
| ML Models | scikit-learn + joblib | Trained models loaded at runtime |
| Frontend | HTML5 / CSS3 / JavaScript | Interactive web interface |
| 3D Animations | Three.js | DNA helix, molecules, ECG — medical theme |
| Charts | Chart.js + Matplotlib | Interactive + static visualizations |

---

<!-- ═══════════════════════════════════════ -->
## Slide 6 — Results
<!-- ═══════════════════════════════════════ -->

# Results

### Model Performance Summary

#### ❤️ Heart Disease Prediction

| Algorithm | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-----------|----------|-----------|--------|----------|---------|
| Random Forest | 80.98% | 80.65% | 81.52% | 81.08% | 90.03% |
| **SVM** ⭐ | **84.24%** | **83.87%** | **84.78%** | **84.32%** | **91.07%** |
| KNN | 77.72% | 79.31% | 75.00% | 77.09% | 85.09% |
| Logistic Regression | 83.15% | 82.11% | 84.78% | 83.42% | 93.05% |
| Gradient Boosting | 80.98% | 80.00% | 82.61% | 81.28% | 89.46% |
| Naive Bayes | 84.24% | 82.47% | 86.96% | 84.66% | 92.27% |

#### 🩸 Diabetes Prediction

| Algorithm | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-----------|----------|-----------|--------|----------|---------|
| Random Forest | 79.87% | 80.00% | 78.95% | 79.47% | 88.27% |
| SVM | 81.17% | 78.67% | 85.07% | 81.75% | 88.95% |
| KNN | 70.13% | 67.14% | 77.63% | 72.01% | 79.96% |
| **Logistic Regression** ⭐ | **81.82%** | **80.26%** | **83.56%** | **81.88%** | **88.95%** |
| Gradient Boosting | 77.92% | 78.67% | 76.62% | 77.63% | 85.85% |
| Naive Bayes | 79.22% | 75.68% | 85.53% | 80.30% | 88.43% |

#### 🔬 Breast Cancer Prediction

| Algorithm | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-----------|----------|-----------|--------|----------|---------|
| Random Forest | 96.49% | 95.35% | 95.35% | 95.35% | 99.37% |
| SVM | 97.37% | 97.67% | 95.35% | 96.50% | 99.58% |
| KNN | 95.61% | 95.35% | 93.02% | 94.17% | 99.12% |
| Logistic Regression | 97.37% | 97.67% | 95.35% | 96.50% | 99.75% |
| **Gradient Boosting** ⭐ | **97.37%** | **95.56%** | **97.67%** | **96.60%** | **99.58%** |
| Naive Bayes | 94.74% | 90.91% | 93.02% | 91.95% | 98.98% |

### Key Findings
- **Best Overall Accuracy**: Breast Cancer prediction achieved **97.37%** (Gradient Boosting)
- **Heart Disease**: SVM and Naive Bayes tied at **84.24%** accuracy
- **Diabetes**: Logistic Regression performed best at **81.82%** accuracy
- **Ensemble methods** (Random Forest, Gradient Boosting) consistently performed well across diseases
- **ROC-AUC scores > 85%** for all algorithms across all diseases — strong discriminative power

---

<!-- ═══════════════════════════════════════ -->
## Slide 7 — Conclusion
<!-- ═══════════════════════════════════════ -->

# Conclusion

### What We Achieved

✅ **Successfully built** a multi-disease prediction system covering **Heart Disease, Diabetes, and Breast Cancer** using **6 ML algorithms**

✅ **Trained 18 models** (6 algorithms × 3 diseases) with accuracies ranging from **70% to 97%**, demonstrating the feasibility of ML in medical risk assessment

✅ **Developed a full-stack web application** with a Flask REST API backend and a premium, interactive frontend featuring 3D medical-themed animations

✅ **Implemented comprehensive model evaluation** using 5 metrics (Accuracy, Precision, Recall, F1, ROC-AUC) with visual comparison dashboards

✅ **Demonstrated that no single algorithm dominates** — different algorithms excel for different diseases, validating our multi-algorithm approach:
- Heart Disease → SVM (84.24%)
- Diabetes → Logistic Regression (81.82%)
- Breast Cancer → Gradient Boosting (97.37%)

### Impact
- Provides an **accessible** tool for preliminary health risk screening
- Empowers users with **transparent, confidence-scored predictions**
- Serves as a **benchmark framework** for comparing ML models in healthcare

---

<!-- ═══════════════════════════════════════ -->
## Slide 8 — Future Scope
<!-- ═══════════════════════════════════════ -->

# Future Scope

### Short-Term Enhancements
| Enhancement | Description |
|-------------|-------------|
| 🧠 **Deep Learning Integration** | Add neural networks (ANN/CNN) for improved accuracy on complex patterns |
| 📱 **Mobile Application** | Build a React Native / Flutter mobile app using the existing REST API |
| 🏥 **More Diseases** | Extend to Liver Disease, Kidney Disease, Lung Cancer, Alzheimer's, etc. |
| 📋 **Patient History Tracking** | Add user authentication and a dashboard to track predictions over time |

### Medium-Term Goals
| Enhancement | Description |
|-------------|-------------|
| 🔗 **EHR Integration** | Connect with Electronic Health Records (FHIR/HL7) for real hospital data |
| 🧬 **Genomic Data** | Incorporate genetic markers for more personalized risk prediction |
| 📊 **Explainable AI (XAI)** | Use SHAP/LIME to explain WHY a model made a specific prediction |
| ☁️ **Cloud Deployment** | Deploy on AWS/Azure/GCP with auto-scaling for production use |

### Long-Term Vision
| Enhancement | Description |
|-------------|-------------|
| 🤝 **Federated Learning** | Train on hospital data without centralized data sharing (privacy-preserving) |
| 🌍 **Multi-Language Support** | Make accessible to non-English-speaking populations |
| 🏗️ **Clinical Validation** | Partner with medical institutions for IRB-approved validation studies |
| 📡 **IoT Integration** | Connect with wearable devices for real-time continuous health monitoring |

---

<!-- ═══════════════════════════════════════ -->
## Slide 9 — References
<!-- ═══════════════════════════════════════ -->

# References

### Datasets
1. Janosi, A., Steinbrunn, W., Pfisterer, M., & Detrano, R. (1988). **Heart Disease Dataset**. UCI Machine Learning Repository. https://archive.ics.uci.edu/ml/datasets/heart+disease

2. Smith, J.W., Everhart, J.E., Dickson, W.C., Knowler, W.C., & Johannes, R.S. (1988). **Pima Indians Diabetes Database**. National Institute of Diabetes and Digestive and Kidney Diseases.

3. Wolberg, W.H., Street, W.N., & Mangasarian, O.L. (1995). **Breast Cancer Wisconsin (Diagnostic) Dataset**. UCI Machine Learning Repository. https://archive.ics.uci.edu/ml/datasets/Breast+Cancer+Wisconsin

### Libraries & Frameworks
4. Pedregosa, F., et al. (2011). **Scikit-learn: Machine Learning in Python**. *Journal of Machine Learning Research*, 12, 2825–2830.

5. Grinberg, M. (2018). **Flask Web Development: Developing Web Applications with Python**. O'Reilly Media.

6. McKinney, W. (2010). **Data Structures for Statistical Computing in Python (pandas)**. *Proceedings of the 9th Python in Science Conference*.

### Research Papers
7. Rajkumar, A., & Reena, G.S. (2010). **Diagnosis of Heart Disease Using Datamining Algorithm**. *Global Journal of Computer Science and Technology*, 10(10), 38–43.

8. Sisodia, D., & Sisodia, D.S. (2018). **Prediction of Diabetes using Classification Algorithms**. *Procedia Computer Science*, 132, 1578–1585.

9. Asri, H., Mousannif, H., Al Moatassime, H., & Noel, T. (2016). **Using Machine Learning Algorithms for Breast Cancer Risk Prediction and Diagnosis**. *Procedia Computer Science*, 83, 1064–1069.

10. World Health Organization. (2024). **Noncommunicable Diseases – Key Facts**. https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases

---

<!-- ═══════════════════════════════════════ -->
## Slide 10 — Thank You
<!-- ═══════════════════════════════════════ -->

# Thank You! 🙏

### HealthGuard AI — Multi-Disease Prediction System

**GitHub**: https://github.com/anilkumardesai18/HealthGuard-AI

**Live Demo**: http://localhost:5000

---

**Questions?**
