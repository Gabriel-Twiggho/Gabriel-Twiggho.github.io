# Portfolio Design System

This is the internal design reference for this portfolio site. It is deliberately not linked from the public navigation. Read it before making visual, layout, content, or navigation changes.

## Design intent

The site has an Apple-inspired modern editorial feel: calm, precise, spacious, and focused on the work. It should feel considered rather than decorative. Keep the visual language original—do not reproduce Apple layouts, copy, icons, or branded UI patterns.

The portfolio has two related modes:

- **Home and research projects:** bright, quiet, and minimal.
- **Systems projects (Swarm Tracking and ROS 2 Rover):** immersive dark presentations, with the rover using a restrained warm copper accent.

The Portable Vacuum Chamber page stays in the light mode, using cool neutral metal tones, image-led layouts, and a wider editorial canvas for its engineering workflow.

## Foundations

Use the existing CSS custom properties in `css/styles.css` rather than introducing one-off colours or fonts.

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
- `css/styles.css` contains all styles and responsive rules.
- `js/main.js` handles hash routing and page transitions.
- Images belong in `Pictures/` and should use descriptive filenames.

Use these canonical project hashes in all new links:

| Project | Canonical hash |
| --- | --- |
| Swarm tracking | `#swarm-tracking` |
| Task scheduling research | `#task-scheduling` |
| CO2 prediction model | `#co2-prediction` |
| ROS 2 rover | `#ai-robot` |
| Portable vacuum chamber | `#portable-vacuum-chamber` |

Legacy `#project1` through `#project4` links are supported in `js/main.js`. Do not remove that compatibility without migrating existing public links. New project IDs should be descriptive, lowercase, and hyphenated.

## Before handing off a change

1. Reuse an existing class, token, or component pattern where possible.
2. Check navigation from Home to every project and direct loading of the project hash.
3. Inspect the change at desktop and mobile widths.
4. Run `node --check js/main.js` after JavaScript changes and `git diff --check` before handoff.
5. Confirm the browser console has no new errors or warnings.
