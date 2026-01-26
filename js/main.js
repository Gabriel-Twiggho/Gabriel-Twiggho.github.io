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
