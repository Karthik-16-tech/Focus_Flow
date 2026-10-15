# FocusFlow homepage

Rebuild the home screen to match the supplied FocusFlow reference, using the uploaded video as the actual full-frame background.

## What will change
- Replace the placeholder at `/` with the full-screen FocusFlow hero, floating glass navigation, headline, and two calls to action.
- Use the original 1920 × 1080 video without cropping, stretching, or autoplay; add pointer-controlled, bidirectional scrubbing that prioritizes the newest pointer position.
- Keep the 16:9 video frame intact on narrow screens, with a restrained background fill around it when the screen has a different aspect ratio.
- Add route-specific page metadata and check the result at desktop and mobile sizes.

## Technical details
- Keep the page UI and pointer-seek behavior local to the home route; store the uploaded video and opening-frame poster through the project’s asset flow.
- Use existing semantic design tokens and the project’s Button component for interactive controls.
