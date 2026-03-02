/**
 * HealthGuard AI — 3D Medical Scene & Cursor Interactions
 * Three.js powered 3D medical objects + interactive cursor effects
 */

// ═══════════════════════════════════════════════════════════════
// 1. THREE.JS 3D MEDICAL SCENE
// ═══════════════════════════════════════════════════════════════

let scene, camera, renderer, clock;
let medicalObjects = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

function initThreeScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x7aa2f7, 1.5, 100);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xbb9af7, 1.2, 100);
    pointLight2.position.set(-15, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xf7768e, 0.8, 80);
    pointLight3.position.set(0, -15, 5);
    scene.add(pointLight3);

    // Create medical objects
    createDNAHelix();
    createMolecules();
    createHeartbeatPulse();
    createFloatingCrosses();
    createFloatingParticles();

    // Events
    document.addEventListener('mousemove', onDocMouseMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

// ─── DNA Double Helix ──────────────────────────────────────────
function createDNAHelix() {
    const helixGroup = new THREE.Group();
    const numPoints = 80;
    const radius = 2;
    const height = 20;

    const sphereGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const strandMat1 = new THREE.MeshPhongMaterial({
        color: 0x7aa2f7,
        emissive: 0x3355aa,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85
    });
    const strandMat2 = new THREE.MeshPhongMaterial({
        color: 0xbb9af7,
        emissive: 0x6633aa,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85
    });

    const bondMat = new THREE.MeshPhongMaterial({
        color: 0x73daca,
        emissive: 0x225544,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.5
    });

    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 4;
        const y = (i / numPoints) * height - height / 2;

        // Strand 1
        const x1 = Math.cos(t) * radius;
        const z1 = Math.sin(t) * radius;
        const sphere1 = new THREE.Mesh(sphereGeo, strandMat1);
        sphere1.position.set(x1, y, z1);
        helixGroup.add(sphere1);

        // Strand 2 (offset by PI)
        const x2 = Math.cos(t + Math.PI) * radius;
        const z2 = Math.sin(t + Math.PI) * radius;
        const sphere2 = new THREE.Mesh(sphereGeo, strandMat2);
        sphere2.position.set(x2, y, z2);
        helixGroup.add(sphere2);

        // Connecting bonds every few points
        if (i % 5 === 0) {
            const bondGeo = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 4);
            const bond = new THREE.Mesh(bondGeo, bondMat);
            bond.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
            bond.lookAt(new THREE.Vector3(x1, y, z1));
            bond.rotateZ(Math.PI / 2);
            helixGroup.add(bond);
        }
    }

    helixGroup.position.set(-12, 0, -5);
    helixGroup.userData = {
        type: 'dna',
        rotSpeed: 0.3,
        floatSpeed: 0.5,
        floatAmp: 1.5,
        baseY: 0
    };
    scene.add(helixGroup);
    medicalObjects.push(helixGroup);
}

