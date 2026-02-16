function createShapeTexture(type) {
    const canvas = document.createElement('canvas');
    const size = 128; // Higher res for clear shapes
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Core Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#D4AF37";

    const cx = size / 2;
    const cy = size / 2;

    if (type === 'lantern') {
        // Lantern Body
        ctx.fillStyle = "#FFD700";

        // Top loop
        ctx.beginPath();
        ctx.arc(cx, cy - 25, 4, 0, Math.PI * 2);
        ctx.fill();

        // Dome
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 20);
        ctx.quadraticCurveTo(cx, cy - 35, cx + 10, cy - 20);
        ctx.fill();

        // Main Housing (Rectangle)
        ctx.fillRect(cx - 12, cy - 20, 24, 35);

        // Bottom Point
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy + 15);
        ctx.lineTo(cx, cy + 30);
        ctx.lineTo(cx + 12, cy + 15);
        ctx.fill();

        // Inner Glow (Window)
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#FFF";
        ctx.globalAlpha = 0.8;
        ctx.fillRect(cx - 6, cy - 10, 12, 20);

    } else if (type === 'moon') {
        ctx.fillStyle = "#F4E4BC";
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2, false);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx + 15, cy - 8, 25, 0, Math.PI * 2, false);
        ctx.fill();
    } else if (type === 'star') {
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        const outerRadius = 20;
        const innerRadius = 5;
        for (let i = 0; i < 8; i++) {
            let angle = (i * Math.PI) / 4;
            let radius = (i % 2 === 0) ? outerRadius : innerRadius;
            let x = cx + Math.cos(angle) * radius;
            let y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

// --- 2. THREE.JS SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Mobile optimization: Camera distance
const isMobile = window.innerWidth < 768;
camera.position.z = isMobile ? 6 : 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

const particlesGroup = new THREE.Group();
scene.add(particlesGroup);

// -- Particle Generators --
// Now using unified counts for all devices as requested
function addParticles(type, count, size, speedY) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count); // Individual speeds

    for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 20;   // Spread Width (Uniform)
        pos[i + 1] = (Math.random() - 0.5) * 20; // Spread Height (Uniform)
        pos[i + 2] = (Math.random() - 0.5) * 10; // Depth

        speeds[i / 3] = Math.random() * 0.5 + 0.5; // Random speed factor
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.PointsMaterial({
        size: size,
        map: createShapeTexture(type),
        transparent: true,
        opacity: type === 'lantern' ? 0.9 : 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geo, mat);
    points.userData = { speedY: speedY, type: type }; // Store speed data
    particlesGroup.add(points);
    return points;
}

// --- UNIFIED HIGH COUNTS ---
// Same count for desktop and mobile
const lanternCount = 40;
const starCount = 450;
const moonCount = 15;

const lanterns = addParticles('lantern', lanternCount, isMobile ? 0.5 : 0.4, 0.005);
const stars = addParticles('star', starCount, 0.15, 0); // Stars don't float up
const moons = addParticles('moon', moonCount, 0.6, 0.002);

// --- 3. ANIMATION LOOP ---
const clock = new THREE.Clock();
let mouseY = 0;
let mouseX = 0;

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });
}

function animate() {
    const time = clock.getElapsedTime();

    // General rotation
    particlesGroup.rotation.y = time * 0.03;
    if (!isMobile) {
        particlesGroup.rotation.x = mouseY * 0.1;
    }

    // Lanterns Float Up logic
    [lanterns, moons].forEach(pSystem => {
        const positions = pSystem.geometry.attributes.position.array;
        const speeds = pSystem.geometry.attributes.aSpeed.array;
        const baseSpeed = pSystem.userData.speedY;

        for (let i = 1; i < positions.length; i += 3) {
            // Move Y up based on baseSpeed * individual random speed
            positions[i] += baseSpeed * speeds[(i - 1) / 3];

            // Reset if it goes off top of screen
            if (positions[i] > 10) {
                positions[i] = -10;
                // Randomize X again for variety
                positions[i - 1] = (Math.random() - 0.5) * 20;
            }
        }
        pSystem.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth < 768;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 4. LENIS SMOOTH SCROLL + GSAP ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
});

window.lenis = lenis;

// --- Smooth Scroll for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            lenis.scrollTo(targetElement);
        }
    });
});

gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// --- Hero Load Animation ---
const heroTl = gsap.timeline({ defaults: { ease: "power3.out", overwrite: "auto" } });

