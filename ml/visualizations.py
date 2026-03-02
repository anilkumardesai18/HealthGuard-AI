"""
HealthGuard AI — Visualizations Module
Generates charts for model comparison, confusion matrices, and ROC curves.
"""

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server use

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import json
import os


def set_style():
    """Set up a dark, premium color scheme for all charts."""
    plt.rcParams.update({
        'figure.facecolor': '#0f1117',
        'axes.facecolor': '#1a1b26',
        'axes.edgecolor': '#414868',
        'axes.labelcolor': '#c0caf5',
        'text.color': '#c0caf5',
        'xtick.color': '#a9b1d6',
        'ytick.color': '#a9b1d6',
        'grid.color': '#24283b',
        'font.family': 'sans-serif',
        'font.size': 11,
    })


COLORS = ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#bb9af7', '#73daca']
ALGO_SHORT = {
    'random_forest': 'RF',
    'svm': 'SVM',
    'knn': 'KNN',
    'logistic_regression': 'LR',
    'gradient_boosting': 'GB',
    'naive_bayes': 'NB'
}


def generate_all_visualizations(metrics_path='saved_models/metrics.json',
                                 output_dir='static/visualizations'):
    """Generate all chart images from saved metrics."""
    os.makedirs(output_dir, exist_ok=True)
    set_style()

    with open(metrics_path, 'r') as f:
        metrics = json.load(f)

    for disease in ['heart', 'diabetes', 'cancer']:
        if disease not in metrics:
            continue

        dm = metrics[disease]
        algos = [k for k in dm if k not in ('best_model', 'feature_names')]

        # 1. Accuracy Comparison Bar Chart
        _plot_metric_comparison(dm, algos, disease, 'accuracy', 'Accuracy', output_dir)

        # 2. Multi-Metric Grouped Bar Chart
        _plot_multi_metric(dm, algos, disease, output_dir)

        # 3. ROC Curves
        _plot_roc_curves(dm, algos, disease, output_dir)

        # 4. Confusion Matrix for best model
        best = dm.get('best_model', algos[0])
        _plot_confusion_matrix(dm[best], disease, best, output_dir)

    # 5. Overall comparison across diseases
    _plot_overall_comparison(metrics, output_dir)

    print(f"  Visualizations saved to: {os.path.abspath(output_dir)}")


def _plot_metric_comparison(dm, algos, disease, metric, metric_label, output_dir):
    fig, ax = plt.subplots(figsize=(10, 5))
    values = [dm[a][metric] for a in algos]
    names = [ALGO_SHORT[a] for a in algos]

    bars = ax.bar(names, values, color=COLORS, edgecolor='none', width=0.6, zorder=3)

    # Value labels on bars
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f'{val}%', ha='center', va='bottom', fontweight='bold', fontsize=12)

    ax.set_ylim(0, 105)
    ax.set_ylabel(f'{metric_label} (%)')
    ax.set_title(f'{disease.upper()} — {metric_label} Comparison', fontsize=14, fontweight='bold', pad=15)
    ax.grid(axis='y', alpha=0.3, zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, f'{disease}_{metric}.png'), dpi=150, bbox_inches='tight')
    plt.close(fig)


def _plot_multi_metric(dm, algos, disease, output_dir):
    fig, ax = plt.subplots(figsize=(12, 6))
    metric_keys = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc']
    metric_labels = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC']
    x = np.arange(len(algos))
    width = 0.15

    for i, (mk, ml) in enumerate(zip(metric_keys, metric_labels)):
        vals = [dm[a][mk] for a in algos]
        ax.bar(x + i * width, vals, width, label=ml, color=COLORS[i], zorder=3)

    ax.set_xticks(x + width * 2)
    ax.set_xticklabels([ALGO_SHORT[a] for a in algos])
    ax.set_ylim(0, 110)
    ax.set_ylabel('Score (%)')
    ax.set_title(f'{disease.upper()} — All Metrics Comparison', fontsize=14, fontweight='bold', pad=15)
    ax.legend(loc='upper right', framealpha=0.8)
    ax.grid(axis='y', alpha=0.3, zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, f'{disease}_all_metrics.png'), dpi=150, bbox_inches='tight')
    plt.close(fig)


def _plot_roc_curves(dm, algos, disease, output_dir):
    fig, ax = plt.subplots(figsize=(8, 7))

    for i, algo in enumerate(algos):
        roc = dm[algo].get('roc_curve', {})
        fpr = roc.get('fpr', [0, 1])
        tpr = roc.get('tpr', [0, 1])
        auc = dm[algo]['roc_auc']
        ax.plot(fpr, tpr, color=COLORS[i], linewidth=2,
                label=f'{ALGO_SHORT[algo]} (AUC={auc}%)')

    ax.plot([0, 1], [0, 1], 'w--', alpha=0.3, linewidth=1)
    ax.set_xlabel('False Positive Rate')
    ax.set_ylabel('True Positive Rate')
    ax.set_title(f'{disease.upper()} — ROC Curves', fontsize=14, fontweight='bold', pad=15)
    ax.legend(loc='lower right', framealpha=0.8)
    ax.grid(alpha=0.2)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, f'{disease}_roc.png'), dpi=150, bbox_inches='tight')
    plt.close(fig)


def _plot_confusion_matrix(algo_metrics, disease, algo_key, output_dir):
    fig, ax = plt.subplots(figsize=(6, 5))
    cm = np.array(algo_metrics['confusion_matrix'])

    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                xticklabels=['Negative', 'Positive'],
                yticklabels=['Negative', 'Positive'],
                linewidths=0.5, linecolor='#414868',
                annot_kws={'fontsize': 16, 'fontweight': 'bold'})

    ax.set_xlabel('Predicted', fontsize=12)
    ax.set_ylabel('Actual', fontsize=12)
    ax.set_title(f'{disease.upper()} — Confusion Matrix ({ALGO_SHORT[algo_key]})',
                 fontsize=13, fontweight='bold', pad=15)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, f'{disease}_confusion.png'), dpi=150, bbox_inches='tight')
    plt.close(fig)


def _plot_overall_comparison(metrics, output_dir):
    """Bar chart comparing best accuracy across all diseases."""
    fig, ax = plt.subplots(figsize=(10, 5))

    diseases = []
    best_accs = []
    best_names = []

    for disease in ['heart', 'diabetes', 'cancer']:
        if disease not in metrics:
            continue
        dm = metrics[disease]
        best_key = dm.get('best_model')
        if best_key:
            diseases.append(disease.upper())
            best_accs.append(dm[best_key]['accuracy'])
            best_names.append(dm[best_key]['name'])

    bars = ax.bar(diseases, best_accs, color=['#f7768e', '#e0af68', '#bb9af7'],
                  edgecolor='none', width=0.5, zorder=3)

    for bar, val, name in zip(bars, best_accs, best_names):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f'{val}%\n({name})', ha='center', va='bottom', fontweight='bold', fontsize=11)

    ax.set_ylim(0, 110)
    ax.set_ylabel('Best Accuracy (%)')
    ax.set_title('Best Model Accuracy per Disease', fontsize=14, fontweight='bold', pad=15)
    ax.grid(axis='y', alpha=0.3, zorder=0)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, 'overall_comparison.png'), dpi=150, bbox_inches='tight')
    plt.close(fig)