// ─── Molecular Structures ──────────────────────────────────────
function createMolecules() {
    const moleculePositions = [
        { x: 14, y: 6, z: -8 },
        { x: -8, y: -8, z: -10 },
        { x: 10, y: -5, z: -6 }
    ];

    const colors = [0x9ece6a, 0xf7768e, 0xe0af68];

    moleculePositions.forEach((pos, idx) => {
        const group = new THREE.Group();
        const color = colors[idx];

        // Central atom
        const centerGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const centerMat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const center = new THREE.Mesh(centerGeo, centerMat);
        group.add(center);

        // Orbiting atoms
        const numOrbit = 4 + idx;
        const orbitGeo = new THREE.SphereGeometry(0.25, 12, 12);

        for (let i = 0; i < numOrbit; i++) {
            const theta = (i / numOrbit) * Math.PI * 2;
            const orbitRadius = 1.5 + Math.random() * 0.5;
            const orbitMat = new THREE.MeshPhongMaterial({
                color: 0x7aa2f7,
                emissive: 0x334488,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });
            const atom = new THREE.Mesh(orbitGeo, orbitMat);
            atom.position.set(
                Math.cos(theta) * orbitRadius,
                Math.sin(theta) * orbitRadius * 0.6,
                Math.sin(theta) * orbitRadius * 0.4
            );
            group.add(atom);

            // Bond line
            const bondGeo = new THREE.CylinderGeometry(0.03, 0.03, orbitRadius, 4);
            const bondMat = new THREE.MeshPhongMaterial({
                color: 0x414868,
                transparent: true,
                opacity: 0.4
            });
            const bond = new THREE.Mesh(bondGeo, bondMat);
            bond.position.set(atom.position.x / 2, atom.position.y / 2, atom.position.z / 2);
            bond.lookAt(atom.position);
            bond.rotateX(Math.PI / 2);
            group.add(bond);
        }

        // Electron ring
        const ringGeo = new THREE.TorusGeometry(2, 0.03, 8, 64);
        const ringMat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        group.add(ring);

        group.position.set(pos.x, pos.y, pos.z);
        group.userData = {
            type: 'molecule',
            rotSpeed: 0.4 + Math.random() * 0.4,
            floatSpeed: 0.3 + Math.random() * 0.3,
            floatAmp: 1 + Math.random(),
            baseY: pos.y,
            orbitPhase: Math.random() * Math.PI * 2
        };
        scene.add(group);
        medicalObjects.push(group);
    });
}

// ─── Heartbeat Pulse Line ──────────────────────────────────────
function createHeartbeatPulse() {
    const group = new THREE.Group();
    const points = [];
    const numSegments = 200;

    for (let i = 0; i < numSegments; i++) {
        const x = (i / numSegments) * 16 - 8;
        const y = getHeartbeatY(i / numSegments);
        points.push(new THREE.Vector3(x, y, 0));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xf7768e,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
    });
    const line = new THREE.Line(geometry, material);
    group.add(line);

    // Glow spheres at peaks
    const glowGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const glowMat = new THREE.MeshPhongMaterial({
        color: 0xf7768e,
        emissive: 0xf7768e,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
    });

    [0.3, 0.35, 0.65, 0.7].forEach(t => {
        const glow = new THREE.Mesh(glowGeo, glowMat);
        const x = t * 16 - 8;
        glow.position.set(x, getHeartbeatY(t), 0);
        group.add(glow);
    });

    group.position.set(12, -2, -3);
    group.userData = {
        type: 'heartbeat',
        geometry: geometry,
        numSegments: numSegments,
        floatSpeed: 0.2,
        floatAmp: 0.5,
        baseY: -2
    };
    scene.add(group);
    medicalObjects.push(group);
}

function getHeartbeatY(t) {
    // Simulate an ECG waveform pattern
    const cycle = t * 4 % 1;
    if (cycle > 0.28 && cycle < 0.32) return 2.5;
    if (cycle > 0.32 && cycle < 0.36) return -1.5;
    if (cycle > 0.36 && cycle < 0.40) return 1.8;
    if (cycle > 0.40 && cycle < 0.44) return 0.4;
    if (cycle > 0.60 && cycle < 0.68) return 0.5;
    return 0;
}

