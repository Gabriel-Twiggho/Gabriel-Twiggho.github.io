const VALID_PAGES = [
    'home',
    'swarm-tracking',
    'task-scheduling',
    'co2-prediction',
    'ai-robot',
    'portable-vacuum-chamber',
    'thermal-vacuum-control',
    'search-and-rescue',
    'pid-processor-hackathon'
];

const LEGACY_PAGE_ALIASES = {
    project1: 'swarm-tracking',
    project2: 'task-scheduling',
    project3: 'co2-prediction',
    project4: 'ai-robot'
};

const DARK_PAGES = new Set(['swarm-tracking', 'ai-robot', 'search-and-rescue']);
// Draft projects remain editable on local previews but are hidden and
// unroutable on the published site until removed from this set.
const DRAFT_PAGES = new Set();
const SHOW_DRAFT_PAGES = (
    window.location.protocol === 'file:' ||
    ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
);
let updateTvacArchitectureScroll = function() {};
let syncSarShowcase = function() {};

function canonicalPageId(pageId) {
    return LEGACY_PAGE_ALIASES[pageId] || pageId;
}

function isPageAvailable(pageId) {
    return VALID_PAGES.includes(pageId) && (
        SHOW_DRAFT_PAGES || !DRAFT_PAGES.has(pageId)
    );
}

function syncDraftProjectVisibility() {
    document.querySelectorAll('[data-draft-project]').forEach(element => {
        const pageId = element.getAttribute('data-draft-project');
        const isLocalPreviewEntry = element.hasAttribute('data-draft-local-preview');
        element.hidden = DRAFT_PAGES.has(pageId) && (
            !SHOW_DRAFT_PAGES || !isLocalPreviewEntry
        );
    });
}

// Only play media on the visible page so duplicate project previews do not
// download and decode at the same time.
function syncPageVideos(activePage) {
    document.querySelectorAll('.page video').forEach(video => {
        if (video.closest('.page') !== activePage) {
            video.pause();
            return;
        }

        if (video.hasAttribute('data-page-video')) {
            const playRequest = video.play();
            if (playRequest) playRequest.catch(() => {});
        }
    });
}

