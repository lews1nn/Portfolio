let scene, camera, renderer, particles, mouseX = 0, mouseY = 0;

function initThreeJS() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const canvas = document.getElementById('bg3d');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    createParticles();
    
    addLights();
    
    animate();
}

function createParticles() {
    const particleCount = 1000;
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

function animate() {
    requestAnimationFrame(animate);
    
    if (particles) {
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.002;
        
        particles.rotation.x += mouseY * 0.0001;
        particles.rotation.y += mouseX * 0.0001;
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) translateZ(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.section, .project-card, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) translateZ(-50px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
});

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function init3DCards() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}

function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-content, .section');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px) translateZ(${index * 10}px)`;
        });
    });
}

function initInteractiveParticles() {
    document.addEventListener('mousemove', (e) => {
        const particles = document.querySelectorAll('.skill-tag');
        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const distance = Math.sqrt(x * x + y * y);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.style.transform = `translateZ(${force * 20}px) scale(${1 + force * 0.1})`;
            } else {
                particle.style.transform = 'translateZ(0px) scale(1)';
            }
        });
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 500) {
        if (!document.querySelector('.scroll-top')) {
            const scrollTopBtn = document.createElement('button');
            scrollTopBtn.className = 'scroll-top';
            scrollTopBtn.innerHTML = '↑';
            scrollTopBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ff0000, #6a0dad);
                color: white;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
                backdrop-filter: blur(10px);
            `;
            
            scrollTopBtn.addEventListener('click', scrollToTop);
            scrollTopBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1) translateZ(10px)';
            });
            scrollTopBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) translateZ(0px)';
            });
            
            document.body.appendChild(scrollTopBtn);
        }
    } else {
        const scrollTopBtn = document.querySelector('.scroll-top');
        if (scrollTopBtn) {
            scrollTopBtn.remove();
        }
    }
});

window.addEventListener('load', () => {
    
    initThreeJS();
    
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
    
    init3DCards();
    initParallax();
    initInteractiveParticles();
    
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
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

document.addEventListener('DOMContentLoaded', addGlitchEffect);