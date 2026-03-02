/**
 * HealthGuard AI — Frontend Application
 * Handles disease selection, form generation, API calls, and chart rendering.
 */

// ─── State ────────────────────────────────────────────────────────────────────
const API = '';
let diseaseData = {};
let comparisonData = {};
let selectedDisease = null;
let charts = {};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadDiseaseData();
    await loadComparisonData();
    setupNavigation();
    setupComparisonTabs();
});

// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadDiseaseData() {
    try {
        const res = await fetch(`${API}/api/diseases`);
        if (!res.ok) throw new Error('Failed to load diseases');
        diseaseData = await res.json();
        renderDiseaseCards();
    } catch (err) {
        console.error('Error loading diseases:', err);
        showToast('Error connecting to server. Make sure the Flask server is running.', true);
    }
}

async function loadComparisonData() {
    try {
        const res = await fetch(`${API}/api/comparison`);
        if (!res.ok) throw new Error('Failed to load comparison data');
        comparisonData = await res.json();
        updateStats();
        showComparisonForDisease('heart');
    } catch (err) {
        console.error('Error loading comparison:', err);
    }
}

// ─── Disease Cards ────────────────────────────────────────────────────────────
function renderDiseaseCards() {
    const grid = document.getElementById('diseaseGrid');
    grid.innerHTML = '';

    for (const [key, disease] of Object.entries(diseaseData)) {
        const featureCount = disease.features.length;
        const card = document.createElement('div');
        card.className = 'disease-card';
        card.dataset.disease = key;
        card.innerHTML = `
            <span class="card-icon">${disease.icon}</span>
            <h3>${disease.name}</h3>
            <p>${disease.description}</p>
            <span class="card-tag">${featureCount} Parameters</span>
        `;
        card.addEventListener('click', () => selectDisease(key));
        grid.appendChild(card);
    }
}

