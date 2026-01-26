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