// Some local static servers ignore HTTP range requests, which prevents the
// browser from seeking through an otherwise valid MP4. Probe range support
// when the page opens; if it is unavailable, use the downloaded file as a
// Blob URL so the native player can scrub freely.
function prepareSeekableVideos(activePage) {
    activePage.querySelectorAll('video[data-seekable-video]').forEach(video => {
        if (video.dataset.seekState) return;

        const source = video.querySelector('source');
        if (!source) return;

        video.dataset.seekState = 'loading';
        fetch(source.src, { headers: { Range: 'bytes=0-1' } })
            .then(response => {
                if (response.status === 206) {
                    if (response.body) response.body.cancel();
                    video.dataset.seekState = 'native';
                    return null;
                }

                if (!response.ok) {
                    throw new Error('Unable to prepare seekable video.');
                }

                return response.blob();
            })
            .then(blob => {
                if (!blob) return;

                const objectUrl = URL.createObjectURL(blob);
                video.dataset.seekObjectUrl = objectUrl;
                video.src = objectUrl;
                video.load();
                video.dataset.seekState = 'blob';
            })
            .catch(() => {
                video.preload = 'auto';
                video.load();
                video.dataset.seekState = 'fallback';
            });
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
    if (!isPageAvailable(pageId)) {
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
    prepareSeekableVideos(targetPage);
    
    // Trigger animation restart with a tiny delay
    requestAnimationFrame(() => {
        targetPage.classList.add('animate');
        updateTvacArchitectureScroll();
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
    syncSarShowcase(targetPage);
}

// Handle direct links via URL hash
function handleHashChange() {
    const requestedHash = window.location.hash.slice(1);
    const pageId = canonicalPageId(requestedHash);

    // Ignore section-level hashes and only handle known page routes.
    if (requestedHash && isPageAvailable(pageId)) {
        showPage(pageId, false);

        // Keep legacy bookmarks working while exposing the descriptive URL.
        if (requestedHash !== pageId) {
            window.history.replaceState(null, '', '#' + pageId);
        }
    } else if (requestedHash && DRAFT_PAGES.has(pageId)) {
        showPage('home', false);
        window.history.replaceState(null, '', '#home');
    }
}

// Check for hash on page load
window.addEventListener('DOMContentLoaded', function() {
    syncDraftProjectVisibility();
    handleHashChange();

    const activePage = document.querySelector('.page.active');
    if (activePage) syncPageVideos(activePage);
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', handleHashChange);

// Play the ROSbot entrance once per visit, with callouts following the footage.
document.addEventListener('DOMContentLoaded', function() {
    const showcase = document.querySelector('[data-sar-showcase]');
    if (!showcase) return;

    const page = showcase.closest('.page');
    const video = showcase.querySelector('video');
    const scene = showcase.querySelector('.sar-robot-scene');
    const labels = showcase.querySelector('.sar-sensor-labels');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sensorDetails = {
        camera: ['01 / Perception', 'The RGB camera identifies potential victims. Depth estimates their distance so the rover can approach and confirm them on the ground.'],
        lidar: ['02 / Local mapping', 'The rotating LiDAR measures surrounding geometry for local occupancy mapping and obstacle awareness. When the rover tilts, unreliable scans are paused.'],
        proximity: ['03 / Close-range safety', 'Four infrared distance sensors sit around the chassis: two facing forward and two facing back. Alongside depth sensing, they flag nearby obstacles for the safety layer.'],
        imu: ['04 / Orientation & terrain', 'The IMU is inside the chassis. The controller uses its accelerometer and gyroscope for tilt awareness, while compass heading combines with wheel travel to estimate the rover pose.'],
        odometry: ['05 / Motion estimation', 'Position sensors at the four wheels measure rotation. The final controller combines encoder-derived travel with compass heading to estimate position. A calibrated skid-steer model translates motion commands into wheel speeds.']
    };
    // Chassis translation measured from the 60 fps entrance, in the SVG's
    // 1000 × 416.667 coordinate space. Interpolate against video media time
    // so callouts stay aligned when playback pauses or frames are dropped.
    const motionTrack = [
        [0, 210, -0.83], [0.2, 196.67, -0.83], [0.4, 183.33, -0.83],
        [0.6, 166.67, 0], [0.8, 156.67, 1.67], [1, 146.67, 1.67],
        [1.2, 133.33, 2.5], [1.4, 123.33, 2.5], [1.6, 116.67, 2.5],
        [1.8, 106.67, 2.5], [2, 98.33, 2.5], [2.2, 88.33, 1.67],
        [2.4, 80, 1.67], [2.6, 71.67, 0.83], [2.8, 58.33, 0.83],
        [3, 51.67, 0.83], [3.2, 48.33, 0.83], [3.4, 41.67, 0.83],
        [3.6, 36.67, -0.83], [3.8, 31.67, -0.83], [4, 25, -0.83],
        [4.2, 21.67, -0.83], [4.4, 16.67, -0.83], [4.6, 11.67, -0.83],
        [4.8, 8.33, -0.83], [5, 6.67, 0], [5.2, 3.33, 0],
        [5.4, 1.67, 0], [5.6, 1.67, 0], [5.8, 0, 0]
    ];
    const sensorAnchors = {
        camera: [580, 55, 240, 60],
        lidar: [555, 134, 785, 65],
        proximity: [451, 217, 240, 285],
        imu: [644, 205, 785, 205],
        odometry: [613, 267, 785, 340]
    };
    const sensors = Array.from(showcase.querySelectorAll('[data-sar-sensor]'), function(button) {
        const line = showcase.querySelector('[data-sar-line="' + button.dataset.sarSensor + '"]');
        return { button, line, path: line.querySelector('path'), point: line.querySelector('circle'), anchor: sensorAnchors[button.dataset.sarSensor] };
    });
    let active = false;
    let inView = false;
    let attempted = false;
    let playing = false;
    let playRequest = 0;
    let frameHandle = null;

    // Measure the text, not the full-width button, so leaders meet the labels.
    function updateLabelAnchors() {
        if (!active || window.matchMedia('(max-width: 768px)').matches) return;
        const sceneBounds = scene.getBoundingClientRect();
        if (!sceneBounds.width || !sceneBounds.height) return;
        sensors.forEach(function(sensor) {
            const title = sensor.button.querySelector('strong').getBoundingClientRect();
            const text = sensor.button.lastElementChild.getBoundingClientRect();
            const button = sensor.button.getBoundingClientRect();
            const leftSide = sensor.anchor[2] < 500;
            const edge = leftSide ? text.right + 12 : button.left - 12;
            sensor.labelAnchor = [
                (edge - sceneBounds.left) * 1000 / sceneBounds.width,
                (title.top + title.height / 2 - sceneBounds.top) * 416.667 / sceneBounds.height
            ];
        });
        updateSensors(video.currentTime, !playing);
    }

    function updateSensors(time, settled = false) {
        let offsetX = 0;
        let offsetY = 0;
        if (!settled) {
            const next = motionTrack.findIndex(function(frame) { return frame[0] > time; });
            if (next > 0) {
                const from = motionTrack[next - 1];
                const to = motionTrack[next];
                const progress = (time - from[0]) / (to[0] - from[0]);
                offsetX = from[1] + (to[1] - from[1]) * progress;
                offsetY = from[2] + (to[2] - from[2]) * progress;
            }
        }
        sensors.forEach(function(sensor, index) {
            const [baseX, baseY] = sensor.anchor;
            const [labelX, labelY] = sensor.labelAnchor || sensor.anchor.slice(2);
            const x = baseX + offsetX;
            const y = baseY + offsetY;
            const progress = settled ? 1 : Math.min(1, Math.max(0, (time - 0.75 - index * 0.13) / 0.7));
            const opacity = progress * progress * (3 - 2 * progress);
            sensor.point.setAttribute('cx', x.toFixed(2));
            sensor.point.setAttribute('cy', y.toFixed(2));
            sensor.path.setAttribute('d', sensor.anchor[2] < 500
                ? `M${labelX} ${labelY}H${labelX + 36}L${x - 24} ${y}H${x - 5}`
                : `M${labelX} ${labelY}H${labelX - 25}L${x + 24} ${y}H${x + 12}`);
            sensor.line.style.setProperty('--sar-reveal', opacity.toFixed(3));
            sensor.button.style.setProperty('--sar-reveal', opacity.toFixed(3));
            sensor.button.disabled = opacity < 0.95;
        });
    }

    function stopTracking() {
        if (frameHandle === null) return;
        if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameHandle);
        else window.cancelAnimationFrame(frameHandle);
        frameHandle = null;
    }

    function trackFrame() {
        if (frameHandle !== null || !playing || video.paused) return;
        if (video.requestVideoFrameCallback) {
            frameHandle = video.requestVideoFrameCallback(function(now, metadata) {
                frameHandle = null;
                updateSensors(metadata.mediaTime);
                trackFrame();
            });
        } else {
            frameHandle = window.requestAnimationFrame(function() {
                frameHandle = null;
                updateSensors(video.currentTime);
                trackFrame();
            });
        }
    }

    function showSensors() {
        playRequest++;
        playing = false;
        stopTracking();
        video.pause();
        showcase.classList.remove('is-playing', 'is-loading');
        showcase.classList.add('is-ready');
        updateSensors(0, true);
        labels.inert = false;
    }

    function playEntrance() {
        if (!active || document.hidden || playing) return;
        attempted = true;
        playing = true;
        const request = ++playRequest;
        if (!video.getAttribute('src')) video.src = video.dataset.src;
        video.currentTime = 0;
        video.muted = true;
        showcase.classList.remove('is-ready');
        showcase.classList.add('is-loading');
        updateSensors(0);
        video.play().then(function() {
            if (request !== playRequest || !active) return;
            if (!inView || document.hidden) {
                video.pause();
                return;
            }
        }).catch(function(error) {
            // Scrolling or route changes can pause a pending play request.
            // Keep that entrance resumable instead of treating it as a failure.
            if (error.name !== 'AbortError' && request === playRequest) showSensors();
        });
    }

    function updatePlayback() {
        if (!active || !inView || document.hidden) {
            stopTracking();
            video.pause();
        } else if (playing) {
            const request = playRequest;
            video.play().catch(function(error) {
                if (error.name !== 'AbortError' && request === playRequest && playing && active) showSensors();
            });
        } else if (!attempted && !reducedMotion.matches) {
            playEntrance();
        }
    }

    syncSarShowcase = function(activePage) {
        const entering = activePage === page;
        if (entering === active) return;
        active = entering;
        if (active) attempted = false;
        showSensors();
        if (active) {
            updateLabelAnchors();
            // Discard visibility left over from the previous route. The observer
            // will also update this after the new page has finished laying out.
            const bounds = scene.getBoundingClientRect();
            inView = bounds.width > 0 && bounds.bottom > 48 && bounds.top < window.innerHeight;
            updatePlayback();
        }
    };

    new IntersectionObserver(function(entries) {
        inView = entries[0].isIntersecting;
        updatePlayback();
    }, { threshold: 0.25 }).observe(scene);

    new ResizeObserver(updateLabelAnchors).observe(scene);
    document.fonts.ready.then(updateLabelAnchors);

    video.addEventListener('playing', function() {
        if (!playing || !active || !inView || document.hidden) {
            video.pause();
            return;
        }
        showcase.classList.remove('is-ready', 'is-loading');
        showcase.classList.add('is-playing');
        labels.inert = false;
        updateSensors(video.currentTime);
        trackFrame();
    });
    video.addEventListener('pause', stopTracking);
    video.addEventListener('ended', showSensors);
    video.addEventListener('error', showSensors);
    document.addEventListener('visibilitychange', updatePlayback);
    reducedMotion.addEventListener('change', function() {
        attempted = true;
        showSensors();
    });
    showcase.querySelectorAll('[data-sar-sensor]').forEach(function(button) {
        button.addEventListener('click', function() {
            const key = button.dataset.sarSensor;
            showcase.querySelectorAll('[data-sar-sensor]').forEach(function(sensor) {
                sensor.setAttribute('aria-pressed', String(sensor === button));
            });
            showcase.querySelectorAll('[data-sar-line]').forEach(function(line) {
                line.classList.toggle('is-selected', line.dataset.sarLine === key);
            });
            showcase.querySelector('.sar-detail-label').textContent = sensorDetails[key][0];
            showcase.querySelector('.sar-detail-copy').textContent = sensorDetails[key][1];
        });
    });
    syncSarShowcase(document.querySelector('.page.active'));
});

// Separate the TVAC architecture states as the comparison enters the viewport.
document.addEventListener('DOMContentLoaded', function() {
    const architecture = document.querySelector('.tvac-architecture-grid');
    if (!architecture) return;

    const projectPage = architecture.closest('.page');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = null;

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    function easeInOut(value) {
        return value * value * (3 - (2 * value));
    }

    updateTvacArchitectureScroll = function() {
        if (!projectPage.classList.contains('active')) return;

        if (reducedMotion.matches) {
            architecture.style.setProperty('--tvac-card-left-shift', '0px');
            architecture.style.setProperty('--tvac-card-right-shift', '0px');
            architecture.style.setProperty('--tvac-arrow-opacity', '1');
            architecture.style.setProperty('--tvac-arrow-scale', '1');
            return;
        }

        const bounds = architecture.getBoundingClientRect();
        const animationStart = window.innerHeight * 0.88;
        const animationEnd = window.innerHeight * 0.38;
        const rawProgress = clamp(
            (animationStart - bounds.top) / (animationStart - animationEnd),
            0,
            1
        );
        const separationProgress = easeInOut(rawProgress);
        const arrowProgress = easeInOut(clamp((rawProgress - 0.18) / 0.52, 0, 1));
        const narrowLayout = window.innerWidth <= 700;

        if (narrowLayout) {
            architecture.style.setProperty('--tvac-card-left-shift', '0px');
            architecture.style.setProperty('--tvac-card-right-shift', '0px');
        } else {
            const leftShift = 22 + ((-34 - 22) * separationProgress);
            const rightShift = -22 + ((34 + 22) * separationProgress);
            architecture.style.setProperty('--tvac-card-left-shift', leftShift.toFixed(2) + 'px');
            architecture.style.setProperty('--tvac-card-right-shift', rightShift.toFixed(2) + 'px');
        }

        architecture.style.setProperty('--tvac-arrow-opacity', arrowProgress.toFixed(3));
        architecture.style.setProperty('--tvac-arrow-scale', (0.72 + (0.28 * arrowProgress)).toFixed(3));
    };

    function requestArchitectureUpdate() {
        if (animationFrame !== null) return;

        animationFrame = window.requestAnimationFrame(function() {
            updateTvacArchitectureScroll();
            animationFrame = null;
        });
    }

    window.addEventListener('scroll', requestArchitectureUpdate, { passive: true });
    window.addEventListener('resize', requestArchitectureUpdate);
    reducedMotion.addEventListener('change', requestArchitectureUpdate);
    updateTvacArchitectureScroll();
});

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

// Cycle the two hackathon photographs without adding extra gallery sections.
document.addEventListener('DOMContentLoaded', function() {
    const image = document.getElementById('hackathon-hero-image');
    const caption = document.getElementById('hackathon-hero-caption');
    if (!image || !caption || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const projectPage = image.closest('.page');
    const slides = [
        {
            src: image.dataset.primarySrc,
            alt: image.dataset.primaryAlt,
            caption: image.dataset.primaryCaption,
            isGroupPhoto: false
        },
        {
            src: image.dataset.secondarySrc,
            alt: image.dataset.secondaryAlt,
            caption: image.dataset.secondaryCaption,
            isGroupPhoto: true
        }
    ];
    let currentSlide = 0;

    window.setInterval(function() {
        if (!projectPage.classList.contains('active') || document.hidden) return;

        image.classList.add('is-changing');
        window.setTimeout(function() {
            currentSlide = (currentSlide + 1) % slides.length;
            const nextSlide = slides[currentSlide];
            image.src = nextSlide.src;
            image.alt = nextSlide.alt;
            caption.textContent = nextSlide.caption;
            image.classList.toggle('is-group-photo', nextSlide.isGroupPhoto);
            image.classList.remove('is-changing');
        }, 280);
    }, 6000);
});

// Keep each autonomy image intact while the other cards remain within reach.
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#sar-autonomy .sar-stage-gallery').forEach(function(gallery) {
        const cards = Array.from(gallery.querySelectorAll('.sar-stage-media'));
        const buttons = [];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let currentIndex = 0;
        let inView = false;
        let advanceTimer = null;
        gallery.style.setProperty('--card-count', cards.length);

        function scheduleAdvance() {
            window.clearTimeout(advanceTimer);
            if (!inView || reducedMotion.matches || document.hidden ||
                gallery.matches(':hover, :focus-within')) return;
            advanceTimer = window.setTimeout(function() {
                if (!document.querySelector('#image-lightbox[open]')) {
                    selectCard((currentIndex + 1) % cards.length);
                } else {
                    scheduleAdvance();
                }
            }, 3000);
        }

        function selectCard(activeIndex) {
            currentIndex = activeIndex;
            cards.forEach(function(card, index) {
                const active = index === activeIndex;
                const distance = index - activeIndex;
                card.style.setProperty('--card-offset', index);
                card.style.setProperty('--card-depth', Math.abs(distance));
                card.style.zIndex = cards.length - Math.abs(distance);
                card.classList.toggle('is-active', active);
                buttons[index].setAttribute('aria-pressed', String(active));
                const image = card.querySelector('img');
                image.tabIndex = active ? 0 : -1;
                image.setAttribute('aria-hidden', String(!active));
            });
            scheduleAdvance();
        }

        cards.forEach(function(card, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sar-stack-select';
            const number = document.createElement('span');
            number.textContent = `Image ${index + 1} of ${cards.length}`;
            const label = document.createElement('strong');
            label.textContent = card.dataset.cardLabel;
            button.append(number, label);
            button.setAttribute('aria-label', `Show image ${index + 1}: ${card.dataset.cardLabel}`);
            card.append(button);
            buttons.push(button);
            card.addEventListener('pointerenter', function(event) {
                if (event.pointerType === 'mouse') selectCard(index);
            });
            card.addEventListener('click', function() { selectCard(index); });
            button.addEventListener('focus', function() { selectCard(index); });
            button.addEventListener('keydown', function(event) {
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % cards.length;
                else if (event.key === 'ArrowLeft') next = (index + cards.length - 1) % cards.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = cards.length - 1;
                else return;
                event.preventDefault();
                buttons[next].focus({ preventScroll: true });
            });
        });
        gallery.classList.add('is-stacked');
        selectCard(0);
        gallery.addEventListener('pointerenter', scheduleAdvance);
        gallery.addEventListener('pointerleave', scheduleAdvance);
        gallery.addEventListener('focusin', scheduleAdvance);
        gallery.addEventListener('focusout', function() {
            queueMicrotask(scheduleAdvance);
        });
        document.addEventListener('visibilitychange', scheduleAdvance);
        reducedMotion.addEventListener('change', scheduleAdvance);
        new IntersectionObserver(function(entries) {
            inView = entries[0].isIntersecting;
            scheduleAdvance();
        }, { threshold: 0.25 }).observe(gallery);
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
        image.tabIndex = image.getAttribute('aria-hidden') === 'true' ? -1 : 0;
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
