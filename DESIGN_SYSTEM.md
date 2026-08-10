# Portfolio Design System

This is the internal design reference for this portfolio site. It is deliberately not linked from the public navigation. Read it before making visual, layout, content, or navigation changes.

## Design intent

The site has an Apple-inspired modern editorial feel: calm, precise, spacious, and focused on the work. It should feel considered rather than decorative. Keep the visual language original—do not reproduce Apple layouts, copy, icons, or branded UI patterns.

The portfolio has two related modes:

- **Home and research projects:** bright, quiet, and minimal.
- **Systems projects (Swarm Tracking and ROS 2 Rover):** immersive dark presentations, with the rover using a restrained warm copper accent.

The Portable Vacuum Chamber page stays in the light mode, using cool neutral metal tones, image-led layouts, and a wider editorial canvas for its engineering workflow.

## Foundations

Use the global CSS custom properties in `css/base.css` and project-level custom properties in `css/project-themes.css` rather than introducing one-off colours or fonts.

| Role | Current token/value |
| --- | --- |
| Page background | `--color-bg: #fafafa` |
| Surface | `--color-white: #ffffff` |
| Main text | `--color-text: #1a1a1a` |
| Muted text | `--color-text-muted: #555` |
| Primary accent | `--color-accent: #2997ff` |
| Border | `--color-border: #e0e0e0` |
| Sans-serif type | `--font-main: IBM Plex Sans, -apple-system, sans-serif` |
| Technical labels | `--font-mono: IBM Plex Mono` |

For the rover page, reuse its existing warm dark palette (`#1a1512` / `#231c16`, with copper `#c2783e`) instead of the site-blue accent. Use dark mode only when it helps the project’s story; it is not a default for new pages.

## Layout and components

- Keep the fixed top navigation compact (48px) and the main content within the existing centred content widths.
- Preserve generous whitespace, clear headings, subtle 1px borders, and mostly square corners. Avoid glassy cards, heavy gradients, pill-heavy controls, and large decorative shadows.
- Project cards use an image area, concise metadata, title, description, and a small action cue. Their hover movement is subtle (about 4px) with a soft shadow.
- Use `IBM Plex Mono` sparingly for labels, statuses, metadata, and phase identifiers—not body copy.
- Keep icons simple and functional. Use the existing inline SVG style where an icon is needed.
- Make new interactive controls keyboard reachable with an obvious `:focus-visible` state.

## Shared project-page system

The Portable Vacuum Chamber established the editorial language now shared by every project detail page. New pages should reuse this hierarchy and spacing before adding project-specific styling.

### Page modes

- Every project section uses `page project-page` plus either `project-page--light` or `project-page--dark`.
- Use the light mode for research, analysis, and image-led engineering projects. Task Scheduling, CO2 Prediction, and the Portable Vacuum Chamber are the current references.
- Reserve the dark mode for immersive systems projects where it supports the subject. Swarm Tracking and the ROS 2 Rover are the current references.
- A project may have its own restrained accent colour, but it must keep the shared typefaces, heading hierarchy, spacing rhythm, square geometry, and interaction patterns.

### Editorial header

- Begin with a short `.project-kicker` in `IBM Plex Mono`, followed by the project `h1` and a concise overview or introduction.
- Use `.project-editorial-header` for the standard light-page header. Dark pages may use their existing themed header container but should preserve the same kicker-first hierarchy.
- Project titles use `IBM Plex Sans`, weight 600, tight negative letter spacing, and responsive `clamp()` sizing. Do not introduce a project-specific display font.
- Keep the header and introduction left-aligned unless the project has a strong media-led reason for centring them, as on the Swarm Tracking hero.

### Sections and media

- Use a wide editorial canvas of approximately 1120px, with long-form body copy generally constrained to about 760px.
- Separate major sections with generous vertical spacing and a subtle 1px top border. Prefer this open rhythm over stacks of decorative cards.
- Keep captions concise and use `IBM Plex Mono` for technical or process-oriented image captions.
- Project-detail images use the shared full-screen viewer automatically. Keep them inside `.project-page`, provide useful `alt` text, and use a `<figure>` with `<figcaption>` whenever a visible caption is needed.
- The shared viewer supports pointer and keyboard opening, a close control, native Escape dismissal, and focus return. Do not create a page-specific lightbox.
- Homepage card thumbnails are previews and do not open in the full-screen viewer.

