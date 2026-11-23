import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('three-machine');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(5.8, 4.2, 8.2);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 2.25, 0);
    controls.minDistance = 6.5;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.minPolarAngle = Math.PI * 0.18;

    scene.add(new THREE.HemisphereLight(0xf8f4d8, 0x718b80, 2.2));
    const key = new THREE.DirectionalLight(0xfff4d8, 3.3);
    key.position.set(-5, 9, 7);
    key.castShadow = true;
    scene.add(key);

    const machine = new THREE.Group();
    machine.position.y = -0.15;
    scene.add(machine);

    const blue = new THREE.MeshStandardMaterial({ color: 0x263f59, roughness: 0.42, metalness: 0.12 });
    const blueDark = new THREE.MeshStandardMaterial({ color: 0x1b3149, roughness: 0.48 });
    const orange = new THREE.MeshStandardMaterial({ color: 0xd96831, roughness: 0.5 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xf1ede0, roughness: 0.65 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xbad0cb, transparent: true, opacity: 0.38, roughness: 0.08, transmission: 0.2 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xbfc4b7, roughness: 0.35, metalness: 0.5 });

    function box(w, h, d, material, x, y, z) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        machine.add(mesh);
        return mesh;
    }

    function cylinder(r, h, material, x, y, z, radial = 24) {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        machine.add(mesh);
        return mesh;
    }

    function label(text, w, h, color, background, x, y, z, fontSize = 58) {
        const canvasLabel = document.createElement('canvas');
        canvasLabel.width = 512;
        canvasLabel.height = 160;
        const context = canvasLabel.getContext('2d');
        context.fillStyle = background;
        context.fillRect(0, 0, 512, 160);
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        let size = fontSize;
        do {
            context.font = `800 ${size}px Arial`;
            if (context.measureText(text).width <= 470) break;
            size -= 2;
        } while (size > 10);
        context.fillText(text, 256, 80);
        const texture = new THREE.CanvasTexture(canvasLabel);
        texture.colorSpace = THREE.SRGBColorSpace;
        const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
        labelMesh.position.set(x, y, z);
        machine.add(labelMesh);
        return labelMesh;
    }

    // Main cabinet and side depth
    box(6.2, 5.2, 1.25, blue, 0, 2.6, 0);
    box(6.35, 0.18, 1.55, orange, 0, 5.22, 0.12);
    box(6.35, 0.18, 1.55, orange, 0, 5.0, 0.12);
    box(6.35, 0.18, 1.55, orange, 0, 0.45, 0.12);

    // Top sign
    box(6.15, 1.02, 0.12, blueDark, 0, 4.62, 0.72);
    label('VRACICAM', 5.45, 0.66, '#ffffff', '#263f59', 0, 4.66, 0.79, 68);
    label('DISTRIBUTEUR DE PRODUITS VRAC · 24/7', 2.0, 0.22, '#ff9a4a', '#263f59', 0, 4.22, 0.79, 24);

    // Zone dividers
    box(0.12, 3.45, 1.36, orange, -1.05, 2.55, 0);
    box(0.12, 3.45, 1.36, orange, 1.05, 2.55, 0);
    box(1.9, 0.18, 1.38, orange, -2.05, 3.98, 0);
    box(1.9, 0.18, 1.38, orange, 0.05, 3.98, 0);
    box(1.9, 0.18, 1.38, orange, 2.05, 3.98, 0);

    // Dry goods: four clear canisters
    for (let i = 0; i < 4; i++) {
        const x = -2.75 + i * 0.62;
        cylinder(0.24, 1.15, glass, x, 3.28, 0.75);
        cylinder(0.26, 0.09, metal, x, 3.86, 0.75);
        const colors = [0xc79e58, 0xe0c06f, 0xb78b50, 0x70513a];
        cylinder(0.215, 0.78, new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.8 }), x, 3.2, 0.75);
        box(0.48, 0.22, 0.04, cream, x, 2.62, 0.78);
    }

    // Lower dry goods bins
    [-2.5, -1.8].forEach((x, index) => {
        box(0.62, 1.05, 0.58, glass, x, 1.65, 0.62);
        box(0.66, 0.12, 0.62, cream, x, 1.1, 0.64);
    });
    box(0.62, 0.25, 0.62, cream, -2.5, 1.95, 0.64);

    // Liquids pumps
    [-0.55, 0.42].forEach((x, i) => {
        cylinder(0.22, 1.12, i ? new THREE.MeshStandardMaterial({ color: 0x7c472f }) : new THREE.MeshStandardMaterial({ color: 0x90934f }), x, 2.9, 0.72, 20);
        cylinder(0.035, 0.62, metal, x, 3.68, 0.72, 12);
        box(0.35, 0.04, 0.06, metal, x + 0.12, 3.98, 0.72);
    });
    box(0.78, 1.25, 0.48, metal, 0.55, 1.62, 0.62);

    // Hygiene bottles
    [-0.35, 0.22, 0.78].forEach((x, i) => {
        const bottleColors = [0xdbaea7, 0x9fc3ca, 0x91b79d];
        cylinder(0.16, 0.82, new THREE.MeshStandardMaterial({ color: bottleColors[i], roughness: 0.45, transparent: true, opacity: 0.95 }), x + 1.2, 3.15, 0.72, 16);
        cylinder(0.05, 0.18, metal, x + 1.2, 3.72, 0.72, 12);
        box(0.22, 0.06, 0.14, metal, x + 1.24, 3.82, 0.72);
    });

    // Refill windows
    box(0.82, 1.4, 0.62, glass, 1.45, 1.55, 0.62);
    box(0.82, 1.4, 0.62, glass, 2.38, 1.55, 0.62);
    box(0.86, 0.12, 0.66, orange, 1.45, 0.74, 0.64);
    box(0.86, 0.12, 0.66, orange, 2.38, 0.74, 0.64);

    // Base, feet and top orange trim
    box(5.9, 0.5, 1.25, blueDark, 0, 0.42, 0);
    [-2.65, 2.65].forEach(x => box(0.38, 0.28, 0.38, blueDark, x, 0.05, 0.5));

    // Terminal de paiement fixé sur la zone bleue gauche
    box(0.9, 0.13, 0.18, blueDark, -0.78, 1.18, 0.98);
    box(0.62, 0.82, 0.18, cream, -0.78, 1.72, 0.98);
    box(0.49, 0.46, 0.04, new THREE.MeshStandardMaterial({ color: 0x1d5a60, roughness: 0.25 }), -0.78, 1.80, 1.09);
    box(0.58, 0.08, 0.22, blueDark, -0.78, 1.14, 1.02);
    [-0.16, 0, 0.16].forEach((dx, row) => {
        for (let col = -1; col <= 1; col++) {
            box(0.09, 0.08, 0.02, metal, -0.78 + col * 0.14, 1.68 + dx, 1.12);
        }
    });
    box(0.18, 0.08, 0.03, orange, -0.78, 1.43, 1.12);

    // Sacs en tissu posés sur les côtés
    function fabricBag(x, z, height, tilt) {
        const fabric = new THREE.MeshStandardMaterial({ color: 0xded7c2, roughness: 0.95, side: THREE.DoubleSide });
        const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.27, height, 16, 1, false), fabric);
        bag.position.set(x, height / 2 + 0.18, z);
        bag.rotation.z = tilt;
        bag.castShadow = true;
        machine.add(bag);

        const handleShape = new THREE.TorusGeometry(0.17, 0.025, 8, 18, Math.PI);
        const handle = new THREE.Mesh(handleShape, fabric);
        handle.position.set(x, height + 0.18, z);
        handle.rotation.z = Math.PI;
        handle.rotation.y = Math.PI / 2;
        handle.castShadow = true;
        machine.add(handle);
    }
    [-3.55, 3.55].forEach((x) => {
        fabricBag(x, 0.42, 0.82, x < 0 ? -0.04 : 0.04);
        fabricBag(x + (x < 0 ? -0.18 : 0.18), -0.18, 0.68, x < 0 ? 0.07 : -0.07);
    });

    // Subtle ground
    const ground = new THREE.Mesh(new THREE.CircleGeometry(5.5, 64), new THREE.ShadowMaterial({ color: 0x4b6048, opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => card.addEventListener('click', () => {
        cards.forEach(item => item.classList.remove('selected'));
        card.classList.add('selected');
    }));

    document.querySelectorAll('.add-button').forEach(button => button.addEventListener('click', event => {
        event.stopPropagation();
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = String(Number(cartCount.textContent) + 1);
        document.getElementById('cart-empty').textContent = `${cartCount.textContent} produit(s) dans votre panier.`;
    }));

    const navLinks = document.querySelectorAll('.topbar nav a');
    const conceptView = document.getElementById('concept-view');
    const movementsView = document.getElementById('mouvements-view');
    const boutique = document.querySelector('.shop');

    function showView(name) {
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === name));
        conceptView.classList.toggle('open', name === 'concept');
        movementsView.classList.toggle('open', name === 'mouvements');
        conceptView.setAttribute('aria-hidden', String(name !== 'concept'));
        movementsView.setAttribute('aria-hidden', String(name !== 'mouvements'));
        boutique.style.visibility = name === 'boutique' ? 'visible' : 'hidden';
        if (name === 'boutique') {
            history.replaceState(null, '', '#boutique');
        }
    }

    navLinks.forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        showView(link.dataset.view);
        history.replaceState(null, '', `#${link.dataset.view}`);
    }));

    const searchPanel = document.getElementById('search-panel');
    const cartPanel = document.getElementById('cart-panel');
    document.getElementById('search-button').addEventListener('click', () => {
        cartPanel.classList.remove('open');
        searchPanel.classList.toggle('open');
        if (searchPanel.classList.contains('open')) document.getElementById('search-input').focus();
    });
    document.getElementById('cart-button').addEventListener('click', () => {
        searchPanel.classList.remove('open');
        cartPanel.classList.toggle('open');
    });

    const catalog = {
        epicerie: [
            ['Pâtes torsadées', 'Fait à partir de blé français', '2,40 €', 'pasta-thumb'],
            ['Riz basmati', 'Origine Inde · vrac', '3,20 €', 'rice-thumb'],
            ['Avoine complète', 'Flocons dorés · agriculture raisonnée', '1,90 €', 'oat-thumb']
        ],
        maison: [
            ['Savon liquide', 'Recharge lavande · 500 ml', '4,80 €', 'oat-thumb'],
            ['Lessive naturelle', 'Sans parfum · 1 litre', '6,50 €', 'rice-thumb'],
            ['Gel lavant', 'Flacon rechargeable', '3,90 €', 'pasta-thumb']
        ],
        boissons: [
            ['Huile d’olive', 'Pressée localement · 1 litre', '9,80 €', 'pasta-thumb'],
            ['Vinaigre de cidre', 'Fermenté naturellement', '5,60 €', 'rice-thumb'],
            ['Sirop artisanal', 'Recette maison · menthe', '7,20 €', 'oat-thumb']
        ]
    };

    const productList = document.getElementById('product-list');
    function renderCategory(categoryName) {
        productList.innerHTML = catalog[categoryName].map((item, index) => `
            <article class="product-card ${index === 0 ? 'selected' : ''}" data-name="${item[0]}" data-price="${item[2]}">
                <div class="product-thumb ${item[3]}"><span></span></div>
                <div class="product-info"><h2>${item[0]}</h2><p>${item[1]}</p><strong>${item[2]} <small>/ unité</small></strong></div>
                <button class="add-button" aria-label="Ajouter ${item[0]}">+</button>
            </article>
        `).join('');
        bindProductCards();
    }

    function bindProductCards() {
        const freshCards = [...document.querySelectorAll('.product-card')];
        freshCards.forEach(card => {
            card.addEventListener('click', () => {
                freshCards.forEach(item => item.classList.remove('selected'));
                card.classList.add('selected');
            });
            card.querySelector('.add-button').addEventListener('click', event => {
                event.stopPropagation();
                card.click();
                const cartCount = document.getElementById('cart-count');
                cartCount.textContent = String(Number(cartCount.textContent) + 1);
                document.getElementById('cart-empty').textContent = `${cartCount.textContent} produit(s) dans votre panier.`;
            });
        });
    }

    document.querySelectorAll('.category').forEach(category => category.addEventListener('click', () => {
        document.querySelectorAll('.category').forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-selected', 'false');
        });
        category.classList.add('active');
        category.setAttribute('aria-selected', 'true');
        renderCategory(category.dataset.category);
    }));

    document.getElementById('search-input').addEventListener('input', event => {
        const query = event.target.value.trim().toLowerCase();
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.display = card.dataset.name.toLowerCase().includes(query) ? '' : 'none';
        });
    });

    const initialView = location.hash.replace('#', '');
    if (['concept', 'mouvements'].includes(initialView)) showView(initialView);

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);
    resize();

    function animate() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
});
