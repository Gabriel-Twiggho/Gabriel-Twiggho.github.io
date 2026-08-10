const VALID_PAGES = [
    'home',
    'swarm-tracking',
    'task-scheduling',
    'co2-prediction',
    'ai-robot',
    'portable-vacuum-chamber'
];

const LEGACY_PAGE_ALIASES = {
    project1: 'swarm-tracking',
    project2: 'task-scheduling',
    project3: 'co2-prediction',
    project4: 'ai-robot'
};

const DARK_PAGES = new Set(['swarm-tracking', 'ai-robot']);

function canonicalPageId(pageId) {
    return LEGACY_PAGE_ALIASES[pageId] || pageId;
}

// Only play media on the visible page so duplicate project previews do not
// download and decode at the same time.
function syncPageVideos(activePage) {
    document.querySelectorAll('.page video').forEach(video => {
        if (video.closest('.page') !== activePage) {
            video.pause();
            return;
        }

        const playRequest = video.play();
        if (playRequest) playRequest.catch(() => {});
    });
}

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
    // Resolve old numbered links before validating the canonical route.
    pageId = canonicalPageId(pageId);
    if (!VALID_PAGES.includes(pageId)) {
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
    syncPageVideos(targetPage);
    
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
    if (DARK_PAGES.has(pageId)) {
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
    const requestedHash = window.location.hash.slice(1);
    const pageId = canonicalPageId(requestedHash);

    // Ignore section-level hashes and only handle known page routes.
    if (requestedHash && VALID_PAGES.includes(pageId)) {
        showPage(pageId, false);

        // Keep legacy bookmarks working while exposing the descriptive URL.
        if (requestedHash !== pageId) {
            window.history.replaceState(null, '', '#' + pageId);
        }
    }
}

// Check for hash on page load
window.addEventListener('DOMContentLoaded', function() {
    handleHashChange();

    const activePage = document.querySelector('.page.active');
    if (activePage) syncPageVideos(activePage);
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

// Reveal the vacuum-chamber workflow in sequence as it enters the viewport.
document.addEventListener('DOMContentLoaded', function() {
    const workflow = document.querySelector('.vacuum-workflow');
    if (!workflow || !('IntersectionObserver' in window)) return;

    const stages = workflow.querySelectorAll('.vacuum-workflow-stage');
    workflow.classList.add('reveal-ready');

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
    });

    stages.forEach((stage, index) => {
        stage.style.setProperty('--stage-index', index);
        observer.observe(stage);
    });
});

// Shared full-screen viewer for images on every project detail page.
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('image-lightbox');
    if (!lightbox) return;

    const lightboxImage = document.getElementById('image-lightbox-image');
    const lightboxCaption = document.getElementById('image-lightbox-caption');
    const closeButton = lightbox.querySelector('.image-lightbox-close');
    const projectImages = document.querySelectorAll('.project-page img');
    let lastTrigger = null;

    function getImageCaption(sourceImage) {
        const imageContainer = sourceImage.closest('.project-media, figure');
        const caption = imageContainer?.querySelector('.project-caption, figcaption');

        return caption?.textContent.trim() || sourceImage.alt;
    }

    function openLightbox(sourceImage) {
        const imageSource = sourceImage.currentSrc || sourceImage.src;
        if (lightboxImage.src !== imageSource) lightboxImage.src = imageSource;
        lightboxImage.alt = sourceImage.alt;
        lightboxCaption.textContent = getImageCaption(sourceImage);
        lastTrigger = sourceImage;
        lightbox.showModal();
    }

    projectImages.forEach(image => {
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-haspopup', 'dialog');
        image.setAttribute('aria-label', `View ${image.alt} full screen`);

        image.addEventListener('click', function() {
            openLightbox(image);
        });

        image.addEventListener('keydown', function(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openLightbox(image);
        });
    });

    closeButton.addEventListener('click', function() {
        lightbox.close();
    });

    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener('close', function() {
        if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
    });
});