// ─── Floating Medical Crosses ──────────────────────────────────
function createFloatingCrosses() {
    const crossShape = new THREE.Shape();
    const w = 0.15, h = 0.5;
    crossShape.moveTo(-w, -h);
    crossShape.lineTo(w, -h);
    crossShape.lineTo(w, -w);
    crossShape.lineTo(h, -w);
    crossShape.lineTo(h, w);
    crossShape.lineTo(w, w);
    crossShape.lineTo(w, h);
    crossShape.lineTo(-w, h);
    crossShape.lineTo(-w, w);
    crossShape.lineTo(-h, w);
    crossShape.lineTo(-h, -w);
    crossShape.lineTo(-w, -w);
    crossShape.closePath();

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
    const crossGeo = new THREE.ExtrudeGeometry(crossShape, extrudeSettings);

    const positions = [
        { x: -16, y: 8, z: -12 },
        { x: 16, y: -8, z: -15 },
        { x: -5, y: 12, z: -10 },
        { x: 8, y: 10, z: -14 },
        { x: -14, y: -6, z: -11 }
    ];

    positions.forEach((pos, i) => {
        const mat = new THREE.MeshPhongMaterial({
            color: 0x73daca,
            emissive: 0x225544,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.35 + Math.random() * 0.2
        });
        const cross = new THREE.Mesh(crossGeo, mat);
        cross.position.set(pos.x, pos.y, pos.z);
        cross.scale.setScalar(1 + Math.random() * 1.5);
        cross.userData = {
            type: 'cross',
            rotSpeed: 0.2 + Math.random() * 0.3,
            floatSpeed: 0.2 + Math.random() * 0.2,
            floatAmp: 0.8 + Math.random() * 0.8,
            baseY: pos.y,
            phase: Math.random() * Math.PI * 2
        };
        scene.add(cross);
        medicalObjects.push(cross);
    });
}

// ─── Floating Particles ────────────────────────────────────────
function createFloatingParticles() {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
        new THREE.Color(0x7aa2f7),
        new THREE.Color(0xbb9af7),
        new THREE.Color(0x73daca),
        new THREE.Color(0x9ece6a),
        new THREE.Color(0xf7768e)
    ];

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;

        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData = { type: 'particles' };
    scene.add(particles);
    medicalObjects.push(particles);
}

// ─── Animation Loop ────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse tracking
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Camera follows mouse subtly
    camera.position.x = mouseX * 3;
    camera.position.y = mouseY * 2;
    camera.lookAt(0, 0, 0);

    medicalObjects.forEach(obj => {
        const ud = obj.userData;

        if (ud.type === 'dna') {
            obj.rotation.y += ud.rotSpeed * 0.01;
            obj.position.y = ud.baseY + Math.sin(elapsed * ud.floatSpeed) * ud.floatAmp;
        }
        else if (ud.type === 'molecule') {
            obj.rotation.y += ud.rotSpeed * 0.008;
            obj.rotation.x += ud.rotSpeed * 0.004;
            obj.position.y = ud.baseY + Math.sin(elapsed * ud.floatSpeed + ud.orbitPhase) * ud.floatAmp;
        }
        else if (ud.type === 'heartbeat') {
            // Animate the heartbeat line sweeping
            const positions = ud.geometry.attributes.position.array;
            for (let i = 0; i < ud.numSegments; i++) {
                const t = (i / ud.numSegments + elapsed * 0.1) % 1;
                positions[i * 3 + 1] = getHeartbeatY(t);
            }
            ud.geometry.attributes.position.needsUpdate = true;
            obj.position.y = ud.baseY + Math.sin(elapsed * ud.floatSpeed) * ud.floatAmp;
        }
        else if (ud.type === 'cross') {
            obj.rotation.y += ud.rotSpeed * 0.005;
            obj.rotation.z += ud.rotSpeed * 0.003;
            obj.position.y = ud.baseY + Math.sin(elapsed * ud.floatSpeed + ud.phase) * ud.floatAmp;
        }
        else if (ud.type === 'particles') {
            obj.rotation.y += 0.0003;
            obj.rotation.x += 0.0001;

            // Subtle particle drift
            const pos = obj.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] += Math.sin(elapsed * 0.5 + i) * 0.002;
            }
            obj.geometry.attributes.position.needsUpdate = true;
        }
    });

    renderer.render(scene, camera);
}

