"""
HealthGuard AI — Model Training Script
Run this once to train all models and generate visualizations.

Usage:
    python train_models.py
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml.models import train_all_models
from ml.visualizations import generate_all_visualizations


def main():
    print("=" * 60)
    print("  HealthGuard AI — Model Training Pipeline")
    print("=" * 60)
    print()

    # Step 1: Train all models
    print("[1/2] Training ML models...")
    metrics = train_all_models(save_dir='saved_models')

    # Step 2: Generate visualizations
    print("\n[2/2] Generating visualizations...")
    generate_all_visualizations(
        metrics_path='saved_models/metrics.json',
        output_dir='static/visualizations'
    )

    # Summary
    print("\n" + "=" * 60)
    print("  Training Complete! Summary:")
    print("=" * 60)

    for disease in ['heart', 'diabetes', 'cancer']:
        dm = metrics[disease]
        best_key = dm['best_model']
        best_acc = dm[best_key]['accuracy']
        print(f"\n  {disease.upper()}")
        print(f"    Best model : {dm[best_key]['name']}")
        print(f"    Accuracy   : {best_acc}%")
        print(f"    F1 Score   : {dm[best_key]['f1_score']}%")
        print(f"    ROC AUC    : {dm[best_key]['roc_auc']}%")

    print("\n" + "=" * 60)
    print("  Next: Run 'python app.py' to start the web server!")
    print("=" * 60)


if __name__ == '__main__':
    main()