heroTl
    // Tagline slides down
    .to(".hero-tagline", { opacity: 1, y: 0, duration: 1 }, 0.3)
    // Main heading fades in with slight scale
    .fromTo(".hero h1",
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.4 }, 0.5)
    // Subtitle slides up
    .to(".hero-subtitle", { opacity: 1, y: 0, duration: 1 }, 1.0)
    // Glass box slides up
    .to(".hero-glass-box", { opacity: 1, y: 0, duration: 1.2 }, 1.2)
    // Scroll hint fades in last
    .to(".hero-scroll-hint", { opacity: 1, duration: 1 }, 1.8);

// --- Hero Scroll-Away: Heading scales up, everything fades out ---
gsap.timeline({
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
    }
})
    .to(".hero h1", { scale: isMobile ? 1.2 : 1.6, opacity: 0, y: -60, duration: 1 }, 0)
    .to(".hero-tagline", { opacity: 0, y: -30, duration: 0.6 }, 0)
    .to(".hero-subtitle", { opacity: 0, y: -20, duration: 0.6 }, 0.1)
    .to(".hero-glass-box", { opacity: 0, y: 40, duration: 0.8 }, 0.1)
    .to(".hero-scroll-hint", { opacity: 0, duration: 0.4 }, 0);

// Sequence — Scroll-Driven Ramadan Visuals
const seqTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".sequence-wrapper",
        start: "top top",
        end: "+=2500",
        scrub: 1,
        pin: true
    }
});

// ===== PHASE 1: REFLECTION =====
seqTl
    // Glow fades in
    .to(".seq-glow", { opacity: 1, scale: 1, duration: 0.5 }, 0)
    // Crescent rises in from bottom-right
    .fromTo(".seq-crescent",
        { y: 80, x: 60, rotation: -30, opacity: 0, scale: 0.6 },
        { y: -20, x: 40, rotation: 0, opacity: 0.8, scale: 1, duration: 1.2 }, 0)
    // First ring expands
    .to(".seq-ring-1", { opacity: 0.25, scale: 1.2, duration: 1 }, 0)
    // First batch of stars twinkle in
    .to(".s1", { opacity: 0.6, y: -8, duration: 0.6 }, 0.2)
    .to(".s2", { opacity: 0.5, y: -5, duration: 0.6 }, 0.3)
    .to(".s7", { opacity: 0.4, y: -10, duration: 0.6 }, 0.4)
    // Side lines begin to extend
    .to(".seq-line-left", { opacity: 0.3, width: "18%", duration: 0.8 }, 0.3)
    .to(".seq-line-right", { opacity: 0.3, width: "18%", duration: 0.8 }, 0.3)
    // Text: REFLECTION
    .to(".p1", { opacity: 1, scale: 1.05, duration: 1 }, 0.1)
    .to(".p1", { opacity: 0, scale: 1.15, duration: 0.8 }, 1.3)

    // ===== PHASE 2: GATHERING =====
    // Glow pulses larger
    .to(".seq-glow", { scale: 1.4, opacity: 0.8, duration: 1 }, 1.5)
    // Crescent shifts position
    .to(".seq-crescent", { y: -50, x: -30, rotation: 15, scale: 1.1, duration: 1.2 }, 1.5)
    // Second ring expands
    .to(".seq-ring-2", { opacity: 0.2, scale: 1.1, duration: 1 }, 1.5)
    // More stars appear
    .to(".s3", { opacity: 0.6, y: -12, duration: 0.5 }, 1.6)
    .to(".s4", { opacity: 0.5, y: 8, duration: 0.5 }, 1.7)
    .to(".s6", { opacity: 0.4, y: -6, duration: 0.5 }, 1.8)
    .to(".s8", { opacity: 0.5, y: 10, duration: 0.5 }, 1.9)
    // Lines grow longer
    .to(".seq-line-left", { opacity: 0.5, width: "28%", duration: 0.8 }, 1.6)
    .to(".seq-line-right", { opacity: 0.5, width: "28%", duration: 0.8 }, 1.6)
    // Text: GATHERING
    .to(".p2", { opacity: 1, scale: 1.05, duration: 1 }, 1.6)
    .to(".p2", { opacity: 0, scale: 1.15, duration: 0.8 }, 2.8)

    // ===== PHASE 3: CELEBRATION =====
    // Glow intensifies
    .to(".seq-glow", { scale: 2, opacity: 1, duration: 1 }, 3)
    // Crescent reaches top, glows brighter
    .to(".seq-crescent", { y: -80, x: 0, rotation: 0, scale: 1.3, opacity: 1, duration: 1.2 }, 3)
    // All rings expand fully
    .to(".seq-ring-1", { opacity: 0.15, scale: 1.8, duration: 1 }, 3)
    .to(".seq-ring-2", { opacity: 0.12, scale: 1.5, duration: 1 }, 3)
    .to(".seq-ring-3", { opacity: 0.1, scale: 1.2, duration: 1 }, 3)
    // All remaining stars burst in
    .to(".s5", { opacity: 0.7, y: -15, duration: 0.4 }, 3.1)
    .to(".s9", { opacity: 0.6, y: -8, duration: 0.4 }, 3.2)
    .to(".s10", { opacity: 0.5, y: 12, duration: 0.4 }, 3.3)
    // Lines at full length
    .to(".seq-line-left", { opacity: 0.7, width: "35%", duration: 0.8 }, 3.1)
    .to(".seq-line-right", { opacity: 0.7, width: "35%", duration: 0.8 }, 3.1)
    // Text: CELEBRATION
    .to(".p3", { opacity: 1, scale: 1.1, duration: 1.2 }, 3.2);