function onDocMouseMove(e) {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// ═══════════════════════════════════════════════════════════════
// 2. CUSTOM CURSOR WITH GLOW TRAIL
// ═══════════════════════════════════════════════════════════════

function initCursorEffects() {
    // Create cursor elements
    const cursorOuter = document.createElement('div');
    cursorOuter.className = 'cursor-outer';
    document.body.appendChild(cursorOuter);

    const cursorInner = document.createElement('div');
    cursorInner.className = 'cursor-inner';
    document.body.appendChild(cursorInner);

    // Create trail dots
    const trailCount = 8;
    const trails = [];
    for (let i = 0; i < trailCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.opacity = 1 - (i / trailCount);
        dot.style.transform = `scale(${1 - (i / trailCount) * 0.6})`;
        document.body.appendChild(dot);
        trails.push({ el: dot, x: 0, y: 0 });
    }

    let cursorX = 0, cursorY = 0;
    let outerX = 0, outerY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorInner.style.left = cursorX + 'px';
        cursorInner.style.top = cursorY + 'px';
    });

    // Hover effects on interactive elements
    const hoverTargets = 'a, button, .disease-card, .algo-card, .tab, input, select, .btn';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursorOuter.classList.add('cursor-hover');
            cursorInner.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursorOuter.classList.remove('cursor-hover');
            cursorInner.classList.remove('cursor-hover');
        }
    });

    // Click pulse effect
    document.addEventListener('mousedown', () => {
        cursorOuter.classList.add('cursor-click');
        setTimeout(() => cursorOuter.classList.remove('cursor-click'), 400);
    });

    // Animate outer cursor and trail with lerp
    function updateCursor() {
        outerX += (cursorX - outerX) * 0.12;
        outerY += (cursorY - outerY) * 0.12;
        cursorOuter.style.left = outerX + 'px';
        cursorOuter.style.top = outerY + 'px';

        // Trail follows with increasing delay
        let prevX = cursorX, prevY = cursorY;
        trails.forEach((trail, i) => {
            trail.x += (prevX - trail.x) * (0.25 - i * 0.02);
            trail.y += (prevY - trail.y) * (0.25 - i * 0.02);
            trail.el.style.left = trail.x + 'px';
            trail.el.style.top = trail.y + 'px';
            prevX = trail.x;
            prevY = trail.y;
        });

        requestAnimationFrame(updateCursor);
    }
    updateCursor();
}


// ═══════════════════════════════════════════════════════════════
// 3. CARD TILT / PARALLAX EFFECT
// ═══════════════════════════════════════════════════════════════

function initCardTilt() {
    const tiltCards = document.querySelectorAll('.disease-card, .algo-card, .stat-item, .chart-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;

            // Glossy highlight
            const glossX = (x / rect.width) * 100;
            const glossY = (y / rect.height) * 100;
            card.style.background = `
                radial-gradient(circle at ${glossX}% ${glossY}%, rgba(122, 162, 247, 0.08) 0%, transparent 50%),
                rgba(26, 27, 38, 0.7)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.background = '';
        });
    });
}


// ═══════════════════════════════════════════════════════════════
// 4. MAGNETIC BUTTON EFFECT
// ═══════════════════════════════════════════════════════════════

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}


// ═══════════════════════════════════════════════════════════════
// 5. SCROLL-TRIGGERED ANIMATIONS
// ═══════════════════════════════════════════════════════════════

function initScrollAnimations() {
    const targets = document.querySelectorAll(
        '.disease-card, .algo-card, .stat-item, .chart-card, .section-header, .form-card, .viz-card'
    );

    targets.forEach(el => {
        el.classList.add('scroll-reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered entrance
                setTimeout(() => {
                    entry.target.classList.add('scroll-reveal-visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(el => observer.observe(el));
}


// ═══════════════════════════════════════════════════════════════
// 6. RIPPLE EFFECT ON CLICK
// ═══════════════════════════════════════════════════════════════

function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.disease-card, .btn, .tab, .algo-card');
        if (!target) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(ripple);

        setTimeout(() => ripple.remove(), 700);
    });
}


// ═══════════════════════════════════════════════════════════════
// INITIALIZE ALL EFFECTS
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Only init 3D if not on mobile (performance)
    if (window.innerWidth > 768) {
        initThreeScene();
        initCursorEffects();
    }
    initCardTilt();
    initMagneticButtons();
    initScrollAnimations();
    initRippleEffect();
});
