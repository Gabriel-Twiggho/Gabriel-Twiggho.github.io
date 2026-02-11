// Easter egg: Click logo 5 times to go to LEGO
(function() {
    let clickCount = 0;
    let clickTimer = null;
    const logo = document.getElementById('logo-easter-egg');
    
    logo.addEventListener('click', function(e) {
        clickCount++;
        
        // Reset timer on each click
        clearTimeout(clickTimer);
        clickTimer = setTimeout(function() {
            clickCount = 0;
        }, 1500); // Reset after 1.5 seconds of no clicks
        
        if (clickCount >= 5) {
            e.preventDefault();
            window.location.href = 'https://www.lego.com';
        }
    });
})();

// Show page function - handles navigation between pages
function showPage(pageId, updateHash = true) {
    // Validate pageId
    const validPages = ['home', 'project1', 'project2', 'project3', 'project4'];
    if (!validPages.includes(pageId)) {
        pageId = 'home';
    }
    
    // Hide all pages and reset animations
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.remove('animate');
    });
    
    // Remove active from all nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    targetPage.classList.add('active');
    
    // Trigger animation restart with a tiny delay
    requestAnimationFrame(() => {
        targetPage.classList.add('animate');
    });
    
    // Set active nav link
    if (pageId === 'home') {
        document.getElementById('nav-home').classList.add('active');
    } else {
        // For project pages, mark both the dropdown trigger and the specific project
        document.getElementById('nav-projects').classList.add('active');
        document.getElementById('nav-' + pageId).classList.add('active');
    }
    
    // Toggle dark mode for body based on page
    if (pageId === 'project1' || pageId === 'project4') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Update URL hash (so users can share/bookmark direct links)
    if (updateHash) {
        window.location.hash = pageId;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle direct links via URL hash
function handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    // Only handle page-level hashes (home, project1, etc), not section hashes
    const validPages = ['home', 'project1', 'project2', 'project3', 'project4'];
    if (hash && validPages.includes(hash)) {
        showPage(hash, false);
    }
}

// Check for hash on page load
window.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.slice(1);
    const validPages = ['home', 'project1', 'project2', 'project3', 'project4'];
    if (hash && validPages.includes(hash)) {
        showPage(hash, false);
    }
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', handleHashChange);

// Scroll indicator click handler
document.addEventListener('DOMContentLoaded', function() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const projectsSection = document.querySelector('.home-projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Home page: full-page canvas waves (horizontal at every Y), animated + cursor jitter
(function() {
    const home = document.getElementById('home');
    const canvas = document.getElementById('home-wave-canvas');
    if (!home || !canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let waveStartY = 0;
    let phase = 0;
    let mouseX = -1000, mouseY = -1000;
    let jitter = 0;
    let jitterPhase = 0;
    const jitterRadius = 180;
    const jitterStrength = 3;
    const waveSpacing = 38;
    const bandHeight = 32;
    const amplitude = 12;
    const wavelength = 100;
    const freq = (2 * Math.PI) / wavelength;
    const green = '74, 222, 128';

    function sizeCanvas() {
        const rect = home.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
        var scrollIndicator = home.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            var siRect = scrollIndicator.getBoundingClientRect();
            waveStartY = siRect.top - rect.top;
        } else {
            waveStartY = height * 0.52;
        }
    }

    function getHomeCoords(e) {
        const rect = home.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    home.addEventListener('mousemove', function(e) {
        const { x, y } = getHomeCoords(e);
        mouseX = x;
        mouseY = y;
        jitter = Math.min(1, jitter + 0.08);
    });

    home.addEventListener('mouseleave', function() {
        mouseX = -1000;
        mouseY = -1000;
    });

    function draw() {
        if (!home.classList.contains('active')) {
            requestAnimationFrame(draw);
            return;
        }
        if (width === 0 || height === 0) sizeCanvas();

        phase += 0.02;
        jitterPhase += 0.15;
        if (jitter > 0) jitter = Math.max(0, jitter - 0.012);

        ctx.clearRect(0, 0, width, height);

        const numWaves = Math.ceil((height - waveStartY) / waveSpacing) + 2;
        const step = 3;
        for (let row = 0; row < numWaves; row++) {
            const baseY = waveStartY + row * waveSpacing;
            if (baseY + bandHeight < waveStartY) continue;
            const opacity = 0.06 + 0.08 * (0.3 + 0.7 * Math.sin(row * 0.7));
            ctx.beginPath();
            var topPoints = [];
            var botPoints = [];
            for (let x = 0; x <= width + step; x += step) {
                let yTop = baseY + amplitude * Math.sin(x * freq + phase + row * 0.4);
                let yBot = baseY + bandHeight + amplitude * Math.sin(x * freq + phase + row * 0.4);
                const dx = x - mouseX, dyMid = (yTop + yBot) / 2 - mouseY;
                const dist = Math.sqrt(dx * dx + dyMid * dyMid);
                if (dist < jitterRadius && jitter > 0) {
                    const falloff = 1 - dist / jitterRadius;
                    const jitterOffset = jitter * jitterStrength * falloff * Math.sin(jitterPhase + x * 0.02) * (1 + 0.5 * Math.sin(row));
                    yTop += jitterOffset;
                    yBot += jitterOffset;
                }
                topPoints.push({ x: x, y: yTop });
                botPoints.push({ x: x, y: yBot });
            }
            ctx.moveTo(topPoints[0].x, topPoints[0].y);
            for (var i = 1; i < topPoints.length; i++) ctx.lineTo(topPoints[i].x, topPoints[i].y);
            for (var i = botPoints.length - 1; i >= 0; i--) ctx.lineTo(botPoints[i].x, botPoints[i].y);
            ctx.closePath();
            ctx.fillStyle = `rgba(${green}, ${opacity})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    requestAnimationFrame(draw);
})();

// Project sidebar navigation
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for sidebar links
    document.querySelectorAll('.project-nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const navHeight = 48; // Height of top nav
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll spy for sidebar
    function updateSidebarActive() {
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;

        const nav = activePage.querySelector('.project-nav');
        if (!nav) return;

        const navItems = nav.querySelectorAll('.project-nav-item');
        const sections = [];
        
        navItems.forEach(item => {
            const sectionId = item.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                sections.push({ id: sectionId, element: section, navItem: item });
            }
        });

        if (sections.length === 0) return;

        const scrollPosition = window.scrollY + 150; // Offset for better detection
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Check if we're at the bottom of the page
        const isAtBottom = (window.scrollY + windowHeight) >= (documentHeight - 100);

        // If at bottom, activate the last section
        if (isAtBottom && sections.length > 0) {
            navItems.forEach(item => item.classList.remove('active'));
            sections[sections.length - 1].navItem.classList.add('active');
            return;
        }

        // Find the current section
        let currentSection = sections[0];
        for (let i = sections.length - 1; i >= 0; i--) {
            if (sections[i].element.offsetTop <= scrollPosition) {
                currentSection = sections[i];
                break;
            }
        }

        // Update active states
        navItems.forEach(item => item.classList.remove('active'));
        currentSection.navItem.classList.add('active');
    }

    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(function() {
            updateSidebarActive();
            scrollTimeout = null;
        }, 50);
    });

    // Initial update
    updateSidebarActive();
});