// --- Service Cards: Scroll Entrance ---
gsap.to(".service-card", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".services",
        start: "top 80%",
    }
});

// --- Card Details: Letter-by-letter scroll reveal ---
// Split detail text into individual character spans
document.querySelectorAll('.card-detail').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map(ch =>
        ch === ' ' ? '<span class="detail-char">&nbsp;</span>'
            : `<span class="detail-char">${ch}</span>`
    ).join('');
});

// Scrub-based character reveal per card
document.querySelectorAll('.service-card').forEach(card => {
    const chars = card.querySelectorAll('.detail-char');
    const cta = card.querySelector('.card-cta');

    gsap.to(chars, {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
            trigger: card,
            start: "top 65%",
            end: "top 25%",
            scrub: true,
        }
    });

    gsap.to(cta, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
            trigger: card,
            start: "top 30%",
        }
    });
});

// --- Works Swiper Carousel ---
const worksSwiper = new Swiper('.works-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    grabCursor: true,
    autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    effect: 'coverflow',
    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 120,
        modifier: 1.5,
        slideShadows: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
            spaceBetween: 30,
        }
    }
});

// --- Calendar Date Picker Logic ---
const calendarDays = document.querySelectorAll('.calendar-day:not(.booked)');
const dateInput = document.getElementById('ramadan-date');

// Function to load bookings from LocalStorage (Personal Persistence)
function loadMyBookings() {
    const savedBookings = JSON.parse(localStorage.getItem('festaBookings') || '[]');
    document.querySelectorAll('.calendar-day').forEach(day => {
        const val = day.getAttribute('data-val');
        if (savedBookings.includes(val)) {
            day.classList.add('booked');
            day.classList.remove('selected');
        }
    });
}
// Load immediately
loadMyBookings();

calendarDays.forEach(day => {
    day.addEventListener('click', () => {
        if (day.classList.contains('booked')) return;

        // Remove active class from all
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));

        // Add active class to clicked
        day.classList.add('selected');

        // Update hidden input
        dateInput.value = day.getAttribute('data-val');
    });
});

// --- Booking Form → WhatsApp ---
document.getElementById('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('guest-name').value.trim();
    const guests = document.getElementById('guest-count').value;
    const date = document.getElementById('ramadan-date').value;
    const venue = document.querySelector('input[name="venue"]:checked');

    if (!name || !guests || !date || !venue) {
        alert('Please fill in all fields.');
        return;
    }

    // Save this booking locally
    const savedBookings = JSON.parse(localStorage.getItem('festaBookings') || '[]');
    if (!savedBookings.includes(date)) {
        savedBookings.push(date);
        localStorage.setItem('festaBookings', JSON.stringify(savedBookings));
        // Update UI
        loadMyBookings();
    }

    const message = `*Festa Ramadan Booking*

*Guest Name:* ${name}
*Party Size:* ${guests} guests
*Date:* ${date}
*Venue:* ${venue.value}

I'd like to reserve this experience. Please confirm availability.`;

    const phone = '918921479100';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});