Use this as the starting structure for a new standard project page:

```html
<section id="project-name" class="page project-page project-page--light">
    <nav class="project-nav" aria-label="Project name sections">
        <!-- Section links using data-section -->
    </nav>

    <div class="project-content">
        <div class="project-inner">
            <header class="project-editorial-header project-header">
                <p class="project-kicker">Context &middot; Discipline</p>
                <h1>Project Name</h1>
                <p>Concise explanation of what was built and why.</p>
            </header>

            <!-- Project-specific sections and figures -->
        </div>
    </div>
</section>
```

The generic names in this example describe the intended structure; reuse an established project layout or add narrowly scoped theme classes in `css/project-themes.css` rather than duplicating the shared primitives.

## Motion

Motion should support hierarchy, never call attention to itself:

- Reuse the existing fade-up entrance treatment and short 0.2–0.4s transitions.
- Stagger related content gently; do not add looping or distracting animation.
- Preserve usability for reduced-motion users when adding any new motion.

## Responsive behaviour

- Design desktop-first, then verify 768px and 600px breakpoints.
- The home project grid becomes one column on narrow screens.
- Keep body copy readable without forcing horizontal scrolling. Tables must remain legible on mobile; shorten content before shrinking it excessively.
- Do not rely on hover as the only way to reveal information or controls.

## Content style

- Lead with what was built, the technical problem, and evidence of the work.
- Use clear, direct language and short paragraphs. Avoid marketing clichés and inflated claims.
- Describe delivered capabilities accurately. If a page is intended to showcase completed work only, omit unfinished scope rather than framing it as a feature.
- Write useful image alt text that describes the image, not its filename. 


## Project routes and structure

The site is a static single-page portfolio:

- `index.html` contains the page sections and project content.
- `css/base.css` contains the reset, global tokens, navigation, shared page behaviour, footer, and foundational responsive rules.
- `css/home.css` contains homepage-only hero and project-card styling.
- `css/projects.css` contains shared project navigation, editorial primitives, entrance motion, and the full-screen image viewer.
- `css/project-themes.css` contains project-specific palettes, layouts, section treatments, and responsive adjustments.
- Load the stylesheets in that order so later project themes can deliberately refine shared rules.
- `js/main.js` handles hash routing, light/dark page state, page transitions, section navigation, reveal behaviour, and the shared project-image viewer.
- Images belong in `Pictures/` and should use descriptive filenames.
- Downloadable PDFs belong in `documents/`.
- Portfolio-level MP4s belong in `videos/`; self-contained subprojects should keep their media inside their own asset folders.

Use these canonical project hashes in all new links:

| Project | Canonical hash |
| --- | --- |
| Swarm tracking | `#swarm-tracking` |
| Task scheduling research | `#task-scheduling` |
| CO2 prediction model | `#co2-prediction` |
| ROS 2 rover | `#ai-robot` |
| Portable vacuum chamber | `#portable-vacuum-chamber` |

Legacy `#project1` through `#project4` links are supported in `js/main.js`. Do not remove that compatibility without migrating existing public links. New project IDs should be descriptive, lowercase, and hyphenated.

When adding a project, add its canonical ID to `VALID_PAGES`, add it to `DARK_PAGES` only when it uses the dark mode, create its top-navigation link, and use the same ID for the page section and public hash.

## Before handing off a change

1. Start new project pages with `project-page`, a light/dark modifier, the editorial kicker/title hierarchy, and the shared section patterns.
2. Check navigation from Home to every project and direct loading of the project hash.
3. Confirm project images open in the shared viewer by mouse and keyboard, show the correct caption, and return focus when closed.
4. Inspect the change at desktop, 768px, and 600px-or-narrower widths.
5. Run `node --check js/main.js` after JavaScript changes and `git diff --check` before handoff.
6. Confirm the browser console has no new errors or warnings.
