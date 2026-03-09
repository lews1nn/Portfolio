let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let threeRafId = null;
const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const isLowEndDevice =
    (typeof navigator !== 'undefined' &&
        ((typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4) ||
            (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4))) ||
    false;
const enableHeavyEffects = !prefersReducedMotion && !isLowEndDevice;

function initThreeJS() {
    if (!enableHeavyEffects) return;
    if (!window.THREE) return;

    try {
        scene = new THREE.Scene();
    
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
    
        const canvas = document.getElementById('bg3d');
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        renderer.setClearColor(0x000000, 0);
    
        createParticles();
    
        addLights();
    
        startThreeLoop();
    } catch {
        stopThreeLoop();
        renderer?.dispose?.();
        renderer = null;
    }
}

function createParticles() {
    const particleCount = window.innerWidth < 768 ? 250 : 450;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
        
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.9, 0.8, 0.5); // Tons de vermelho/roxo
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x6a0dad, 1, 100);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);
}

function stopThreeLoop() {
    if (threeRafId) {
        cancelAnimationFrame(threeRafId);
        threeRafId = null;
    }
}

function startThreeLoop() {
    if (!renderer || !camera) return;
    if (threeRafId) return;

    const targetFps = 30;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;

    const loop = () => {
        threeRafId = requestAnimationFrame(loop);
        if (document.hidden) return;
        const now = performance.now();
        if (now - lastFrameTime < frameInterval) return;
        lastFrameTime = now;

        if (particles) {
            particles.rotation.x += 0.001;
            particles.rotation.y += 0.002;
            particles.rotation.x += mouseY * 0.0001;
            particles.rotation.y += mouseX * 0.0001;
        }

        renderer.render(scene, camera);
    };

    loop();
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
}

let pointerMoveRaf = null;
let lastPointerEvent = null;

function onPointerMove(event) {
    lastPointerEvent = event;
    if (pointerMoveRaf) return;

    pointerMoveRaf = requestAnimationFrame(() => {
        pointerMoveRaf = null;
        if (!lastPointerEvent) return;
        mouseX = (lastPointerEvent.clientX - window.innerWidth / 2) / 100;
        mouseY = (lastPointerEvent.clientY - window.innerHeight / 2) / 100;
    });
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function initRevealAnimations() {
    const animatedElements = document.querySelectorAll('.section, .project-card, .contact-item');
    animatedElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function init3DCards() {
    if (!enableHeavyEffects) return;
    document.querySelectorAll('.project-card').forEach(card => {
        let raf = null;
        let lastEvent = null;

        const update = () => {
            raf = null;
            if (!lastEvent) return;
            const rect = card.getBoundingClientRect();
            const x = lastEvent.clientX - rect.left;
            const y = lastEvent.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        };

        card.addEventListener('pointermove', (e) => {
            lastEvent = e;
            if (raf) return;
            raf = requestAnimationFrame(update);
        });

        card.addEventListener('pointerleave', () => {
            if (raf) {
                cancelAnimationFrame(raf);
                raf = null;
            }
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}

function initParallax() {
    if (!enableHeavyEffects) return;

    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            ticking = false;
            const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
            heroContent.style.transform = `translateY(${-(scrolled * 0.2)}px) translateZ(20px)`;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initInteractiveParticles() {
    if (!enableHeavyEffects) return;

    const tags = Array.from(document.querySelectorAll('.skill-tag'));
    if (!tags.length) return;

    let raf = null;
    let lastEvent = null;

    const update = () => {
        raf = null;
        if (!lastEvent) return;

        for (const tag of tags) {
            const rect = tag.getBoundingClientRect();
            const x = lastEvent.clientX - rect.left - rect.width / 2;
            const y = lastEvent.clientY - rect.top - rect.height / 2;
            const distance = Math.hypot(x, y);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                tag.style.transform = `translateZ(${force * 20}px) scale(${1 + force * 0.1})`;
            } else {
                tag.style.transform = 'translateZ(0px) scale(1)';
            }
        }
    };

    document.addEventListener(
        'pointermove',
        (e) => {
            lastEvent = e;
            if (raf) return;
            raf = requestAnimationFrame(update);
        },
        { passive: true }
    );
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: enableHeavyEffects ? 'smooth' : 'auto'
    });
}

let scrollTopBtn = null;
let scrollRaf = null;

function ensureScrollTopButton() {
    if (scrollTopBtn) return;
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.type = 'button';
    scrollTopBtn.textContent = '↑';
    scrollTopBtn.setAttribute('aria-label', 'Voltar ao topo');
    scrollTopBtn.addEventListener('click', scrollToTop);
    scrollTopBtn.hidden = true;
    document.body.appendChild(scrollTopBtn);
}

function onScroll() {
    if (scrollRaf) return;

    scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

        if (scrollTop > 500) {
            ensureScrollTopButton();
            scrollTopBtn.hidden = false;
            scrollTopBtn.classList.add('scroll-top--visible');
        } else if (scrollTopBtn) {
            scrollTopBtn.classList.remove('scroll-top--visible');
            scrollTopBtn.hidden = true;
        }
    });
}

window.addEventListener('load', () => {
    
    initThreeJS();
    
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent || '';
        if (!prefersReducedMotion && originalText) {
            typeWriter(heroTitle, originalText, 80);
        }
    }
    
    init3DCards();
    initParallax();
    initInteractiveParticles();

    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});

function addGlitchEffect() {
    const titles = document.querySelectorAll('h1, h2');
    titles.forEach(title => {
        title.addEventListener('mouseenter', function() {
            this.style.textShadow = `
                2px 0 #ff0000,
                -2px 0 #6a0dad,
                0 2px #ff0000,
                0 -2px #6a0dad
            `;
        });
        
        title.addEventListener('mouseleave', function() {
            this.style.textShadow = '0 0 15px rgba(255, 0, 0, 0.5)';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initRevealAnimations();
    addGlitchEffect();
    document.addEventListener('visibilitychange', () => {
        if (!renderer) return;
        if (document.hidden) stopThreeLoop();
        else startThreeLoop();
    });
});