function selectDisease(disease) {
    selectedDisease = disease;
    const data = diseaseData[disease];

    // Update card selection
    document.querySelectorAll('.disease-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.disease-card[data-disease="${disease}"]`).classList.add('selected');

    // Show and populate form
    const panel = document.getElementById('predictPanel');
    panel.classList.add('active');
    document.getElementById('formTitle').textContent = `${data.icon} ${data.name} Prediction`;
    document.getElementById('formSubtitle').textContent = `Enter patient clinical parameters for ${data.name.toLowerCase()} risk assessment`;

    renderForm(data.features);

    // Hide previous results
    document.getElementById('resultPanel').classList.remove('active');

    // Scroll to form
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Dynamic Form ─────────────────────────────────────────────────────────────
function renderForm(features) {
    const grid = document.getElementById('formGrid');
    grid.innerHTML = '';

    features.forEach(feat => {
        const group = document.createElement('div');
        group.className = 'form-group';

        if (feat.type === 'select') {
            const options = feat.options.map(o =>
                `<option value="${o.value}" ${o.value == feat.default ? 'selected' : ''}>${o.label}</option>`
            ).join('');
            group.innerHTML = `
                <label>
                    ${feat.label}
                    <span class="info-icon" title="${feat.description}">?</span>
                </label>
                <select name="${feat.name}" id="field_${feat.name}">
                    ${options}
                </select>
            `;
        } else {
            group.innerHTML = `
                <label>
                    ${feat.label}
                    <span class="info-icon" title="${feat.description}">?</span>
                </label>
                <input type="number"
                       name="${feat.name}"
                       id="field_${feat.name}"
                       min="${feat.min}"
                       max="${feat.max}"
                       step="${feat.step}"
                       value="${feat.default}"
                       placeholder="${feat.description}">
            `;
        }

        grid.appendChild(group);
    });

    // Setup form submission
    document.getElementById('predictionForm').onsubmit = handlePrediction;
}

// ─── Prediction ───────────────────────────────────────────────────────────────
async function handlePrediction(e) {
    e.preventDefault();

    if (!selectedDisease) return;

    const btn = document.getElementById('predictBtn');
    const spinner = document.getElementById('spinner');

    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    spinner.classList.add('active');

    const features = {};
    const data = diseaseData[selectedDisease];
    data.features.forEach(feat => {
        const el = document.getElementById(`field_${feat.name}`);
        features[feat.name] = parseFloat(el.value);
    });

    const algorithm = document.getElementById('algoSelect').value;

    try {
        const res = await fetch(`${API}/api/predict/${selectedDisease}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features, algorithm })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Prediction failed');
        }

        const result = await res.json();
        showResult(result);
    } catch (err) {
        console.error('Prediction error:', err);
        showToast(err.message || 'Prediction failed. Check console for details.', true);
    } finally {
        btn.disabled = false;
        btn.textContent = '🔬 Predict Now';
        spinner.classList.remove('active');
    }
}

// ─── Result Display ───────────────────────────────────────────────────────────
function showResult(result) {
    const panel = document.getElementById('resultPanel');
    const card = document.getElementById('resultCard');
    const icon = document.getElementById('resultIcon');
    const label = document.getElementById('resultLabel');
    const algo = document.getElementById('resultAlgo');

    // Styling based on prediction
    card.className = `result-card ${result.prediction === 1 ? 'positive' : 'negative'}`;
    icon.textContent = result.prediction === 1 ? '⚠️' : '✅';
    label.textContent = result.label;
    algo.textContent = `Predicted using ${result.algorithm}`;

    // Probabilities
    document.getElementById('probNeg').textContent = `${result.probabilities.negative}%`;
    document.getElementById('probPos').textContent = `${result.probabilities.positive}%`;

    // Animate confidence gauge
    animateGauge(result.confidence, result.prediction === 1 ? '#f7768e' : '#9ece6a');

    panel.classList.add('active');
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function animateGauge(value, color) {
    const fill = document.getElementById('gaugeFill');
    const text = document.getElementById('gaugeValue');
    const circumference = 2 * Math.PI * 75; // r=75
    const offset = circumference - (value / 100) * circumference;

    fill.style.stroke = color;
    fill.style.strokeDasharray = circumference;

    // Reset animation
    fill.style.transition = 'none';
    fill.style.strokeDashoffset = circumference;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fill.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            fill.style.strokeDashoffset = offset;
        });
    });

    // Count up animation
    let current = 0;
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        current = Math.round(eased * value * 10) / 10;
        text.textContent = `${current}%`;
        text.style.color = color;

        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ─── Comparison Dashboard ─────────────────────────────────────────────────────
function setupComparisonTabs() {
    const tabs = document.querySelectorAll('#compTabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showComparisonForDisease(tab.dataset.disease);
        });
    });
}

function showComparisonForDisease(disease) {
    if (!comparisonData[disease]) return;

    const dm = comparisonData[disease];
    const algos = Object.keys(dm).filter(k => !['best_model', 'feature_names'].includes(k));
    const bestModel = dm.best_model;

    // Update metrics table
    const tbody = document.getElementById('metricsBody');
    tbody.innerHTML = '';

    algos.forEach(algo => {
        const m = dm[algo];
        const isBest = algo === bestModel;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${m.name}${isBest ? '<span class="best-badge">BEST</span>' : ''}</td>
            <td>${m.accuracy}%</td>
            <td>${m.precision}%</td>
            <td>${m.recall}%</td>
            <td>${m.f1_score}%</td>
            <td>${m.roc_auc}%</td>
        `;
        tbody.appendChild(row);
    });

    // Update charts
    renderAccuracyChart(dm, algos);
    renderRadarChart(dm, algos);

    // Update visualization images
    document.getElementById('rocImage').src = `/api/visualizations/${disease}_roc.png`;
    document.getElementById('confusionImage').src = `/api/visualizations/${disease}_confusion.png`;
}

function renderAccuracyChart(dm, algos) {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    const colors = ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#bb9af7', '#73daca'];

    if (charts.accuracy) charts.accuracy.destroy();

    charts.accuracy = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algos.map(a => dm[a].name),
            datasets: [{
                label: 'Accuracy (%)',
                data: algos.map(a => dm[a].accuracy),
                backgroundColor: colors.map(c => c + '80'),
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1b26',
                    borderColor: '#414868',
                    borderWidth: 1,
                    titleColor: '#c0caf5',
                    bodyColor: '#a9b1d6',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.max(0, Math.min(...algos.map(a => dm[a].accuracy)) - 10),
                    max: 100,
                    grid: { color: '#24283b' },
                    ticks: { color: '#a9b1d6' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#a9b1d6',
                        maxRotation: 45,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

function renderRadarChart(dm, algos) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    const colors = ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#bb9af7', '#73daca'];
    const metrics = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc'];
    const metricLabels = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC'];

    if (charts.radar) charts.radar.destroy();

    charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: metricLabels,
            datasets: algos.map((algo, i) => ({
                label: dm[algo].name,
                data: metrics.map(m => dm[algo][m]),
                borderColor: colors[i],
                backgroundColor: colors[i] + '15',
                borderWidth: 2,
                pointBackgroundColor: colors[i],
                pointRadius: 3,
                pointHoverRadius: 5
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a9b1d6',
                        padding: 12,
                        font: { size: 10 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1b26',
                    borderColor: '#414868',
                    borderWidth: 1,
                    titleColor: '#c0caf5',
                    bodyColor: '#a9b1d6',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                r: {
                    beginAtZero: false,
                    min: Math.max(0, Math.min(...algos.flatMap(a => metrics.map(m => dm[a][m]))) - 10),
                    max: 100,
                    grid: { color: '#24283b' },
                    angleLines: { color: '#24283b' },
                    pointLabels: { color: '#a9b1d6', font: { size: 11 } },
                    ticks: { display: false }
                }
            }
        }
    });
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function updateStats() {
    let bestAcc = 0;
    for (const disease of ['heart', 'diabetes', 'cancer']) {
        const dm = comparisonData[disease];
        if (!dm) continue;
        const best = dm.best_model;
        if (best && dm[best].accuracy > bestAcc) bestAcc = dm[best].accuracy;
    }
    document.getElementById('statBestAcc').textContent = bestAcc > 0 ? `${bestAcc}%` : '—';
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function setupNavigation() {
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }

            // Update active state
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Intersection observer for active nav
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => observer.observe(s));
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${isError ? 'error' : ''}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}
